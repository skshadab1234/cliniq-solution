// models/Clinic.js
module.exports = (sequelize, DataTypes) => {
  const Clinic = sequelize.define(
    'Clinic',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      openTime: {
        type: DataTypes.TIME,
        allowNull: true
      },
      closeTime: {
        type: DataTypes.TIME,
        allowNull: true
      },
      registrationNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      proofDocument: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'clinics',
      timestamps: true
    }
  )

  Clinic.associate = models => {
    Clinic.hasMany(models.ClinicDoctor, {
      foreignKey: 'clinicId',
      as: 'clinicDoctors'
    })
    Clinic.hasMany(models.Queue, {
      foreignKey: 'clinicId',
      as: 'queues'
    })
  }

  return Clinic
}
