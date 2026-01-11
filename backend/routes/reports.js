const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Queue, Token, Patient, Clinic, User, DoctorAssistant } = require('../models')
const { authenticate, requireApproved } = require('../middleware/auth')

// Helper to format time
const formatTime = (date) => {
  if (!date) return null
  const d = new Date(date)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Helper to calculate duration in minutes
const calculateDuration = (start, end) => {
  if (!start || !end) return null
  const diffMs = new Date(end) - new Date(start)
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`
  }
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}

// GET /api/reports/daily - Get daily report
router.get('/daily', authenticate, requireApproved, async (req, res) => {
  try {
    const { date, doctorId } = req.query
    const reportDate = date || new Date().toISOString().split('T')[0]

    // Determine doctor based on role
    let targetDoctorId = doctorId

    if (req.user.role === 'doctor') {
      targetDoctorId = req.user.id
    } else if (req.user.role === 'assistant') {
      if (!doctorId) {
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
        targetDoctorId = assignment.doctorId
      }
    }

    // Find the queue for the date
    const queue = await Queue.findOne({
      where: {
        doctorId: targetDoctorId,
        date: reportDate
      },
      include: [
        { model: Clinic, as: 'clinic' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    if (!queue) {
      return res.json({
        success: true,
        report: {
          date: reportDate,
          clinic: null,
          doctor: null,
          summary: {
            total: 0,
            completed: 0,
            skipped: 0,
            noShow: 0,
            cancelled: 0,
            waiting: 0,
            avgWaitTime: null,
            avgConsultationTime: null
          },
          tokens: []
        }
      })
    }

    // Get all tokens for the queue
    const tokens = await Token.findAll({
      where: { queueId: queue.id },
      include: [{ model: Patient, as: 'patient' }],
      order: [['tokenNumber', 'ASC']]
    })

    // Calculate stats
    const stats = {
      total: tokens.length,
      completed: tokens.filter(t => t.status === 'completed').length,
      skipped: tokens.filter(t => t.status === 'skipped').length,
      noShow: tokens.filter(t => t.status === 'no_show').length,
      cancelled: tokens.filter(t => t.status === 'cancelled').length,
      waiting: tokens.filter(t => t.status === 'waiting').length,
      inProgress: tokens.filter(t => t.status === 'in_progress' || t.status === 'called').length
    }

    // Calculate average times
    const completedTokens = tokens.filter(t => t.status === 'completed' && t.startedAt && t.completedAt)
    const tokensWithWait = tokens.filter(t => t.calledAt && t.createdAt)

    let avgWaitTime = null
    let avgConsultationTime = null

    if (tokensWithWait.length > 0) {
      const totalWaitMs = tokensWithWait.reduce((sum, t) => {
        return sum + (new Date(t.calledAt) - new Date(t.createdAt))
      }, 0)
      const avgWaitMins = Math.round(totalWaitMs / tokensWithWait.length / 60000)
      avgWaitTime = `${avgWaitMins} min${avgWaitMins !== 1 ? 's' : ''}`
    }

    if (completedTokens.length > 0) {
      const totalConsultMs = completedTokens.reduce((sum, t) => {
        return sum + (new Date(t.completedAt) - new Date(t.startedAt))
      }, 0)
      const avgConsultMins = Math.round(totalConsultMs / completedTokens.length / 60000)
      avgConsultationTime = `${avgConsultMins} min${avgConsultMins !== 1 ? 's' : ''}`
    }

    // Format tokens for report
    const formattedTokens = tokens.map(t => ({
      id: t.id,
      tokenNumber: t.tokenNumber,
      patientName: t.patient?.name || 'Unknown',
      patientPhone: t.patient?.phone || '',
      status: t.status,
      isEmergency: t.isEmergency,
      addedAt: formatTime(t.createdAt),
      calledAt: formatTime(t.calledAt),
      startedAt: formatTime(t.startedAt),
      completedAt: formatTime(t.completedAt),
      waitTime: calculateDuration(t.createdAt, t.calledAt),
      consultationTime: calculateDuration(t.startedAt, t.completedAt)
    }))

    res.json({
      success: true,
      report: {
        date: reportDate,
        queueId: queue.id,
        queueStatus: queue.status,
        clinic: queue.clinic ? {
          id: queue.clinic.id,
          name: queue.clinic.name,
          address: queue.clinic.address
        } : null,
        doctor: queue.doctor ? {
          id: queue.doctor.id,
          name: queue.doctor.name
        } : null,
        summary: {
          ...stats,
          avgWaitTime,
          avgConsultationTime
        },
        tokens: formattedTokens
      }
    })
  } catch (error) {
    console.error('Get daily report error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/reports/history - Get report history for date range
router.get('/history', authenticate, requireApproved, async (req, res) => {
  try {
    const { startDate, endDate, doctorId } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Determine doctor
    let targetDoctorId = doctorId

    if (req.user.role === 'doctor') {
      targetDoctorId = req.user.id
    } else if (req.user.role === 'assistant' && !doctorId) {
      const assignment = await DoctorAssistant.findOne({
        where: { assistantId: req.user.id, isActive: true }
      })
      if (assignment) {
        targetDoctorId = assignment.doctorId
      }
    }

    // Get queues in date range
    const queues = await Queue.findAll({
      where: {
        doctorId: targetDoctorId,
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      include: [
        { model: Clinic, as: 'clinic' },
        { model: Token, as: 'tokens' }
      ],
      order: [['date', 'DESC']]
    })

    // Format history
    const history = queues.map(queue => {
      const tokens = queue.tokens || []
      return {
        date: queue.date,
        queueId: queue.id,
        queueStatus: queue.status,
        clinicName: queue.clinic?.name || 'Unknown',
        total: tokens.length,
        completed: tokens.filter(t => t.status === 'completed').length,
        skipped: tokens.filter(t => t.status === 'skipped').length,
        noShow: tokens.filter(t => t.status === 'no_show').length,
        cancelled: tokens.filter(t => t.status === 'cancelled').length
      }
    })

    res.json({
      success: true,
      history
    })
  } catch (error) {
    console.error('Get report history error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

// GET /api/reports/download - Download report as CSV
router.get('/download', authenticate, requireApproved, async (req, res) => {
  try {
    const { date, doctorId } = req.query
    const reportDate = date || new Date().toISOString().split('T')[0]

    // Determine doctor
    let targetDoctorId = doctorId

    if (req.user.role === 'doctor') {
      targetDoctorId = req.user.id
    } else if (req.user.role === 'assistant' && !doctorId) {
      const assignment = await DoctorAssistant.findOne({
        where: { assistantId: req.user.id, isActive: true }
      })
      if (assignment) {
        targetDoctorId = assignment.doctorId
      }
    }

    // Find the queue
    const queue = await Queue.findOne({
      where: {
        doctorId: targetDoctorId,
        date: reportDate
      },
      include: [
        { model: Clinic, as: 'clinic' },
        { model: User, as: 'doctor', attributes: ['id', 'name'] }
      ]
    })

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'No data found for this date',
        code: 'NOT_FOUND'
      })
    }

    // Get tokens
    const tokens = await Token.findAll({
      where: { queueId: queue.id },
      include: [{ model: Patient, as: 'patient' }],
      order: [['tokenNumber', 'ASC']]
    })

    // Create CSV content
    const headers = [
      'Token #',
      'Patient Name',
      'Phone',
      'Status',
      'Emergency',
      'Added At',
      'Called At',
      'Started At',
      'Completed At',
      'Wait Time',
      'Consultation Time'
    ]

    const rows = tokens.map(t => [
      t.tokenNumber,
      t.patient?.name || 'Unknown',
      t.patient?.phone || '',
      t.status,
      t.isEmergency ? 'Yes' : 'No',
      formatTime(t.createdAt) || '',
      formatTime(t.calledAt) || '',
      formatTime(t.startedAt) || '',
      formatTime(t.completedAt) || '',
      calculateDuration(t.createdAt, t.calledAt) || '',
      calculateDuration(t.startedAt, t.completedAt) || ''
    ])

    // Add summary at the end
    const stats = {
      total: tokens.length,
      completed: tokens.filter(t => t.status === 'completed').length,
      skipped: tokens.filter(t => t.status === 'skipped').length,
      noShow: tokens.filter(t => t.status === 'no_show').length
    }

    const csvContent = [
      `Report Date: ${reportDate}`,
      `Clinic: ${queue.clinic?.name || 'N/A'}`,
      `Doctor: ${queue.doctor?.name || 'N/A'}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      '',
      'Summary',
      `Total Patients,${stats.total}`,
      `Completed,${stats.completed}`,
      `Skipped,${stats.skipped}`,
      `No Show,${stats.noShow}`
    ].join('\n')

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportDate}.csv"`)
    res.send(csvContent)
  } catch (error) {
    console.error('Download report error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
})

module.exports = router
