const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Token, Queue, Patient, User } = require('../models')
const { authenticate, requireApproved } = require('../middleware/auth')

// POST /api/tokens - Add patient to queue
router.post('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { queueId, patientId, patientName, patientPhone, isEmergency = false } = req.body

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'queueId is required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Get queue
    const queue = await Queue.findByPk(queueId)
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
        message: 'Queue is closed',
        code: 'QUEUE_CLOSED'
      })
    }

    // Get or create patient
    let patient
    if (patientId) {
      patient = await Patient.findByPk(patientId)
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
          code: 'NOT_FOUND'
        })
      }
    } else if (patientPhone) {
      // Try to find existing patient by phone
      patient = await Patient.findOne({ where: { phone: patientPhone } })
      if (!patient) {
        if (!patientName) {
          return res.status(400).json({
            success: false,
            message: 'patientName is required for new patients',
            code: 'VALIDATION_ERROR'
          })
        }
        patient = await Patient.create({ name: patientName, phone: patientPhone })
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'patientId or patientPhone is required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if patient already has a waiting token in this queue
    const existingToken = await Token.findOne({
      where: {
        queueId,
        patientId: patient.id,
        status: { [Op.in]: ['waiting', 'called', 'in_progress'] }
      }
    })

    if (existingToken) {
      return res.status(409).json({
        success: false,
        message: 'Patient already in queue',
        token: existingToken,
        code: 'CONFLICT'
      })
    }

    // Get next token number
    const tokenNumber = queue.lastTokenNumber + 1

    // Calculate position
    let position
    if (isEmergency) {
      // Emergency goes to top of waiting queue (after current in_progress)
      const inProgressToken = await Token.findOne({
        where: { queueId, status: 'in_progress' }
      })

      if (inProgressToken) {
        position = inProgressToken.position + 1
      } else {
        position = 1
      }

      // Shift other waiting tokens down
      await Token.increment('position', {
        by: 1,
        where: {
          queueId,
          status: 'waiting',
          position: { [Op.gte]: position }
        }
      })
    } else {
      // Regular patient goes to end of queue
      const maxPosition = await Token.max('position', { where: { queueId } })
      position = (maxPosition || 0) + 1
    }

    // Create token
    const token = await Token.create({
      queueId,
      patientId: patient.id,
      tokenNumber,
      status: 'waiting',
      isEmergency,
      position
    })

    // Update queue last token number
    await queue.update({ lastTokenNumber: tokenNumber })

    // Reload token with patient
    const tokenWithPatient = await Token.findByPk(token.id, {
      include: [{ model: Patient, as: 'patient' }]
    })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queueId}`).emit('token:added', { token: tokenWithPatient })
    }

    res.status(201).json({
      success: true,
      token: tokenWithPatient,
      queueUrl: `/q/${token.id}`
    })
  } catch (error) {
    console.error('Create token error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/tokens - List tokens in queue
router.get('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { queueId, status } = req.query

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'queueId is required',
        code: 'VALIDATION_ERROR'
      })
    }

    const where = { queueId }
    if (status) {
      where.status = status
    }

    const tokens = await Token.findAll({
      where,
      include: [{ model: Patient, as: 'patient' }],
      order: [['position', 'ASC']]
    })

    res.json({
      success: true,
      tokens,
      total: tokens.length
    })
  } catch (error) {
    console.error('List tokens error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/tokens/:id/skip - Skip patient
router.patch('/:id/skip', authenticate, requireApproved, async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id, {
      include: [{ model: Patient, as: 'patient' }]
    })

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
        code: 'NOT_FOUND'
      })
    }

    if (!['waiting', 'called'].includes(token.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only skip waiting or called patients',
        code: 'INVALID_STATUS'
      })
    }

    await token.update({ status: 'skipped' })

    // Update queue current token if this was the current one
    const queue = await Queue.findByPk(token.queueId)
    if (queue && queue.currentTokenId === token.id) {
      await queue.update({ currentTokenId: null })
    }

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${token.queueId}`).emit('token:status', {
        tokenId: token.id,
        status: 'skipped',
        tokenNumber: token.tokenNumber
      })
    }

    res.json({
      success: true,
      token,
      message: 'Patient skipped'
    })
  } catch (error) {
    console.error('Skip token error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/tokens/:id/noshow - Mark as no-show
router.patch('/:id/noshow', authenticate, requireApproved, async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id, {
      include: [{ model: Patient, as: 'patient' }]
    })

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
        code: 'NOT_FOUND'
      })
    }

    if (!['waiting', 'called'].includes(token.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only mark waiting or called patients as no-show',
        code: 'INVALID_STATUS'
      })
    }

    await token.update({ status: 'no_show' })

    // Update queue current token if this was the current one
    const queue = await Queue.findByPk(token.queueId)
    if (queue && queue.currentTokenId === token.id) {
      await queue.update({ currentTokenId: null })
    }

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${token.queueId}`).emit('token:status', {
        tokenId: token.id,
        status: 'no_show',
        tokenNumber: token.tokenNumber
      })
    }

    res.json({
      success: true,
      token,
      message: 'Marked as no-show'
    })
  } catch (error) {
    console.error('No-show token error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/tokens/:id/readd - Re-add skipped patient
router.patch('/:id/readd', authenticate, requireApproved, async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id, {
      include: [{ model: Patient, as: 'patient' }]
    })

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
        code: 'NOT_FOUND'
      })
    }

    if (token.status !== 'skipped') {
      return res.status(400).json({
        success: false,
        message: 'Can only re-add skipped patients',
        code: 'INVALID_STATUS'
      })
    }

    // Add to end of queue
    const maxPosition = await Token.max('position', { where: { queueId: token.queueId } })
    await token.update({
      status: 'waiting',
      position: (maxPosition || 0) + 1
    })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${token.queueId}`).emit('token:status', {
        tokenId: token.id,
        status: 'waiting',
        tokenNumber: token.tokenNumber,
        position: token.position
      })
    }

    res.json({
      success: true,
      token,
      message: 'Patient re-added to queue'
    })
  } catch (error) {
    console.error('Re-add token error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// DELETE /api/tokens/:id - Cancel token
router.delete('/:id', authenticate, requireApproved, async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id)

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
        code: 'NOT_FOUND'
      })
    }

    const queueId = token.queueId
    const tokenNumber = token.tokenNumber

    await token.update({ status: 'cancelled' })

    // Update queue current token if this was the current one
    const queue = await Queue.findByPk(queueId)
    if (queue && queue.currentTokenId === token.id) {
      await queue.update({ currentTokenId: null })
    }

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queueId}`).emit('token:cancelled', {
        tokenId: token.id,
        tokenNumber
      })
    }

    res.json({
      success: true,
      message: 'Token cancelled'
    })
  } catch (error) {
    console.error('Cancel token error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
