const jwt = require('jsonwebtoken')

const authorizeVendor = async (req, res, next) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' })
    }

    // Extract the token from the Bearer header
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' })
      }
      req.payload = decoded
      next()
    })
    
  } catch (error) {
    console.error('Authorization middleware error:', error)
    res.status(500).json({
      error: 'An internal server error occurred during authorization.'
    })
  }
}

module.exports = authorizeVendor
