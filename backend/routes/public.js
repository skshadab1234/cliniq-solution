const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Token, Queue, Patient, Clinic, User } = require('../models')

// GET /api/public/queue/:id - Get live queue state (no auth)
router.get('/queue/:id', async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id, {
      include: [
        { model: Clinic, as: 'clinic', attributes: ['id', 'name', 'address'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] }
      ]
    })

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
        code: 'NOT_FOUND'
      })
    }

    // Get tokens (only public info)
    const tokens = await Token.findAll({
      where: {
        queueId: queue.id,
        status: { [Op.in]: ['waiting', 'called', 'in_progress'] }
      },
      attributes: ['id', 'tokenNumber', 'status', 'isEmergency', 'position'],
      order: [['position', 'ASC']]
    })

    // Get current token
    let currentToken = null
    if (queue.currentTokenId) {
      currentToken = await Token.findByPk(queue.currentTokenId, {
        attributes: ['id', 'tokenNumber', 'status']
      })
    }

    // Calculate waiting count
    const waitingCount = tokens.filter(t => t.status === 'waiting').length

    res.json({
      success: true,
      clinicName: queue.clinic?.name,
      doctorName: queue.doctor?.name,
      status: queue.status,
      currentToken: currentToken ? {
        tokenNumber: currentToken.tokenNumber,
        status: currentToken.status
      } : null,
      waitingCount,
      tokens: tokens.map(t => ({
        tokenNumber: t.tokenNumber,
        status: t.status,
        isEmergency: t.isEmergency
      }))
    })
  } catch (error) {
    console.error('Get public queue error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/public/token/:id - Get specific token status (no auth)
router.get('/token/:id', async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id, {
      include: [{
        model: Queue,
        as: 'queue',
        include: [
          { model: Clinic, as: 'clinic', attributes: ['name'] },
          { model: User, as: 'doctor', attributes: ['name'] }
        ]
      }]
    })

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
        code: 'NOT_FOUND'
      })
    }

    // Get current token in queue
    let currentTokenNumber = null
    if (token.queue.currentTokenId) {
      const currentToken = await Token.findByPk(token.queue.currentTokenId)
      if (currentToken) {
        currentTokenNumber = currentToken.tokenNumber
      }
    }

    // Calculate position
    let position = null
    if (token.status === 'waiting') {
      const aheadCount = await Token.count({
        where: {
          queueId: token.queueId,
          status: 'waiting',
          position: { [require('sequelize').Op.lt]: token.position }
        }
      })
      position = aheadCount + 1
    }

    // Estimate wait time (rough: 5 min per patient)
    let estimatedWait = null
    if (position) {
      const mins = position * 5
      if (mins < 60) {
        estimatedWait = `~${mins} minutes`
      } else {
        const hours = Math.floor(mins / 60)
        const remainingMins = mins % 60
        estimatedWait = `~${hours}h ${remainingMins}m`
      }
    }

    res.json({
      success: true,
      tokenNumber: token.tokenNumber,
      status: token.status,
      isEmergency: token.isEmergency,
      position,
      currentToken: currentTokenNumber,
      estimatedWait,
      queueStatus: token.queue.status,
      clinicName: token.queue.clinic?.name,
      doctorName: token.queue.doctor?.name,
      createdAt: token.createdAt
    })
  } catch (error) {
    console.error('Get public token error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
