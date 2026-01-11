const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Patient, Token, Queue } = require('../models')
const { authenticate, requireApproved } = require('../middleware/auth')

// GET /api/patients - Search patients
router.get('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { phone, name, limit = 10 } = req.query

    if (!phone && !name) {
      return res.status(400).json({
        success: false,
        message: 'phone or name query parameter is required',
        code: 'VALIDATION_ERROR'
      })
    }

    const where = {}
    if (phone) {
      where.phone = { [Op.iLike]: `%${phone}%` }
    }
    if (name) {
      where.name = { [Op.iLike]: `%${name}%` }
    }

    const patients = await Patient.findAll({
      where,
      limit: parseInt(limit),
      order: [['updatedAt', 'DESC']]
    })

    // Get last visit for each patient
    const patientsWithLastVisit = await Promise.all(
      patients.map(async (patient) => {
        const lastToken = await Token.findOne({
          where: { patientId: patient.id, status: 'completed' },
          order: [['completedAt', 'DESC']],
          include: [{
            model: Queue,
            as: 'queue',
            attributes: ['date']
          }]
        })

        return {
          ...patient.toJSON(),
          lastVisit: lastToken ? lastToken.queue?.date : null
        }
      })
    )

    res.json({
      success: true,
      patients: patientsWithLastVisit
    })
  } catch (error) {
    console.error('Search patients error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/patients/:id - Get patient by ID
router.get('/:id', authenticate, requireApproved, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id)

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        code: 'NOT_FOUND'
      })
    }

    // Get visit history
    const tokens = await Token.findAll({
      where: { patientId: patient.id, status: 'completed' },
      include: [{
        model: Queue,
        as: 'queue',
        attributes: ['date', 'doctorId']
      }],
      order: [['completedAt', 'DESC']],
      limit: 10
    })

    res.json({
      success: true,
      patient: {
        ...patient.toJSON(),
        visitHistory: tokens.map(t => ({
          date: t.queue?.date,
          tokenNumber: t.tokenNumber,
          completedAt: t.completedAt
        }))
      }
    })
  } catch (error) {
    console.error('Get patient error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/patients - Create patient
router.post('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { name, phone } = req.body

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'name and phone are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if phone already exists
    const existing = await Patient.findOne({ where: { phone } })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Patient with this phone already exists',
        patient: existing,
        code: 'CONFLICT'
      })
    }

    const patient = await Patient.create({ name, phone })

    res.status(201).json({
      success: true,
      patient
    })
  } catch (error) {
    console.error('Create patient error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/patients/:id - Update patient
router.patch('/:id', authenticate, requireApproved, async (req, res) => {
  try {
    const { name, phone } = req.body

    const patient = await Patient.findByPk(req.params.id)
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        code: 'NOT_FOUND'
      })
    }

    // Check phone uniqueness if changing
    if (phone && phone !== patient.phone) {
      const existing = await Patient.findOne({ where: { phone } })
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already in use',
          code: 'CONFLICT'
        })
      }
    }

    await patient.update({
      name: name || patient.name,
      phone: phone || patient.phone
    })

    res.json({
      success: true,
      patient
    })
  } catch (error) {
    console.error('Update patient error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
