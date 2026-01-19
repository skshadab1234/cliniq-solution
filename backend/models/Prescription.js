module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define(
    'Prescription',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tokenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tokens',
          key: 'id'
        }
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id'
        }
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      medicines: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
        // Structure: [{ name, dosage, duration, instructions }]
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true
        // Base64 encoded image or URL of uploaded prescription image
      },
      sentViaWhatsApp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'prescriptions',
      timestamps: true,
      indexes: [
        { fields: ['tokenId'] },
        { fields: ['patientId'] },
        { fields: ['doctorId'] }
      ]
    }
  )

  Prescription.associate = models => {
    Prescription.belongsTo(models.Token, {
      foreignKey: 'tokenId',
      as: 'token'
    })
    Prescription.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient'
    })
    Prescription.belongsTo(models.User, {
      foreignKey: 'doctorId',
      as: 'doctor'
    })
  }

  return Prescription
}
