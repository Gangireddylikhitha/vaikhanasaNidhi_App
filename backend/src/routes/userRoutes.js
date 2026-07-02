const express = require('express');
const { authenticate, requireRegisteredUser } = require('../middleware/authenticate');
const userController = require('../controllers/userController');
const verificationController = require('../controllers/verificationController');

const router = express.Router();

router.use(authenticate, requireRegisteredUser);

router.get('/me/verification', verificationController.getMyVerification);
router.post('/me/verification', verificationController.submitVerification);

router.get('/me/data', userController.getUserData);
router.post('/me/sync', userController.syncLocalData);
router.get('/me/bookmarks', userController.getBookmarks);
router.post('/me/bookmarks', userController.addBookmark);
router.delete('/me/bookmarks/:scriptureId', userController.removeBookmark);
router.get('/me/progress', userController.getProgress);
router.put('/me/progress', userController.saveProgress);
router.delete('/me/progress/:scriptureId', userController.removeProgress);
router.patch('/me/password', userController.changePassword);
router.get('/me/settings', userController.getSettings);
router.patch('/me/settings', userController.updateSettings);
router.patch('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);
router.post('/me/fcm-token', userController.registerFcmToken);
router.delete('/me/fcm-token', userController.removeFcmToken);

module.exports = router;
