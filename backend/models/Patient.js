// models/Patient.js
module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
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
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: 'patients',
      timestamps: true
    }
  )

  Patient.associate = models => {
    Patient.hasMany(models.Token, {
      foreignKey: 'patientId',
      as: 'tokens'
    })
  }

  return Patient
}
