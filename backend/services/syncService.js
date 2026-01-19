// syncService.js - Background sync service for Redis to DB
const { getSyncQueue, removeSyncItems, SYNC_OPERATIONS, isRedisConnected } = require('../utils/cache')
const { Token, Queue } = require('../models')

// Sync interval in milliseconds
const SYNC_INTERVAL = 5000 // 5 seconds

let syncTimer = null
let isSyncing = false

// Process sync queue
const processSyncQueue = async () => {
  if (!isRedisConnected() || isSyncing) return

  isSyncing = true
  try {
    const operations = await getSyncQueue(20) // Process up to 20 at a time

    if (operations.length === 0) {
      isSyncing = false
      return
    }

    let processedCount = 0

    for (const op of operations) {
      try {
        switch (op.type) {
          case SYNC_OPERATIONS.TOKEN_STATUS:
            await syncTokenStatus(op)
            break
          case SYNC_OPERATIONS.QUEUE_STATUS:
            await syncQueueStatus(op)
            break
          case SYNC_OPERATIONS.TOKEN_CREATE:
            await syncTokenCreate(op)
            break
          default:
            console.warn('Unknown sync operation type:', op.type)
        }
        processedCount++
      } catch (error) {
        console.error('Sync operation failed:', error.message, op)
        // Continue with other operations
      }
    }

    // Remove processed items
    if (processedCount > 0) {
      await removeSyncItems(processedCount)
      console.log(`Synced ${processedCount} operations to DB`)
    }
  } catch (error) {
    console.error('Sync queue processing error:', error.message)
  } finally {
    isSyncing = false
  }
}

// Sync token status to DB
const syncTokenStatus = async (op) => {
  const { tokenId, status, calledAt, startedAt, completedAt } = op.data

  const updateData = { status }
  if (calledAt) updateData.calledAt = new Date(calledAt)
  if (startedAt) updateData.startedAt = new Date(startedAt)
  if (completedAt) updateData.completedAt = new Date(completedAt)

  await Token.update(updateData, { where: { id: tokenId } })
}

// Sync queue status to DB
const syncQueueStatus = async (op) => {
  const { queueId, status, currentTokenId } = op.data

  const updateData = { status }
  if (currentTokenId !== undefined) {
    updateData.currentTokenId = currentTokenId
  }

  await Queue.update(updateData, { where: { id: queueId } })
}

// Sync new token creation to DB (if created in cache first)
const syncTokenCreate = async (op) => {
  const { tokenData } = op.data

  // Check if already exists
  const existing = await Token.findOne({
    where: {
      queueId: tokenData.queueId,
      patientId: tokenData.patientId,
      tokenNumber: tokenData.tokenNumber
    }
  })

  if (!existing) {
    await Token.create(tokenData)
  }
}

// Start background sync
const startSyncService = () => {
  if (syncTimer) return

  console.log('Starting background sync service...')
  syncTimer = setInterval(processSyncQueue, SYNC_INTERVAL)

  // Run immediately once
  processSyncQueue()
}

// Stop background sync
const stopSyncService = () => {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
    console.log('Background sync service stopped')
  }
}

// Force sync (flush all pending operations)
const forceSync = async () => {
  console.log('Force syncing...')
  let totalProcessed = 0

  while (true) {
    const operations = await getSyncQueue(50)
    if (operations.length === 0) break

    for (const op of operations) {
      try {
        switch (op.type) {
          case SYNC_OPERATIONS.TOKEN_STATUS:
            await syncTokenStatus(op)
            break
          case SYNC_OPERATIONS.QUEUE_STATUS:
            await syncQueueStatus(op)
            break
          case SYNC_OPERATIONS.TOKEN_CREATE:
            await syncTokenCreate(op)
            break
        }
        totalProcessed++
      } catch (error) {
        console.error('Force sync operation failed:', error.message)
      }
    }

    await removeSyncItems(operations.length)
  }

  console.log(`Force sync completed: ${totalProcessed} operations`)
  return totalProcessed
}

module.exports = {
  startSyncService,
  stopSyncService,
  forceSync,
  processSyncQueue
}
