// models/DoctorAssistant.js
module.exports = (sequelize, DataTypes) => {
  const DoctorAssistant = sequelize.define(
    'DoctorAssistant',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      assistantId: {
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
      tableName: 'doctor_assistants',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['doctorId', 'assistantId']
        }
      ]
    }
  )

  DoctorAssistant.associate = models => {
    DoctorAssistant.belongsTo(models.User, {
      foreignKey: 'doctorId',
      as: 'doctor'
    })
    DoctorAssistant.belongsTo(models.User, {
      foreignKey: 'assistantId',
      as: 'assistant'
    })
  }

  return DoctorAssistant
}
