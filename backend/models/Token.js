// models/Token.js
module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    'Token',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      queueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'queues',
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
      tokenNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(
          'waiting',
          'called',
          'in_progress',
          'completed',
          'skipped',
          'no_show',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'waiting'
      },
      isEmergency: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      calledAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'tokens',
      timestamps: true,
      indexes: [
        {
          fields: ['queueId', 'status']
        },
        {
          fields: ['queueId', 'position']
        }
      ]
    }
  )

  Token.associate = models => {
    Token.belongsTo(models.Queue, {
      foreignKey: 'queueId',
      as: 'queue'
    })
    Token.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient'
    })
  }

  return Token
}
