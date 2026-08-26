const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const publicRoutes = require('./publicRoutes');
const userRoutes = require('./userRoutes');
const cronRoutes = require('./cronRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/internal/cron', cronRoutes);
router.use('/', publicRoutes);

module.exports = router;
