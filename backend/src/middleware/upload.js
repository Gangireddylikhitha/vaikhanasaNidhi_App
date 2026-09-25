const multer = require('multer');
const AppError = require('../utils/AppError');

function isPdfFile(file) {
  const mimeType = (file?.mimetype || '').toLowerCase();
  const hasPdfExtension = /\.pdf$/i.test(file?.originalname || '');

  if (!mimeType && hasPdfExtension) return true;

  return [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'application/vnd.pdf',
    'application/octet-stream',
    'application/x-download',
    'binary/octet-stream',
    'application/force-download',
  ].includes(mimeType) && hasPdfExtension;
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new AppError('Only image files are allowed', 400, 'BAD_REQUEST'));
    }
    return cb(null, true);
  },
});

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError('Only images or PDF files are allowed', 400, 'BAD_REQUEST'));
    }
    return cb(null, true);
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  // Cloudinary's free-plan raw file cap is 100 MB — stay under it.
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const isPdf = isPdfFile(file);
    if (!isPdf) {
      return cb(new AppError('Only PDF files are allowed', 400, 'BAD_REQUEST'));
    }
    return cb(null, true);
  },
});

module.exports = { imageUpload, documentUpload, pdfUpload, isPdfFile };
