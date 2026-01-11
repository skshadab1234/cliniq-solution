const express = require('express')
const router = express.Router()
const { Doctor } = require('../models')

router.post('/verify', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const doctor = await Doctor.findOne({ where: { email } });

    if (doctor) {
      res.json({ message: 'Doctor verified' })
    } else {
      res.status(404).json({ error: 'Doctor not found' })
    }
  } catch (error) {
    console.error('Error verifying doctor:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
