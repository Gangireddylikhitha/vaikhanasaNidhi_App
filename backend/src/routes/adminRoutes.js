const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminScriptureController = require('../controllers/adminScriptureController');
const adminCategoryController = require('../controllers/adminCategoryController');
const uploadController = require('../controllers/uploadController');
const { imageUpload } = require('../middleware/upload');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminDashboardController.getDashboard);

router.post(
  '/uploads/subcategory-image',
  imageUpload.single('image'),
  uploadController.uploadSubcategoryImage
);

router.post(
  '/uploads/scripture-images',
  imageUpload.array('images', 30),
  uploadController.uploadScriptureImages
);

router.get('/scriptures', adminScriptureController.listScriptures);
router.get('/scriptures/:id', adminScriptureController.getScripture);
router.post('/scriptures', adminScriptureController.createScripture);
router.put('/scriptures/:id', adminScriptureController.updateScripture);
router.delete('/scriptures/:id', adminScriptureController.deleteScripture);

router.get('/categories', adminCategoryController.listCategories);
router.get('/categories/:id', adminCategoryController.getCategory);
router.post('/categories', adminCategoryController.createCategory);
router.put('/categories/:id', adminCategoryController.updateCategory);
router.delete('/categories/:id', adminCategoryController.deleteCategory);

router.get('/subcategories', adminCategoryController.listSubcategories);
router.post('/subcategories', adminCategoryController.createSubcategory);
router.put('/subcategories/:id', adminCategoryController.updateSubcategory);
router.delete('/subcategories/:id', adminCategoryController.deleteSubcategory);

module.exports = router;
