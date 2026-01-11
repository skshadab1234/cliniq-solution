const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { User, ClinicDoctor, DoctorAssistant, Clinic } = require('../models')

// POST /api/auth/verify - Verify Clerk user and get JWT
router.post('/verify', async (req, res) => {
  try {
    const { clerkId, email, name, phone } = req.body

    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: 'clerkId is required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Find user by Clerk ID
    let user = await User.findOne({ where: { clerkId } })

    if (!user) {
      // User not registered in our system
      return res.status(404).json({
        success: false,
        message: 'User not registered',
        action: 'register',
        code: 'NOT_FOUND'
      })
    }

    // Check user status
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Account pending admin approval',
        status: 'pending',
        code: 'PENDING_APPROVAL'
      })
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Account blocked',
        status: 'blocked',
        code: 'BLOCKED'
      })
    }

    // Get additional user info based on role
    let additionalInfo = {}

    if (user.role === 'doctor') {
      // Get clinic assignments
      const clinicAssignments = await ClinicDoctor.findAll({
        where: { userId: user.id, isActive: true },
        include: [{ model: Clinic, as: 'clinic' }]
      })
      additionalInfo.clinics = clinicAssignments.map(ca => ca.clinic)
    }

    if (user.role === 'assistant') {
      // Get doctor assignments
      const doctorAssignments = await DoctorAssistant.findAll({
        where: { assistantId: user.id, isActive: true },
        include: [{ model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }]
      })
      additionalInfo.doctors = doctorAssignments.map(da => da.doctor)
    }

    // Generate JWT (7 days expiry)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        ...additionalInfo
      }
    })
  } catch (error) {
    console.error('Auth verify error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/auth/register - Register new user (pending approval)
router.post('/register', async (req, res) => {
  try {
    const { clerkId, email, name, phone, role } = req.body

    if (!clerkId || !name) {
      return res.status(400).json({
        success: false,
        message: 'clerkId and name are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { clerkId } })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already registered',
        code: 'CONFLICT'
      })
    }

    // Check if email already exists
    if (email) {
      const emailExists = await User.findOne({ where: { email } })
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
          code: 'CONFLICT'
        })
      }
    }

    // Create user with pending status
    const user = await User.create({
      clerkId,
      email,
      name,
      phone,
      role: role || 'doctor',
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting admin approval.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    })
  } catch (error) {
    console.error('Auth register error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findByPk(decoded.userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Get additional info based on role
    let additionalInfo = {}

    if (user.role === 'doctor') {
      const clinicAssignments = await ClinicDoctor.findAll({
        where: { userId: user.id, isActive: true },
        include: [{ model: Clinic, as: 'clinic' }]
      })
      additionalInfo.clinics = clinicAssignments.map(ca => ca.clinic)
    }

    if (user.role === 'assistant') {
      const doctorAssignments = await DoctorAssistant.findAll({
        where: { assistantId: user.id, isActive: true },
        include: [{ model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }]
      })
      additionalInfo.doctors = doctorAssignments.map(da => da.doctor)
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        ...additionalInfo
      }
    })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

module.exports = router
