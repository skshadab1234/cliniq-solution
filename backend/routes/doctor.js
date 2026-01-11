const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Token, Queue, Patient, DoctorAssistant, User } = require('../models')
const { authenticate, requireApproved, requireRole } = require('../middleware/auth')

// Helper to get today's date
const getToday = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Get doctor's queue
const getDoctorQueue = async (userId, role) => {
  const today = getToday()
  let doctorId = userId

  if (role === 'assistant') {
    const assignment = await DoctorAssistant.findOne({
      where: { assistantId: userId, isActive: true }
    })
    if (assignment) {
      doctorId = assignment.doctorId
    }
  }

  return Queue.findOne({
    where: { doctorId, date: today }
  })
}

// POST /api/doctor/call-next - Call next patient
router.post('/call-next', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await getDoctorQueue(req.user.id, req.user.role)

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'No queue for today',
        code: 'NOT_FOUND'
      })
    }

    if (queue.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Queue is closed',
        code: 'QUEUE_CLOSED'
      })
    }

    if (queue.status === 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Queue is paused',
        code: 'QUEUE_PAUSED'
      })
    }

    // Check if there's already a patient in progress
    const inProgress = await Token.findOne({
      where: { queueId: queue.id, status: 'in_progress' }
    })

    if (inProgress) {
      return res.status(400).json({
        success: false,
        message: 'Complete current consultation first',
        currentToken: inProgress,
        code: 'PATIENT_IN_PROGRESS'
      })
    }

    // Get next waiting patient (by position, emergency first)
    const nextToken = await Token.findOne({
      where: { queueId: queue.id, status: 'waiting' },
      include: [{ model: Patient, as: 'patient' }],
      order: [
        ['isEmergency', 'DESC'],
        ['position', 'ASC']
      ]
    })

    if (!nextToken) {
      return res.status(404).json({
        success: false,
        message: 'No patients waiting',
        code: 'NO_PATIENTS'
      })
    }

    // Update token status
    await nextToken.update({
      status: 'called',
      calledAt: new Date()
    })

    // Update queue current token
    await queue.update({ currentTokenId: nextToken.id })

    // Get remaining waiting count
    const waitingCount = await Token.count({
      where: { queueId: queue.id, status: 'waiting' }
    })

    // Reload token
    const token = await Token.findByPk(nextToken.id, {
      include: [{ model: Patient, as: 'patient' }]
    })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue.id}`).emit('token:called', {
        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        patientName: token.patient.name,
        isEmergency: token.isEmergency
      })
    }

    res.json({
      success: true,
      token,
      waitingCount,
      message: `Calling token #${token.tokenNumber}`
    })
  } catch (error) {
    console.error('Call next error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/doctor/start - Start consultation
router.post('/start', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await getDoctorQueue(req.user.id, req.user.role)

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'No queue for today',
        code: 'NOT_FOUND'
      })
    }

    if (!queue.currentTokenId) {
      return res.status(400).json({
        success: false,
        message: 'No patient called. Call next first.',
        code: 'NO_CURRENT_PATIENT'
      })
    }

    const token = await Token.findByPk(queue.currentTokenId, {
      include: [{ model: Patient, as: 'patient' }]
    })

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Current token not found',
        code: 'NOT_FOUND'
      })
    }

    if (token.status !== 'called') {
      return res.status(400).json({
        success: false,
        message: 'Patient not in called state',
        code: 'INVALID_STATUS'
      })
    }

    await token.update({
      status: 'in_progress',
      startedAt: new Date()
    })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue.id}`).emit('token:status', {
        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        status: 'in_progress'
      })
    }

    res.json({
      success: true,
      token,
      message: 'Consultation started'
    })
  } catch (error) {
    console.error('Start consultation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/doctor/complete - Complete consultation
router.post('/complete', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await getDoctorQueue(req.user.id, req.user.role)

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'No queue for today',
        code: 'NOT_FOUND'
      })
    }

    if (!queue.currentTokenId) {
      return res.status(400).json({
        success: false,
        message: 'No patient in consultation',
        code: 'NO_CURRENT_PATIENT'
      })
    }

    const token = await Token.findByPk(queue.currentTokenId, {
      include: [{ model: Patient, as: 'patient' }]
    })

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Current token not found',
        code: 'NOT_FOUND'
      })
    }

    if (token.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'No consultation in progress',
        code: 'INVALID_STATUS'
      })
    }

    await token.update({
      status: 'completed',
      completedAt: new Date()
    })

    // Clear current token from queue
    await queue.update({ currentTokenId: null })

    // Get remaining waiting count
    const waitingCount = await Token.count({
      where: { queueId: queue.id, status: 'waiting' }
    })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue.id}`).emit('token:status', {
        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        status: 'completed'
      })
    }

    res.json({
      success: true,
      token,
      waitingCount,
      message: 'Consultation completed'
    })
  } catch (error) {
    console.error('Complete consultation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/doctor/current - Get current patient
router.get('/current', authenticate, requireApproved, async (req, res) => {
  try {
    const queue = await getDoctorQueue(req.user.id, req.user.role)

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'No queue for today',
        code: 'NOT_FOUND'
      })
    }

    let currentToken = null
    if (queue.currentTokenId) {
      currentToken = await Token.findByPk(queue.currentTokenId, {
        include: [{ model: Patient, as: 'patient' }]
      })
    }

    // Get next waiting
    const nextToken = await Token.findOne({
      where: { queueId: queue.id, status: 'waiting' },
      include: [{ model: Patient, as: 'patient' }],
      order: [
        ['isEmergency', 'DESC'],
        ['position', 'ASC']
      ]
    })

    // Get waiting count
    const waitingCount = await Token.count({
      where: { queueId: queue.id, status: 'waiting' }
    })

    res.json({
      success: true,
      queueStatus: queue.status,
      currentToken,
      nextToken,
      waitingCount
    })
  } catch (error) {
    console.error('Get current error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/doctor/assistants - Get doctor's assigned assistants
router.get('/assistants', authenticate, requireApproved, requireRole('doctor'), async (req, res) => {
  try {
    const doctorId = req.user.id

    // Get all active assistant assignments for this doctor
    const assignments = await DoctorAssistant.findAll({
      where: { doctorId, isActive: true },
      include: [{
        model: User,
        as: 'assistant',
        attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    })

    const assistants = assignments.map(a => ({
      id: a.assistant.id,
      name: a.assistant.name,
      email: a.assistant.email,
      phone: a.assistant.phone,
      status: a.assistant.status,
      assignedAt: a.createdAt
    }))

    res.json({
      success: true,
      assistants,
      count: assistants.length
    })
  } catch (error) {
    console.error('Get assistants error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
