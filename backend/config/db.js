// db.js
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
require('pg')
const { Sequelize } = require('sequelize')

let sequelize
// Check if DATABASE_URL is provided (Neon/Production)

if (process.env.DATABASE_URL) {

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  })
} else {
  // Local development - require explicit configuration
  if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS) {
    console.error('Missing required database environment variables: DB_NAME, DB_USER, DB_PASS')
    console.error('Please set these in your .env file')
    process.exit(1)
  }

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
  )
}

module.exports = sequelize
