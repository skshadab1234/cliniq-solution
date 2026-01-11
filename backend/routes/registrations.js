const express = require('express');
const router = express.Router();
const { RegistrationRequest } = require('../models');

router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  try {
    // Check if a request with this email already exists
    const existingRequest = await RegistrationRequest.findOne({ where: { email } });

    if (existingRequest) {
      return res.status(409).json({ message: 'A registration request for this email already exists.' });
    }

    const newRequest = await RegistrationRequest.create({ name, email, phone });
    res.status(201).json({ message: 'Registration request submitted successfully.', request: newRequest });
  } catch (error) {
    console.error('Error submitting registration request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
