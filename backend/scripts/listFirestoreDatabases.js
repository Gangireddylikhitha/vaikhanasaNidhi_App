/**
 * Lists Firestore databases in your Firebase project.
 * Use the printed database id in backend/.env as FIRESTORE_DATABASE_ID
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { GoogleAuth } = require('google-auth-library');

function getServiceAccountPath() {
  const configured = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(__dirname, '..', configured);
  }
  return path.join(__dirname, '../firebase-service-account.json');
}

async function listDatabases() {
  const serviceAccountPath = getServiceAccountPath();

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Service account not found: ${serviceAccountPath}`);
    process.exit(1);
  }

  const serviceAccount = require(serviceAccountPath);
  const projectId = serviceAccount.project_id;

  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;

  const response = await client.request({ url });
  const databases = response.data.databases || [];

  console.log(`\nFirestore databases in project: ${projectId}\n`);

  if (databases.length === 0) {
    console.log('No databases found.');
    return;
  }

  for (const db of databases) {
    const id = db.name.split('/').pop();
    console.log(`  Database ID: ${id}`);
    console.log(`  Type:        ${db.type || 'unknown'}`);
    console.log(`  Location:    ${db.locationId || 'unknown'}`);
    console.log('');
  }

  const aiStudio = databases.find((db) => db.name.includes('ai-studio'));
  const recommended = aiStudio || databases[0];
  const recommendedId = recommended.name.split('/').pop();

  console.log('Add this to backend/.env:\n');
  console.log(`FIRESTORE_DATABASE_ID=${recommendedId}\n`);
}

listDatabases().catch((err) => {
  console.error('Failed to list databases:', err.message);
  process.exit(1);
});
