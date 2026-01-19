// cache.js - Caching utilities with Redis
const { getRedis, isRedisConnected } = require('../config/redis')

// Cache key prefixes
const KEYS = {
  QUEUE: 'queue',           // queue:{queueId}
  QUEUE_STATUS: 'qstatus',  // qstatus:{doctorId}:{date}
  TOKENS: 'tokens',         // tokens:{queueId}
  CURRENT: 'current',       // current:{doctorId}
  WAITING: 'waiting',       // waiting:{queueId}
  DOCTOR: 'doctor',         // doctor:{doctorId}
  SYNC_QUEUE: 'sync'        // sync - list of pending DB writes
}

// Default TTLs (in seconds)
const TTL = {
  QUEUE: 60 * 60,           // 1 hour
  STATUS: 30,               // 30 seconds (refresh often)
  TOKENS: 60,               // 1 minute
  CURRENT: 10,              // 10 seconds (very fresh)
  WAITING: 30               // 30 seconds
}

// Generate cache keys
const keys = {
  queue: (queueId) => `${KEYS.QUEUE}:${queueId}`,
  queueStatus: (doctorId, date) => `${KEYS.QUEUE_STATUS}:${doctorId}:${date}`,
  tokens: (queueId) => `${KEYS.TOKENS}:${queueId}`,
  current: (doctorId) => `${KEYS.CURRENT}:${doctorId}`,
  waiting: (queueId) => `${KEYS.WAITING}:${queueId}`,
  doctor: (doctorId) => `${KEYS.DOCTOR}:${doctorId}`,
  syncQueue: () => KEYS.SYNC_QUEUE
}

// Get from cache
const get = async (key) => {
  const redis = getRedis()
  if (!redis) return null

  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Cache get error:', error.message)
    return null
  }
}

// Set in cache
const set = async (key, value, ttl = 60) => {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.setex(key, ttl, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Cache set error:', error.message)
    return false
  }
}

// Delete from cache
const del = async (key) => {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Cache del error:', error.message)
    return false
  }
}

// Delete multiple keys by pattern
const delPattern = async (pattern) => {
  const redis = getRedis()
  if (!redis) return false

  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return true
  } catch (error) {
    console.error('Cache delPattern error:', error.message)
    return false
  }
}

// Increment a counter
const incr = async (key) => {
  const redis = getRedis()
  if (!redis) return null

  try {
    return await redis.incr(key)
  } catch (error) {
    console.error('Cache incr error:', error.message)
    return null
  }
}

// Decrement a counter
const decr = async (key) => {
  const redis = getRedis()
  if (!redis) return null

  try {
    return await redis.decr(key)
  } catch (error) {
    console.error('Cache decr error:', error.message)
    return null
  }
}

// Add to sync queue (for background DB writes)
const addToSyncQueue = async (operation) => {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.rpush(keys.syncQueue(), JSON.stringify({
      ...operation,
      timestamp: Date.now()
    }))
    return true
  } catch (error) {
    console.error('Cache addToSyncQueue error:', error.message)
    return false
  }
}

// Get pending sync operations
const getSyncQueue = async (count = 10) => {
  const redis = getRedis()
  if (!redis) return []

  try {
    const items = await redis.lrange(keys.syncQueue(), 0, count - 1)
    return items.map(item => JSON.parse(item))
  } catch (error) {
    console.error('Cache getSyncQueue error:', error.message)
    return []
  }
}

// Remove processed sync operations
const removeSyncItems = async (count) => {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.ltrim(keys.syncQueue(), count, -1)
    return true
  } catch (error) {
    console.error('Cache removeSyncItems error:', error.message)
    return false
  }
}

// Cache-specific operations for doctor dashboard
const doctorCache = {
  // Get current doctor status (current patient, waiting count, queue status)
  getCurrent: async (doctorId) => {
    return get(keys.current(doctorId))
  },

  // Set current doctor status
  setCurrent: async (doctorId, data) => {
    return set(keys.current(doctorId), data, TTL.CURRENT)
  },

  // Invalidate current status
  invalidateCurrent: async (doctorId) => {
    return del(keys.current(doctorId))
  },

  // Get waiting count for queue
  getWaitingCount: async (queueId) => {
    const data = await get(keys.waiting(queueId))
    return data?.count ?? null
  },

  // Set waiting count
  setWaitingCount: async (queueId, count) => {
    return set(keys.waiting(queueId), { count }, TTL.WAITING)
  },

  // Get queue by ID
  getQueue: async (queueId) => {
    return get(keys.queue(queueId))
  },

  // Set queue data
  setQueue: async (queueId, data) => {
    return set(keys.queue(queueId), data, TTL.QUEUE)
  },

  // Get queue status by doctor and date
  getQueueStatus: async (doctorId, date) => {
    return get(keys.queueStatus(doctorId, date))
  },

  // Set queue status
  setQueueStatus: async (doctorId, date, data) => {
    return set(keys.queueStatus(doctorId, date), data, TTL.STATUS)
  },

  // Invalidate all doctor-related cache
  invalidateAll: async (doctorId, queueId, date) => {
    const delPromises = [
      del(keys.current(doctorId)),
      del(keys.waiting(queueId)),
      del(keys.queue(queueId)),
      del(keys.queueStatus(doctorId, date))
    ]
    await Promise.all(delPromises)
    return true
  }
}

// Sync operations types
const SYNC_OPERATIONS = {
  TOKEN_STATUS: 'TOKEN_STATUS',
  QUEUE_STATUS: 'QUEUE_STATUS',
  TOKEN_CREATE: 'TOKEN_CREATE'
}

module.exports = {
  keys,
  get,
  set,
  del,
  delPattern,
  incr,
  decr,
  addToSyncQueue,
  getSyncQueue,
  removeSyncItems,
  doctorCache,
  SYNC_OPERATIONS,
  TTL,
  isRedisConnected
}
