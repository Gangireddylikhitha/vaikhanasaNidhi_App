const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const publicRoutes = require('./publicRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/', publicRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vaikhanasa-nidhi-api' });
});

module.exports = router;
