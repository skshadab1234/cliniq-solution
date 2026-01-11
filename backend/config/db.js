// db.js
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  'clinic-solution', // database name
  'postgres', // username
  'shadab', // password
  {
    host: 'localhost',
    dialect: 'postgres'
  }
)

module.exports = sequelize
