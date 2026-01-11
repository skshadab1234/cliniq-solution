// Script to create the first admin user
// Run with: node scripts/createAdmin.js

const { Admin, sequelize } = require('../models')

async function createAdmin() {
  try {
    await sequelize.authenticate()
    console.log('Connected to database')

    // Default admin credentials - CHANGE THESE IN PRODUCTION
    const adminData = {
      email: 'admin@cliniq.com',
      password: 'admin123', // Will be hashed automatically by the model hook
      name: 'Super Admin'
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ where: { email: adminData.email } })

    if (existingAdmin) {
      console.log('Admin already exists with email:', adminData.email)
      console.log('Admin ID:', existingAdmin.id)
    } else {
      const admin = await Admin.create(adminData)
      console.log('Admin created successfully!')
      console.log('Email:', admin.email)
      console.log('Password: admin123')
      console.log('Admin ID:', admin.id)
    }

    console.log('\n⚠️  IMPORTANT: Change the default password after first login!')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
