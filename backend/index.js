const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

dotenv.config({ path: path.join(__dirname, '.env') })

const sequelize = require('./config/db')

// Initialize database
async function initDB() {
  try {
    await sequelize.authenticate()
    console.log('Connected to PostgreSQL')
  } catch (err) {
    console.error('DB Error:', err)
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Join queue room
  socket.on('join:queue', (queueId) => {
    socket.join(`queue:${queueId}`)
    console.log(`Socket ${socket.id} joined queue:${queueId}`)
  })

  // Leave queue room
  socket.on('leave:queue', (queueId) => {
    socket.leave(`queue:${queueId}`)
    console.log(`Socket ${socket.id} left queue:${queueId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Middleware
app.use(cors())
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
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  })
})

const PORT = process.env.PORT || 3002
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
