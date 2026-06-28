const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const publicScriptureController = require('../controllers/publicScriptureController');
const publicCategoryController = require('../controllers/publicCategoryController');
const panchangamController = require('../controllers/panchangamController');

const router = express.Router();

router.use(authenticate);

router.get('/scriptures/recent', publicScriptureController.getRecentScriptures);
router.get('/scriptures', publicScriptureController.listScriptures);
router.get('/scriptures/:id', publicScriptureController.getScripture);
router.get('/subcategories', publicCategoryController.listSubcategories);
router.get('/panchangam', panchangamController.getPanchangam);

module.exports = router;
