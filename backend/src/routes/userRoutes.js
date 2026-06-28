const express = require('express');
const { authenticate, requireRegisteredUser } = require('../middleware/authenticate');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authenticate, requireRegisteredUser);

router.get('/me/data', userController.getUserData);
router.post('/me/sync', userController.syncLocalData);
router.get('/me/bookmarks', userController.getBookmarks);
router.post('/me/bookmarks', userController.addBookmark);
router.delete('/me/bookmarks/:scriptureId', userController.removeBookmark);
router.get('/me/progress', userController.getProgress);
router.put('/me/progress', userController.saveProgress);
router.get('/me/settings', userController.getSettings);
router.patch('/me/settings', userController.updateSettings);
router.patch('/me', userController.updateProfile);

module.exports = router;
