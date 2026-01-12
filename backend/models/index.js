const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Import all models
const Clinic = require('./Clinic')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Patient = require('./Patient')(sequelize, DataTypes);
const ClinicDoctor = require('./ClinicDoctor')(sequelize, DataTypes);
const DoctorAssistant = require('./DoctorAssistant')(sequelize, DataTypes);
const Queue = require('./Queue')(sequelize, DataTypes);
const Token = require('./Token')(sequelize, DataTypes);
const RegistrationRequest = require('./RegistrationRequest')(sequelize, DataTypes);
const Admin = require('./Admin')(sequelize, DataTypes);
const Prescription = require('./Prescription')(sequelize, DataTypes);

// Create the db object
const db = {
  sequelize,
  Clinic,
  User,
  Patient,
  ClinicDoctor,
  DoctorAssistant,
  Queue,
  Token,
  RegistrationRequest,
  Admin,
  Prescription,
};

// Set up associations
Object.values(db).forEach(model => {
  if (model && model.associate) {
    model.associate(db);
  }
});

// Sync database
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('DB Synced successfully');
  } catch (err) {
    console.error('Error syncing tables:', err);
  }
})();

module.exports = db;
