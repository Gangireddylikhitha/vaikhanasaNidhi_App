const { cloudinary } = require('../config/cloudinary');

const UPLOAD_OPTIONS = {
  resource_type: 'image',
  quality: 'auto:good',
  fetch_format: 'auto',
};

function uploadBuffer(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...UPLOAD_OPTIONS, ...options },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function uploadRawBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    // Cloudinary caps a single-request upload at 10 MB on this plan; upload_large_stream
    // sends the file in chunks so larger PDFs (up to the plan's raw-file limit) go through.
    const stream = cloudinary.uploader.upload_large_stream(
      {
        folder,
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
        chunk_size: 6 * 1024 * 1024,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

async function uploadBuffersParallel(files, folder, concurrency = 8) {
  const results = new Array(files.length);
  let index = 0;

  async function worker() {
    while (index < files.length) {
      const i = index;
      index += 1;
      results[i] = await uploadBuffer(files[i].buffer, folder);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

module.exports = { uploadBuffer, uploadBuffersParallel, uploadRawBuffer };
