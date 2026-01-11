const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { User, Clinic, ClinicDoctor, DoctorAssistant } = require('../models')
const { authenticate, requireApproved, requireRole } = require('../middleware/auth')

// All admin routes require admin role
router.use(authenticate, requireApproved, requireRole('admin'))

// GET /api/admin/users - List users
router.get('/users', async (req, res) => {
  try {
    const { status, role, limit = 50, offset = 0 } = req.query

    const where = {}
    if (status) {
      where.status = status
    }
    if (role) {
      where.role = role
    }

    const { rows: users, count } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['clerkId'] }
    })

    res.json({
      success: true,
      users,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('List users error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['clerkId'] }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      })
    }

    // Get assignments based on role
    let assignments = {}
    if (user.role === 'doctor') {
      const clinicAssignments = await ClinicDoctor.findAll({
        where: { userId: user.id },
        include: [{ model: Clinic, as: 'clinic' }]
      })
      assignments.clinics = clinicAssignments

      const assistantAssignments = await DoctorAssistant.findAll({
        where: { doctorId: user.id },
        include: [{ model: User, as: 'assistant', attributes: ['id', 'name', 'email'] }]
      })
      assignments.assistants = assistantAssignments
    }

    if (user.role === 'assistant') {
      const doctorAssignments = await DoctorAssistant.findAll({
        where: { assistantId: user.id },
        include: [{ model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }]
      })
      assignments.doctors = doctorAssignments
    }

    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        ...assignments
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/admin/users/:id/approve - Approve user
router.patch('/users/:id/approve', async (req, res) => {
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

    if (user.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'User already approved',
        code: 'ALREADY_APPROVED'
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

// PATCH /api/admin/users/:id/block - Block user
router.patch('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      })
    }

    // Prevent blocking yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself',
        code: 'SELF_BLOCK'
      })
    }

    await user.update({ status: 'blocked' })

    res.json({
      success: true,
      user: {
        id: user.id,
        status: 'blocked'
      },
      message: 'User blocked'
    })
  } catch (error) {
    console.error('Block user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// PATCH /api/admin/users/:id/unblock - Unblock user
router.patch('/users/:id/unblock', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      })
    }

    await user.update({ status: 'approved' })

    res.json({
      success: true,
      user: {
        id: user.id,
        status: 'approved'
      },
      message: 'User unblocked'
    })
  } catch (error) {
    console.error('Unblock user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/admin/clinics - List clinics
router.get('/clinics', async (req, res) => {
  try {
    const clinics = await Clinic.findAll({
      include: [{
        model: ClinicDoctor,
        as: 'clinicDoctors',
        include: [{ model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }]
      }],
      order: [['name', 'ASC']]
    })

    res.json({
      success: true,
      clinics
    })
  } catch (error) {
    console.error('List clinics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/admin/clinics - Create clinic
router.post('/clinics', async (req, res) => {
  try {
    const { name, address, phone, openTime, closeTime } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name is required',
        code: 'VALIDATION_ERROR'
      })
    }

    const clinic = await Clinic.create({
      name,
      address,
      phone,
      openTime,
      closeTime,
      ownerId: req.user.id
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

// POST /api/admin/clinic-doctors - Assign doctor to clinic
router.post('/clinic-doctors', async (req, res) => {
  try {
    const { clinicId, userId } = req.body

    if (!clinicId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'clinicId and userId are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Verify clinic exists
    const clinic = await Clinic.findByPk(clinicId)
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found',
        code: 'NOT_FOUND'
      })
    }

    // Verify user is a doctor
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      })
    }

    if (user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a doctor',
        code: 'INVALID_ROLE'
      })
    }

    // Check if already assigned
    const existing = await ClinicDoctor.findOne({
      where: { clinicId, userId }
    })

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          message: 'Doctor already assigned to this clinic',
          code: 'CONFLICT'
        })
      }
      // Reactivate
      await existing.update({ isActive: true })
      return res.json({
        success: true,
        assignment: existing,
        message: 'Doctor re-assigned to clinic'
      })
    }

    const assignment = await ClinicDoctor.create({
      clinicId,
      userId,
      isActive: true
    })

    res.status(201).json({
      success: true,
      assignment
    })
  } catch (error) {
    console.error('Assign doctor to clinic error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// DELETE /api/admin/clinic-doctors/:id - Remove doctor from clinic
router.delete('/clinic-doctors/:id', async (req, res) => {
  try {
    const assignment = await ClinicDoctor.findByPk(req.params.id)
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
        code: 'NOT_FOUND'
      })
    }

    await assignment.update({ isActive: false })

    res.json({
      success: true,
      message: 'Doctor removed from clinic'
    })
  } catch (error) {
    console.error('Remove doctor from clinic error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// POST /api/admin/doctor-assistants - Assign assistant to doctor
router.post('/doctor-assistants', async (req, res) => {
  try {
    const { doctorId, assistantId } = req.body

    if (!doctorId || !assistantId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId and assistantId are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Verify doctor
    const doctor = await User.findByPk(doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
        code: 'NOT_FOUND'
      })
    }

    // Verify assistant
    const assistant = await User.findByPk(assistantId)
    if (!assistant || assistant.role !== 'assistant') {
      return res.status(404).json({
        success: false,
        message: 'Assistant not found',
        code: 'NOT_FOUND'
      })
    }

    // Check if already assigned
    const existing = await DoctorAssistant.findOne({
      where: { doctorId, assistantId }
    })

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          message: 'Assistant already assigned to this doctor',
          code: 'CONFLICT'
        })
      }
      await existing.update({ isActive: true })
      return res.json({
        success: true,
        assignment: existing,
        message: 'Assistant re-assigned to doctor'
      })
    }

    const assignment = await DoctorAssistant.create({
      doctorId,
      assistantId,
      isActive: true
    })

    res.status(201).json({
      success: true,
      assignment
    })
  } catch (error) {
    console.error('Assign assistant to doctor error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// DELETE /api/admin/doctor-assistants/:id - Remove assistant from doctor
router.delete('/doctor-assistants/:id', async (req, res) => {
  try {
    const assignment = await DoctorAssistant.findByPk(req.params.id)
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
        code: 'NOT_FOUND'
      })
    }

    await assignment.update({ isActive: false })

    res.json({
      success: true,
      message: 'Assistant removed from doctor'
    })
  } catch (error) {
    console.error('Remove assistant from doctor error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
