const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

dotenv.config({ path: path.join(__dirname, '.env') })

// Conditional logging based on environment
const isDev = process.env.NODE_ENV === 'development'
const log = (...args) => isDev && console.log(...args)

const sequelize = require('./config/db')

// Initialize database
async function initDB() {
  try {
    await sequelize.authenticate()
    console.log('Connected to PostgreSQL')
  } catch (err) {
    console.error('DB Error:', err)
    console.error('Failed to connect to database. Exiting...')
    process.exit(1)
  }
}

initDB()

// Import models (triggers sync)
require('./models')

const app = express()
const server = http.createServer(app)

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Make io accessible in routes
app.set('io', io)

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      socket.authenticated = true
    } catch (err) {
      // Token invalid but allow connection for public queue viewing
      socket.authenticated = false
    }
  } else {
    socket.authenticated = false
  }
  next()
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  log('Client connected:', socket.id, socket.authenticated ? '(authenticated)' : '(anonymous)')

  // Join queue room
  socket.on('join:queue', (queueId) => {
    if (!queueId || typeof queueId !== 'string') {
      return socket.emit('error', { message: 'Invalid queue ID' })
    }
    socket.join(`queue:${queueId}`)
    log(`Socket ${socket.id} joined queue:${queueId}`)
  })

  // Leave queue room
  socket.on('leave:queue', (queueId) => {
    if (!queueId) return
    socket.leave(`queue:${queueId}`)
    log(`Socket ${socket.id} left queue:${queueId}`)
  })

  socket.on('disconnect', () => {
    log('Client disconnected:', socket.id)
  })
})

// Middleware - CORS with whitelist
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/queues', require('./routes/queues'))
app.use('/api/tokens', require('./routes/tokens'))
app.use('/api/doctor', require('./routes/doctor'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/admin-auth', require('./routes/adminAuth'))
app.use('/api/public', require('./routes/public'))
app.use('/api/reports', require('./routes/reports'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  // Always log errors but with less detail in production
  if (isDev) {
    console.error('Error:', err)
  } else {
    console.error('Error:', err.message)
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  })
})

const PORT = process.env.PORT || 3002
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
