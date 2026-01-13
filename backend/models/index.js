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

    const defaultAdminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@cliniq.com').toLowerCase()
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
    const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || 'Super Admin'

    const existingAdmin = await Admin.findOne({ where: { email: defaultAdminEmail } })
    console.log(existingAdmin, 'existingAdmin')
    if (!existingAdmin) {
      await Admin.create({
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        name: defaultAdminName
      })
    }
  } catch (err) {
    console.error('Error syncing tables:', err);
  }
})();

module.exports = db;
