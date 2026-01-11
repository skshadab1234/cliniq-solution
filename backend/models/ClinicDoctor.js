// models/ClinicDoctor.js
module.exports = (sequelize, DataTypes) => {
  const ClinicDoctor = sequelize.define(
    'ClinicDoctor',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      clinicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'clinics',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'clinic_doctors',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['clinicId', 'userId']
        }
      ]
    }
  )

  ClinicDoctor.associate = models => {
    ClinicDoctor.belongsTo(models.Clinic, {
      foreignKey: 'clinicId',
      as: 'clinic'
    })
    ClinicDoctor.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'doctor'
    })
  }

  return ClinicDoctor
}
