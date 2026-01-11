const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Admin, User, Clinic, ClinicDoctor, DoctorAssistant } = require('../models')

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'UNAUTHORIZED'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not an admin token',
        code: 'FORBIDDEN'
      })
    }

    const admin = await Admin.findByPk(decoded.adminId)
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive',
        code: 'UNAUTHORIZED'
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'UNAUTHORIZED'
    })
  }
}

// POST /api/admin-auth/login - Admin login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Find admin by email
    const admin = await Admin.findOne({ where: { email: email.toLowerCase() } })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      })
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is disabled',
        code: 'ACCOUNT_DISABLED'
      })
    }

    // Check password
    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Generate token
    const token = jwt.sign(
      { adminId: admin.id, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/admin-auth/me - Get current admin
router.get('/me', verifyAdmin, async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin.id,
      email: req.admin.email,
      name: req.admin.name
    }
  })
})

// GET /api/admin-auth/users - List users (for admin panel)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { status, role } = req.query

    const where = {}
    if (status) where.status = status
    if (role) where.role = role

    const users = await User.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['clerkId'] }
    })

    res.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/admin-auth/users/:id/approve - Approve user
router.patch('/users/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      })
    }

    await user.update({
      status: 'approved',
      role: role || user.role
    })

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'approved'
      },
      message: 'User approved'
    })
  } catch (error) {
    console.error('Approve user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/admin-auth/users/:id/reject - Reject/Block user
router.patch('/users/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      })
    }

    await user.update({ status: 'blocked' })

    res.json({
      success: true,
      message: 'User rejected'
    })
  } catch (error) {
    console.error('Reject user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/admin-auth/clinics - List clinics
router.get('/clinics', verifyAdmin, async (req, res) => {
  try {
    const clinics = await Clinic.findAll({
      order: [['name', 'ASC']]
    })

    res.json({
      success: true,
      clinics
    })
  } catch (error) {
    console.error('Get clinics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/admin-auth/clinics - Create clinic
router.post('/clinics', verifyAdmin, async (req, res) => {
  try {
    const { name, address, phone, openTime, closeTime } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Clinic name is required',
        code: 'VALIDATION_ERROR'
      })
    }

    const clinic = await Clinic.create({
      name,
      address,
      phone,
      openTime,
      closeTime
    })

    res.status(201).json({
      success: true,
      clinic
    })
  } catch (error) {
    console.error('Create clinic error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/admin-auth/assign-doctor - Assign doctor to clinic
router.post('/assign-doctor', verifyAdmin, async (req, res) => {
  try {
    const { clinicId, userId } = req.body

    if (!clinicId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'clinicId and userId are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if assignment exists
    let assignment = await ClinicDoctor.findOne({
      where: { clinicId, userId }
    })

    if (assignment) {
      await assignment.update({ isActive: true })
    } else {
      assignment = await ClinicDoctor.create({
        clinicId,
        userId,
        isActive: true
      })
    }

    res.json({
      success: true,
      assignment
    })
  } catch (error) {
    console.error('Assign doctor error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/admin-auth/assign-assistant - Assign assistant to doctor
router.post('/assign-assistant', verifyAdmin, async (req, res) => {
  try {
    const { doctorId, assistantId } = req.body

    if (!doctorId || !assistantId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId and assistantId are required',
        code: 'VALIDATION_ERROR'
      })
    }

    let assignment = await DoctorAssistant.findOne({
      where: { doctorId, assistantId }
    })

    if (assignment) {
      await assignment.update({ isActive: true })
    } else {
      assignment = await DoctorAssistant.create({
        doctorId,
        assistantId,
        isActive: true
      })
    }

    res.json({
      success: true,
      assignment
    })
  } catch (error) {
    console.error('Assign assistant error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/admin-auth/create-admin - Create new admin (protected)
router.post('/create-admin', verifyAdmin, async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
        code: 'VALIDATION_ERROR'
      })
    }

    const existingAdmin = await Admin.findOne({ where: { email: email.toLowerCase() } })
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists',
        code: 'CONFLICT'
      })
    }

    const admin = await Admin.create({
      email: email.toLowerCase(),
      password,
      name
    })

    res.status(201).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
