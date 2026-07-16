const multer = require('multer');
const AppError = require('../utils/AppError');

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
  limits: { fileSize: 120 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const hasPdfExtension = /\.pdf$/i.test(file.originalname || '');
    // Mobile file pickers frequently send an empty or generic MIME type for
    // PDFs, so fall back to the .pdf extension in those cases.
    const isPdf = file.mimetype === 'application/pdf'
      || ((file.mimetype === 'application/octet-stream' || !file.mimetype) && hasPdfExtension);
    if (!isPdf) {
      return cb(new AppError('Only PDF files are allowed', 400, 'BAD_REQUEST'));
    }
    return cb(null, true);
  },
});

module.exports = { imageUpload, documentUpload, pdfUpload };
