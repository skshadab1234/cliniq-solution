// models/Doctor.js
module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      clinicId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Firebase UID to map doctor identity
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true, // Firebase se aa sakta hai, optional
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false, // OTP login base hoga
        validate: {
          is: /^[0-9+\-\s]+$/i
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'doctors',
      timestamps: true
    }
  )

  Doctor.associate = models => {
    Doctor.belongsTo(models.Clinic, {
      foreignKey: 'clinicId',
      as: 'clinic'
    })
  }

  return Doctor
}
