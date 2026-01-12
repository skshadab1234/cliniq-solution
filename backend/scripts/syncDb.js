// scripts/syncDb.js
// Database sync script for Neon PostgreSQL
// Run: node scripts/syncDb.js

require('dotenv').config()
const sequelize = require('../config/db')

async function syncDatabase() {
  try {
    console.log('Connecting to database...')
    await sequelize.authenticate()
    console.log('Connected successfully!')

    console.log('\nSyncing models...')

    // Import all models
    const models = require('../models')

    // Sync all models (alter: true will update existing tables)
    // Use force: true only for fresh setup (DROPS ALL DATA!)
    await sequelize.sync({ alter: true })

    console.log('\nAll models synced successfully!')
    console.log('Tables created/updated:')

    const tableNames = Object.keys(models).filter(key => key !== 'sequelize' && key !== 'Sequelize')
    tableNames.forEach(name => console.log(`  - ${name}`))

    process.exit(0)
  } catch (error) {
    console.error('Error syncing database:', error)
    process.exit(1)
  }
}

syncDatabase()
