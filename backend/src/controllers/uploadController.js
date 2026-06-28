const { cloudinary, isConfigured } = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

exports.uploadSubcategoryImage = catchAsync(async (req, res) => {
  if (!isConfigured) {
    throw new AppError('Image upload is not configured. Set Cloudinary env variables.', 503, 'SERVICE_UNAVAILABLE');
  }
  if (!req.file) {
    throw new AppError('Image file is required', 400, 'BAD_REQUEST');
  }

  const result = await uploadBuffer(req.file.buffer, 'vaikhanasa-nidhi/subcategories');

  res.json({ url: result.secure_url });
});

exports.uploadScriptureImages = catchAsync(async (req, res) => {
  if (!isConfigured) {
    throw new AppError('Image upload is not configured. Set Cloudinary env variables.', 503, 'SERVICE_UNAVAILABLE');
  }

  const files = req.files || [];
  if (!files.length) {
    throw new AppError('At least one image is required', 400, 'BAD_REQUEST');
  }

  const uploads = await Promise.all(
    files.map((file) => uploadBuffer(file.buffer, 'vaikhanasa-nidhi/scriptures'))
  );

  res.json({
    images: uploads.map((result) => result.secure_url),
  });
});
