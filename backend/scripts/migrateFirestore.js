/**
 * One-time migration: Firebase Firestore (books + book_sections) → MongoDB Scriptures
 *
 * Setup:
 *   1. Firebase Console → Project Settings → Service accounts → Generate new private key
 *   2. Save as backend/firebase-service-account.json (or set FIREBASE_SERVICE_ACCOUNT_PATH)
 *   3. npm install (firebase-admin is in package.json)
 *
 * Usage:
 *   node scripts/migrateFirestore.js --audit          # list unique Firebase categories only
 *   node scripts/migrateFirestore.js --dry-run        # preview without writing
 *   node scripts/migrateFirestore.js --limit=5      # migrate first 5 books only
 *   node scripts/migrateFirestore.js                  # full migration
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { connectDatabase } = require('../src/config/database');
const Scripture = require('../src/models/scripture.model');
const { mapCategory, normalizeLabel } = require('./categoryMapping');

const REPORT_PATH = path.join(__dirname, '../migration-report.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    audit: false,
    dryRun: false,
    limit: null,
  };

  for (const arg of args) {
    if (arg === '--audit') options.audit = true;
    if (arg === '--dry-run') options.dryRun = true;
    if (arg.startsWith('--limit=')) {
      options.limit = Number.parseInt(arg.split('=')[1], 10);
    }
  }

  return options;
}

function getServiceAccountPath() {
  const configured = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(__dirname, '..', configured);
  }
  return path.join(__dirname, '../firebase-service-account.json');
}

function initFirebase() {
  const serviceAccountPath = getServiceAccountPath();

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('\nFirebase service account file not found.');
    console.error(`Expected: ${serviceAccountPath}`);
    console.error('\nDownload from Firebase Console → Project Settings → Service accounts');
    console.error('→ Generate new private key → save as firebase-service-account.json\n');
    process.exit(1);
  }

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log(`Firebase project: ${serviceAccount.project_id}`);

  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  if (!databaseId) {
    console.error('\nFIRESTORE_DATABASE_ID is not set in backend/.env');
    console.error('Your data is in a named AI Studio database (not the default).');
    console.error('Run: npm run migrate:list-databases');
    console.error('Then copy the database id into .env, e.g.:');
    console.error('FIRESTORE_DATABASE_ID=ai-studio-fb790570-d705-4aba-a370-...\n');
    process.exit(1);
  }

  console.log(`Firestore database: ${databaseId}`);

  return getFirestore(admin.app(), databaseId);
}

function groupSections(sectionsSnap) {
  const sectionsByBook = new Map();

  sectionsSnap.forEach((doc) => {
    const data = doc.data();
    const bookId = data.bookId;
    if (!bookId) return;

    if (!sectionsByBook.has(bookId)) {
      sectionsByBook.set(bookId, []);
    }

    sectionsByBook.get(bookId).push({
      id: doc.id,
      ...data,
    });
  });

  for (const sections of sectionsByBook.values()) {
    sections.sort((a, b) => {
      const indexA = typeof a.index === 'number' ? a.index : 0;
      const indexB = typeof b.index === 'number' ? b.index : 0;
      return indexA - indexB;
    });
  }

  return sectionsByBook;
}

function buildDescription(book) {
  const parts = [];
  if (book.description?.trim()) parts.push(book.description.trim());
  if (book.sourceUrl?.trim()) parts.push(`Source: ${book.sourceUrl.trim()}`);
  if (book.language?.trim()) parts.push(`Language: ${book.language.trim()}`);
  return parts.join('\n\n');
}

function buildVerses(sections) {
  return sections
    .map((section) => ({
      telugu: (section.content || section.text || '').trim(),
      meaning: (section.meaning || section.artham || '').trim(),
    }))
    .filter((verse) => verse.telugu || verse.meaning);
}

async function runAudit(firestore) {
  const booksSnap = await firestore.collection('books').get();
  const categorySet = new Map();

  booksSnap.forEach((doc) => {
    const book = doc.data();
    const key = [
      normalizeLabel(book.mainCategory),
      normalizeLabel(book.category),
      normalizeLabel(book.subCategory),
    ].join(' | ');

    if (!categorySet.has(key)) {
      categorySet.set(key, {
        mainCategory: book.mainCategory || '',
        category: book.category || '',
        subCategory: book.subCategory || '',
        mapped: mapCategory(book),
        count: 0,
      });
    }
    categorySet.get(key).count += 1;
  });

  const rows = [...categorySet.values()].sort((a, b) => b.count - a.count);

  console.log('\nFirebase category audit\n');
  console.log('mainCategory | category | subCategory → mapped slug | count');
  console.log('-'.repeat(72));
  for (const row of rows) {
    const mapped = row.mapped || 'UNMAPPED';
    console.log(
      `${row.mainCategory || '-'} | ${row.category || '-'} | ${row.subCategory || '-'} → ${mapped} | ${row.count}`
    );
  }

  const unmapped = rows.filter((row) => !row.mapped);
  console.log(`\nTotal books: ${booksSnap.size}`);
  console.log(`Unique category combos: ${rows.length}`);
  console.log(`Unmapped combos: ${unmapped.length}\n`);

  if (unmapped.length > 0) {
    console.log('Add aliases for unmapped values in scripts/categoryMapping.js before migrating.\n');
  }
}

async function migrate() {
  const options = parseArgs();
  const firestore = initFirebase();

  if (options.audit) {
    await runAudit(firestore);
    process.exit(0);
  }

  await connectDatabase();

  const [booksSnap, sectionsSnap] = await Promise.all([
    firestore.collection('books').get(),
    firestore.collection('book_sections').get(),
  ]);

  const sectionsByBook = groupSections(sectionsSnap);
  let bookDocs = booksSnap.docs.slice();

  bookDocs.sort((a, b) => {
    const orderA = a.data().orderIndex ?? 9999;
    const orderB = b.data().orderIndex ?? 9999;
    return orderA - orderB;
  });

  if (options.limit && options.limit > 0) {
    bookDocs = bookDocs.slice(0, options.limit);
  }

  const report = {
    startedAt: new Date().toISOString(),
    dryRun: options.dryRun,
    limit: options.limit,
    totalBooksInFirebase: booksSnap.size,
    totalSectionsInFirebase: sectionsSnap.size,
    processed: 0,
    inserted: 0,
    skippedExisting: 0,
    failed: 0,
    issues: [],
    successes: [],
  };

  console.log(`\nMigrating ${bookDocs.length} of ${booksSnap.size} books (${sectionsSnap.size} sections in Firebase)…`);
  if (options.dryRun) console.log('DRY RUN — nothing will be written to MongoDB\n');

  for (const bookDoc of bookDocs) {
    const bookId = bookDoc.id;
    const book = bookDoc.data();
    report.processed += 1;

    const category = mapCategory(book);
    const sections = sectionsByBook.get(bookId) || [];
    const verses = buildVerses(sections);
    const expectedSections = book.totalSections ?? sections.length;

    const issueBase = {
      firebaseId: bookId,
      title: book.title || '',
      mainCategory: book.mainCategory || '',
      subCategory: book.subCategory || '',
    };

    if (!book.title?.trim()) {
      report.failed += 1;
      report.issues.push({ ...issueBase, reason: 'Missing title' });
      continue;
    }

    if (!category) {
      report.failed += 1;
      report.issues.push({
        ...issueBase,
        reason: 'Unmapped category',
        category: book.category || '',
      });
      continue;
    }

    if (expectedSections > 0 && sections.length === 0) {
      report.issues.push({
        ...issueBase,
        reason: 'Missing book_sections',
        expectedSections,
        foundSections: 0,
      });
    }

    if (verses.length === 0 && book.type !== 'image') {
      report.issues.push({
        ...issueBase,
        reason: 'No verse content',
        expectedSections,
        foundSections: sections.length,
      });
    }

    const payload = {
      title_telugu: book.title.trim(),
      title_english: (book.titleEnglish || book.title_english || '').trim(),
      category,
      deity: (book.deity || '').trim(),
      description: buildDescription(book),
      cover_url: book.coverUrl || book.cover_url || book.imageUrl || null,
      popularity: typeof book.views === 'number' && book.views > 0
        ? Math.min(book.views, 100)
        : 80,
      verses,
      legacyFirebaseId: bookId,
    };

    if (options.dryRun) {
      report.successes.push({
        firebaseId: bookId,
        title: payload.title_telugu,
        category: payload.category,
        verseCount: payload.verses.length,
      });
      continue;
    }

    const existing = await Scripture.findOne({ legacyFirebaseId: bookId });
    if (existing) {
      report.skippedExisting += 1;
      report.successes.push({
        firebaseId: bookId,
        title: payload.title_telugu,
        category: payload.category,
        verseCount: payload.verses.length,
        status: 'skipped_existing',
      });
      continue;
    }

    await Scripture.create(payload);
    report.inserted += 1;
    report.successes.push({
      firebaseId: bookId,
      title: payload.title_telugu,
      category: payload.category,
      verseCount: payload.verses.length,
      status: 'inserted',
    });
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log('\nMigration complete\n');
  console.log(`Processed:        ${report.processed}`);
  console.log(`Inserted:         ${report.inserted}`);
  console.log(`Skipped existing: ${report.skippedExisting}`);
  console.log(`Failed:           ${report.failed}`);
  console.log(`Issues logged:    ${report.issues.length}`);
  console.log(`Report saved:     ${REPORT_PATH}\n`);

  await admin.app().delete();
  process.exit(report.failed > 0 ? 1 : 0);
}

migrate().catch(async (err) => {
  console.error('\nMigration failed:', err.message);
  if (err.message?.includes('NOT_FOUND')) {
    console.error('\nFirestore NOT_FOUND usually means:');
    console.error('  1. Firestore is not enabled in this Firebase project, OR');
    console.error('  2. The service account JSON is from a different project than your books data.');
    console.error('\nCheck Firebase Console → select the project with "books" collection');
    console.error('→ Build → Firestore Database → confirm it exists');
    console.error('→ Project Settings → Service accounts → download key from THAT project\n');
  }
  try {
    await admin.app().delete();
  } catch {
    // ignore cleanup errors
  }
  process.exit(1);
});
