const mongoose = require('mongoose');

function isAtlasUri(uri) {
  return uri.includes('mongodb.net') || uri.startsWith('mongodb+srv://');
}

function atlasConnectionHint() {
  return [
    'MongoDB Atlas SSL connection failed. Check:',
    '  1. Atlas → Network Access → add your IP (or 0.0.0.0/0 for dev)',
    '  2. Atlas cluster is Running (not Paused)',
    '  3. MONGODB_URI username/password are correct',
    '  4. Password special chars are URL-encoded (@ → %40, # → %23, etc.)',
    '  5. Or use local Mongo: MONGODB_URI=mongodb://127.0.0.1:27017/vaikhanasa-nidhi',
  ].join('\n');
}

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    const msg = err?.message || '';
    const sslFailed = msg.includes('SSL') || msg.includes('tlsv1') || msg.includes('MongoServerSelectionError');
    if (sslFailed && isAtlasUri(uri)) {
      console.error(atlasConnectionHint());
    }
    throw err;
  }

  console.log('MongoDB connected');
}

module.exports = { connectDatabase };
