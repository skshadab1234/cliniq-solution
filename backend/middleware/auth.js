const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const { User } = require('../models')

// Promisified jwt.verify for cleaner async/await usage
const verifyToken = promisify(jwt.verify)

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
        code: 'UNAUTHORIZED'
      })
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = await verifyToken(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        code: 'UNAUTHORIZED'
      })
    }

    // Get fresh user data
    const user = await User.findByPk(decoded.userId)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'UNAUTHORIZED'
      })
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Account blocked',
        code: 'FORBIDDEN'
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Authorization middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    })
  }
}

// Check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      })
    }

    next()
  }
}

// Check if user is approved
const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    })
  }

  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Account pending admin approval',
      status: req.user.status,
      code: 'PENDING_APPROVAL'
    })
  }

  next()
}

module.exports = { authenticate, requireRole, requireApproved }
