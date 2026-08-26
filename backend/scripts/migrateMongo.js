/**
 * Copy all collections/documents from a SOURCE MongoDB to a DESTINATION MongoDB.
 *
 * Usage (PowerShell):
 *   node scripts/migrateMongo.js --source "<OLD_URI>" --dest "<NEW_URI>"
 *   node scripts/migrateMongo.js --source "<OLD_URI>" --dest "<NEW_URI>" --drop   (wipe dest collections first)
 *
 * You can also set SOURCE_MONGODB_URI and DEST_MONGODB_URI env vars instead of flags.
 * Documents are upserted by _id, so re-running is safe (idempotent).
 */
const { MongoClient } = require('mongodb');

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function dbNameFromUri(uri) {
  try {
    const afterHost = uri.split('/').slice(3).join('/');
    const name = afterHost.split('?')[0];
    return name || undefined;
  } catch {
    return undefined;
  }
}

async function run() {
  const sourceUri = getArg('source') || process.env.SOURCE_MONGODB_URI;
  const destUri = getArg('dest') || process.env.DEST_MONGODB_URI;
  const drop = process.argv.includes('--drop');

  if (!sourceUri || !destUri) {
    console.error('Missing URIs. Provide --source and --dest (or SOURCE_MONGODB_URI / DEST_MONGODB_URI).');
    process.exit(1);
  }

  const sourceDbName = dbNameFromUri(sourceUri) || 'vaikhanasa-nidhi';
  const destDbName = dbNameFromUri(destUri) || 'vaikhanasa-nidhi';

  const sourceClient = new MongoClient(sourceUri, { serverSelectionTimeoutMS: 15000 });
  const destClient = new MongoClient(destUri, { serverSelectionTimeoutMS: 15000 });

  console.log('Connecting to SOURCE...');
  await sourceClient.connect();
  console.log('Connecting to DEST...');
  await destClient.connect();

  const sourceDb = sourceClient.db(sourceDbName);
  const destDb = destClient.db(destDbName);

  const collections = await sourceDb.listCollections({ type: 'collection' }).toArray();
  console.log(`\nSource DB "${sourceDbName}" has ${collections.length} collections.`);
  console.log(`Copying into DEST DB "${destDbName}"${drop ? ' (dropping dest collections first)' : ''}.\n`);

  const summary = [];

  for (const info of collections) {
    const name = info.name;
    if (name.startsWith('system.')) continue;

    const srcColl = sourceDb.collection(name);
    const destColl = destDb.collection(name);

    const total = await srcColl.countDocuments();

    if (drop) {
      try {
        await destColl.drop();
      } catch (e) {
        // ignore if it doesn't exist yet
      }
    }

    let copied = 0;
    if (total > 0) {
      const cursor = srcColl.find({});
      let batch = [];
      const flush = async () => {
        if (batch.length === 0) return;
        const ops = batch.map((doc) => ({
          replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
        }));
        await destColl.bulkWrite(ops, { ordered: false });
        copied += batch.length;
        batch = [];
      };
      for await (const doc of cursor) {
        batch.push(doc);
        if (batch.length >= 500) await flush();
      }
      await flush();
    }

    const destCount = await destColl.countDocuments();
    summary.push({ name, source: total, dest: destCount });
    console.log(`  ${name}: source=${total}  dest=${destCount}`);
  }

  console.log('\nMigration complete. Summary:');
  console.table(summary);

  await sourceClient.close();
  await destClient.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
