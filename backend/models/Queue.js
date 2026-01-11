// models/Queue.js
module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define(
    'Queue',
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
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'paused', 'closed'),
        allowNull: false,
        defaultValue: 'open'
      },
      currentTokenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tokens',
          key: 'id'
        }
      },
      lastTokenNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      tableName: 'queues',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['clinicId', 'doctorId', 'date']
        }
      ]
    }
  )

  Queue.associate = models => {
    Queue.belongsTo(models.Clinic, {
      foreignKey: 'clinicId',
      as: 'clinic'
    })
    Queue.belongsTo(models.User, {
      foreignKey: 'doctorId',
      as: 'doctor'
    })
    Queue.hasMany(models.Token, {
      foreignKey: 'queueId',
      as: 'tokens'
    })
    Queue.belongsTo(models.Token, {
      foreignKey: 'currentTokenId',
      as: 'currentToken',
      constraints: false
    })
  }

  return Queue
}
