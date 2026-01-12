// db.js
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
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
  // Local development fallback
  sequelize = new Sequelize(
    process.env.DB_NAME || 'clinic-solution',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'shadab',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
  )
}

module.exports = sequelize
