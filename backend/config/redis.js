// redis.js - Redis client configuration
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const Redis = require('ioredis')

let redis = null
let isConnected = false

// Redis connection configuration
const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    // Production - use Redis URL (e.g., Upstash, Redis Cloud)
    return process.env.REDIS_URL
  }

  // Local development
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Redis connection failed, running without cache')
        return null // Stop retrying
      }
      return Math.min(times * 100, 3000)
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
  }
}

// Initialize Redis connection
const initRedis = async () => {
  try {
    const config = getRedisConfig()
    redis = new Redis(config)

    redis.on('connect', () => {
      console.log('Redis: Connecting...')
    })

    redis.on('ready', () => {
      isConnected = true
      console.log('Redis: Connected successfully')
    })

    redis.on('error', (err) => {
      console.error('Redis error:', err.message)
      isConnected = false
    })

    redis.on('close', () => {
      console.log('Redis: Connection closed')
      isConnected = false
    })

    // Try to connect
    await redis.connect()

    // Test connection
    await redis.ping()
    isConnected = true

    return redis
  } catch (error) {
    console.warn('Redis connection failed:', error.message)
    console.log('Running without Redis cache - DB operations will be direct')
    isConnected = false
    return null
  }
}

// Get Redis instance (returns null if not connected)
const getRedis = () => {
  if (isConnected && redis) {
    return redis
  }
  return null
}

// Check if Redis is available
const isRedisConnected = () => isConnected

// Graceful shutdown
const closeRedis = async () => {
  if (redis) {
    await redis.quit()
    redis = null
    isConnected = false
    console.log('Redis: Disconnected')
  }
}

module.exports = {
  initRedis,
  getRedis,
  isRedisConnected,
  closeRedis
}
