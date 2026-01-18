const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Token, Queue, Patient, DoctorAssistant, User, Prescription } = require('../models')
const { authenticate, requireApproved, requireRole } = require('../middleware/auth')

// Helper to get today's date (local time)
const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

// Helper to format phone for WhatsApp (Indian format)
const formatPhoneForWhatsApp = (phone) => {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '')
  // If starts with 0, remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  // If 10 digits, add India country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned
  }
  // If starts with +91, remove +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }
  return cleaned
}

// Helper to generate WhatsApp message
const generatePrescriptionMessage = (prescription, patient, doctor) => {
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  let message = `*Prescription*\n`
  message += `Date: ${date}\n`
  message += `Patient: ${patient.name}\n`
  message += `Doctor: Dr. ${doctor.name}\n\n`
  message += `*Medicines:*\n`

  prescription.medicines.forEach((med, index) => {
    message += `${index + 1}. ${med.name}\n`
    message += `   Dosage: ${med.dosage}\n`
    message += `   Duration: ${med.duration}\n`
    if (med.instructions) {
      message += `   ${med.instructions}\n`
    }
    message += `\n`
  })

  if (prescription.notes) {
    message += `*Notes:* ${prescription.notes}\n`
  }

  return message
}

// POST /api/doctor/prescription - Create prescription
router.post('/prescription', authenticate, requireApproved, requireRole('doctor'), async (req, res) => {
  try {
    const { tokenId, medicines, notes, sendWhatsApp } = req.body
    const doctorId = req.user.id

    if (!tokenId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token ID and at least one medicine are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Get token with patient info
    const token = await Token.findByPk(tokenId, {
      include: [{ model: Patient, as: 'patient' }]
    })

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
        code: 'NOT_FOUND'
      })
    }

    // Check if prescription already exists for this token
    let prescription = await Prescription.findOne({
      where: { tokenId }
    })

    if (prescription) {
      // Update existing prescription
      await prescription.update({
        medicines,
        notes: notes || null,
        sentViaWhatsApp: sendWhatsApp || prescription.sentViaWhatsApp
      })
    } else {
      // Create new prescription
      prescription = await Prescription.create({
        tokenId,
        patientId: token.patientId,
        doctorId,
        medicines,
        notes: notes || null,
        sentViaWhatsApp: sendWhatsApp || false
      })
    }

    // Generate WhatsApp URL if requested
    let whatsAppUrl = null
    if (sendWhatsApp && token.patient?.phone) {
      const doctor = await User.findByPk(doctorId)
      const message = generatePrescriptionMessage(
        { medicines, notes },
        token.patient,
        doctor
      )
      const formattedPhone = formatPhoneForWhatsApp(token.patient.phone)
      whatsAppUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    }

    // Reload prescription with associations
    const fullPrescription = await Prescription.findByPk(prescription.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    res.json({
      success: true,
      prescription: fullPrescription,
      whatsAppUrl,
      message: 'Prescription saved successfully'
    })
  } catch (error) {
    console.error('Create prescription error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/doctor/prescription/:tokenId - Get prescription for a token
router.get('/prescription/:tokenId', authenticate, requireApproved, async (req, res) => {
  try {
    const { tokenId } = req.params

    const prescription = await Prescription.findOne({
      where: { tokenId },
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    res.json({
      success: true,
      prescription
    })
  } catch (error) {
    console.error('Get prescription error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/doctor/patient/:patientId/prescriptions - Get patient's prescription history
router.get('/patient/:patientId/prescriptions', authenticate, requireApproved, async (req, res) => {
  try {
    const { patientId } = req.params

    const prescriptions = await Prescription.findAll({
      where: { patientId },
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
        {
          model: Token,
          as: 'token',
          attributes: ['id', 'tokenNumber', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10 // Last 10 prescriptions
    })

    res.json({
      success: true,
      prescriptions,
      count: prescriptions.length
    })
  } catch (error) {
    console.error('Get patient prescriptions error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
