const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Queue, Token, Patient, Clinic, User, ClinicDoctor, DoctorAssistant } = require('../models')
const { authenticate, requireApproved } = require('../middleware/auth')

// Helper to get today's date
const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const sendHumanReadableSequelizeError = (res, error) => {
  if (error && (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError')) {
    const message = Array.isArray(error.errors) && error.errors.length
      ? error.errors.map(e => e.message).join(', ')
      : 'Validation error'

    return res.status(400).json({
      success: false,
      message,
      code: 'VALIDATION_ERROR'
    })
  }

  if (error && error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'A record with these details already exists',
      code: 'DUPLICATE_RECORD'
    })
  }

  return null
}

// POST /api/queues - Create or get today's queue
router.post('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { clinicId, doctorId } = req.body
    const today = getToday()

    // Determine doctor based on role
    let targetDoctorId = doctorId

    if (req.user.role === 'doctor') {
      targetDoctorId = req.user.id
    } else if (req.user.role === 'assistant') {
      // Assistant must specify doctorId or we use their first assigned doctor
      if (!doctorId) {
        const assignment = await DoctorAssistant.findOne({
          where: { assistantId: req.user.id, isActive: true }
        })
        if (!assignment) {
          return res.status(400).json({
            success: false,
            message: 'No doctor assigned to this assistant',
            code: 'NO_DOCTOR_ASSIGNED'
          })
        }
        targetDoctorId = assignment.doctorId
      }
    }

    if (!targetDoctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId is required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Get clinic from doctor's assignment if not provided
    let targetClinicId = clinicId
    if (!targetClinicId) {
      const clinicAssignment = await ClinicDoctor.findOne({
        where: { userId: targetDoctorId, isActive: true }
      })
      if (clinicAssignment) {
        targetClinicId = clinicAssignment.clinicId
      }
    }

    if (!targetClinicId) {
      return res.status(400).json({
        success: false,
        message: 'clinicId is required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if queue exists for today
    let queue = await Queue.findOne({
      where: {
        clinicId: targetClinicId,
        doctorId: targetDoctorId,
        date: today
      },
      include: [
        { model: Clinic, as: 'clinic' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
        {
          model: Token,
          as: 'tokens',
          include: [{ model: Patient, as: 'patient' }],
          order: [['position', 'ASC']]
        }
      ]
    })

    if (queue) {
      // Return existing queue
      return res.json({
        success: true,
        queue,
        isNew: false
      })
    }

    // Close any previous open queues for this doctor
    await Queue.update(
      { status: 'closed' },
      {
        where: {
          doctorId: targetDoctorId,
          status: { [Op.ne]: 'closed' },
          date: { [Op.lt]: today }
        }
      }
    )

    // Create new queue
    queue = await Queue.create({
      clinicId: targetClinicId,
      doctorId: targetDoctorId,
      date: today,
      status: 'open',
      lastTokenNumber: 0
    })

    // Reload with associations
    queue = await Queue.findByPk(queue.id, {
      include: [
        { model: Clinic, as: 'clinic' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
        { model: Token, as: 'tokens' }
      ]
    })

    res.status(201).json({
      success: true,
      queue,
      isNew: true
    })
  } catch (error) {
    console.error('Create queue error:', error)

    const handled = sendHumanReadableSequelizeError(res, error)
    if (handled) return

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/queues/today - Get today's queue
router.get('/today', authenticate, requireApproved, async (req, res) => {
  try {
    const today = getToday()
    let doctorId = req.user.id

    // If assistant, get assigned doctor
    if (req.user.role === 'assistant') {
      const doctorIdParam = req.query.doctorId
      if (doctorIdParam) {
        doctorId = doctorIdParam
      } else {
        const assignment = await DoctorAssistant.findOne({
          where: { assistantId: req.user.id, isActive: true }
        })
        if (!assignment) {
          return res.status(400).json({
            success: false,
            message: 'No doctor assigned',
            code: 'NO_DOCTOR_ASSIGNED'
          })
        }
        doctorId = assignment.doctorId
      }
    }

    const queue = await Queue.findOne({
      where: { doctorId, date: today },
      include: [
        { model: Clinic, as: 'clinic' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
        {
          model: Token,
          as: 'tokens',
          include: [{ model: Patient, as: 'patient' }],
          order: [['position', 'ASC']]
        },
        {
          model: Token,
          as: 'currentToken',
          include: [{ model: Patient, as: 'patient' }]
        }
      ]
    })

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'No queue for today. Create one first.',
        code: 'NOT_FOUND'
      })
    }

    // Calculate stats
    const tokens = queue.tokens || []
    const stats = {
      total: tokens.length,
      waiting: tokens.filter(t => t.status === 'waiting').length,
      completed: tokens.filter(t => t.status === 'completed').length,
      inProgress: tokens.filter(t => t.status === 'in_progress').length,
      skipped: tokens.filter(t => t.status === 'skipped').length,
      noShow: tokens.filter(t => t.status === 'no_show').length
    }

    res.json({
      success: true,
      queue,
      stats
    })
  } catch (error) {
    console.error('Get today queue error:', error)

    const handled = sendHumanReadableSequelizeError(res, error)
    if (handled) return

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/queues/:id - Get queue by ID
router.get('/:id', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id, {
      include: [
        { model: Clinic, as: 'clinic' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
        {
          model: Token,
          as: 'tokens',
          include: [{ model: Patient, as: 'patient' }],
          order: [['position', 'ASC']]
        }
      ]
    })

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
        code: 'NOT_FOUND'
      })
    }

    res.json({ success: true, queue })
  } catch (error) {
    console.error('Get queue error:', error)

    const handled = sendHumanReadableSequelizeError(res, error)
    if (handled) return

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/queues/:id/pause - Pause queue
router.patch('/:id/pause', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id)

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
        code: 'NOT_FOUND'
      })
    }

    if (queue.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pause a closed queue',
        code: 'QUEUE_CLOSED'
      })
    }

    await queue.update({ status: 'paused' })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue.id}`).emit('queue:paused', { queueId: queue.id })
    }

    res.json({
      success: true,
      queue: { id: queue.id, status: 'paused' },
      message: 'Queue paused'
    })
  } catch (error) {
    console.error('Pause queue error:', error)

    const handled = sendHumanReadableSequelizeError(res, error)
    if (handled) return

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/queues/:id/resume - Resume queue
router.patch('/:id/resume', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id)

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
        code: 'NOT_FOUND'
      })
    }

    if (queue.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot resume a closed queue',
        code: 'QUEUE_CLOSED'
      })
    }

    await queue.update({ status: 'open' })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue.id}`).emit('queue:resumed', { queueId: queue.id })
    }

    res.json({
      success: true,
      queue: { id: queue.id, status: 'open' },
      message: 'Queue resumed'
    })
  } catch (error) {
    console.error('Resume queue error:', error)

    const handled = sendHumanReadableSequelizeError(res, error)
    if (handled) return

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/queues/:id/close - Close queue
router.patch('/:id/close', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id, {
      include: [{ model: Token, as: 'tokens' }]
    })

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
        code: 'NOT_FOUND'
      })
    }

    // Mark remaining waiting tokens as cancelled
    await Token.update(
      { status: 'cancelled' },
      {
        where: {
          queueId: queue.id,
          status: 'waiting'
        }
      }
    )

    await queue.update({ status: 'closed', currentTokenId: null })

    // Calculate final stats
    const tokens = await Token.findAll({ where: { queueId: queue.id } })
    const stats = {
      total: tokens.length,
      completed: tokens.filter(t => t.status === 'completed').length,
      noShow: tokens.filter(t => t.status === 'no_show').length,
      skipped: tokens.filter(t => t.status === 'skipped').length,
      cancelled: tokens.filter(t => t.status === 'cancelled').length
    }

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue.id}`).emit('queue:closed', { queueId: queue.id, stats })
    }

    res.json({
      success: true,
      queue: { id: queue.id, status: 'closed' },
      stats,
      message: 'Queue closed'
    })
  } catch (error) {
    console.error('Close queue error:', error)

    const handled = sendHumanReadableSequelizeError(res, error)
    if (handled) return

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/queues/:id/reopen - Reopen a closed queue
router.patch('/:id/reopen', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id)

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
        code: 'NOT_FOUND'
      })
    }

    if (queue.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Queue is not closed',
        code: 'QUEUE_NOT_CLOSED'
      })
    }

    // Only allow reopening today's queue
    const today = getToday()
    if (queue.date !== today) {
      return res.status(400).json({
        success: false,
        message: 'Can only reopen today\'s queue',
        code: 'CANNOT_REOPEN_OLD_QUEUE'
      })
    }

    // Restore cancelled tokens back to waiting (tokens that were cancelled when queue closed)
    await Token.update(
      { status: 'waiting' },
      {
        where: {
          queueId: queue.id,
          status: 'cancelled'
        }
      }
    )

    await queue.update({ status: 'open' })

    // Get updated stats
    const tokens = await Token.findAll({ where: { queueId: queue.id } })
    const stats = {
      total: tokens.length,
      waiting: tokens.filter(t => t.status === 'waiting').length,
      completed: tokens.filter(t => t.status === 'completed').length,
      inProgress: tokens.filter(t => t.status === 'in_progress').length,
      skipped: tokens.filter(t => t.status === 'skipped').length,
      noShow: tokens.filter(t => t.status === 'no_show').length
    }

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue.id}`).emit('queue:reopened', { queueId: queue.id, stats })
    }

    res.json({
      success: true,
      queue: { id: queue.id, status: 'open' },
      stats,
      message: 'Queue reopened successfully'
    })
  } catch (error) {
    console.error('Reopen queue error:', error)

    const handled = sendHumanReadableSequelizeError(res, error)
    if (handled) return

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
