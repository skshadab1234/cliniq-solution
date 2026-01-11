// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      clerkId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('admin', 'doctor', 'assistant'),
        allowNull: false,
        defaultValue: 'doctor'
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'blocked'),
        allowNull: false,
        defaultValue: 'pending'
      }
    },
    {
      tableName: 'users',
      timestamps: true
    }
  )

  User.associate = models => {
    // Doctor can have many assistants
    User.hasMany(models.DoctorAssistant, {
      foreignKey: 'doctorId',
      as: 'assistants'
    })
    // Assistant can work for many doctors
    User.hasMany(models.DoctorAssistant, {
      foreignKey: 'assistantId',
      as: 'doctorAssignments'
    })
    // User can be assigned to clinics (as doctor)
    User.hasMany(models.ClinicDoctor, {
      foreignKey: 'userId',
      as: 'clinicAssignments'
    })
    // Doctor can have many queues
    User.hasMany(models.Queue, {
      foreignKey: 'doctorId',
      as: 'queues'
    })
  }

  return User
}
