// models/Admin.js
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    'Admin',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'admins',
      timestamps: true,
      hooks: {
        beforeCreate: async (admin) => {
          if (admin.password) {
            const salt = await bcrypt.genSalt(10)
            admin.password = await bcrypt.hash(admin.password, salt)
          }
        },
        beforeUpdate: async (admin) => {
          if (admin.changed('password')) {
            const salt = await bcrypt.genSalt(10)
            admin.password = await bcrypt.hash(admin.password, salt)
          }
        }
      }
    }
  )

  // Instance method to check password
  Admin.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
  }

  return Admin
}
