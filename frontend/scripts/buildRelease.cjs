const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.resolve(__dirname, '..');
const ANDROID_DIR = path.join(FRONTEND_DIR, 'android');
const BUILD_GRADLE_PATH = path.join(ANDROID_DIR, 'app', 'build.gradle');
const PACKAGE_JSON_PATH = path.join(FRONTEND_DIR, 'package.json');
const KEYSTORE_PROPS_PATH = path.join(ANDROID_DIR, 'keystore.properties');
const JKS_PATH = path.join(ANDROID_DIR, 'app', 'vaikhanasa-upload.jks');
const RELEASE_OUTPUT_DIR = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', 'release');
const CONVENIENCE_RELEASE_DIR = path.join(ANDROID_DIR, 'app', 'release');

function runCommand(command, cwd) {
  console.log(`\n⚙️  Running: ${command} in ${cwd}`);
  execSync(command, { cwd, stdio: 'inherit', shell: true });
}

function bumpPatchVersion(version) {
  const parts = version.split('.').map(Number);
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    parts[2] += 1;
    return parts.join('.');
  }
  return version;
}

function ensureKeystore() {
  if (!fs.existsSync(JKS_PATH)) {
    console.warn(`⚠️ Warning: Upload keystore not found at ${JKS_PATH}`);
  }

  const defaultProps = [
    'storeFile=app/vaikhanasa-upload.jks',
    'storePassword=VaikhanasaNidhi@2026Upload',
    'keyAlias=vaikhanasa',
    'keyPassword=VaikhanasaNidhi@2026Upload',
    '',
  ].join('\n');

  if (!fs.existsSync(KEYSTORE_PROPS_PATH)) {
    console.log('📝 Creating keystore.properties...');
    fs.writeFileSync(KEYSTORE_PROPS_PATH, defaultProps, 'utf8');
  } else {
    let content = fs.readFileSync(KEYSTORE_PROPS_PATH, 'utf8');
    if (content.includes('storeFile=android/app/')) {
      content = content.replace('storeFile=android/app/', 'storeFile=app/');
      fs.writeFileSync(KEYSTORE_PROPS_PATH, content, 'utf8');
      console.log('🔧 Fixed storeFile path in keystore.properties');
    }
  }
}

function main() {
  console.log('==============================================');
  console.log('🚀 AUTOMATED ANDROID PLAY STORE RELEASE BUILD');
  console.log('==============================================');

  // 1. Check keystore configuration
  ensureKeystore();

  // 2. Read and parse current build.gradle versions
  if (!fs.existsSync(BUILD_GRADLE_PATH)) {
    throw new Error(`build.gradle not found at ${BUILD_GRADLE_PATH}`);
  }

  let gradleContent = fs.readFileSync(BUILD_GRADLE_PATH, 'utf8');
  const codeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  const nameMatch = gradleContent.match(/versionName\s+["']([^"']+)["']/);

  if (!codeMatch || !nameMatch) {
    throw new Error('Could not find versionCode or versionName in build.gradle');
  }

  const oldCode = parseInt(codeMatch[1], 10);
  const oldName = nameMatch[1];
  const newCode = oldCode + 1;

  // Custom version name passed from CLI argument (e.g. npm run release:bundle -- 1.0.4)
  const argVersion = process.argv[2];
  const newName = argVersion && argVersion.trim() ? argVersion.trim() : bumpPatchVersion(oldName);

  console.log(`\n📌 Version Update:`);
  console.log(`   - versionCode: ${oldCode} ➜  ${newCode}`);
  console.log(`   - versionName: "${oldName}" ➜  "${newName}"`);

  // Update build.gradle
  gradleContent = gradleContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${newCode}`
  );
  gradleContent = gradleContent.replace(
    /versionName\s+["'][^"']+["']/,
    `versionName "${newName}"`
  );
  fs.writeFileSync(BUILD_GRADLE_PATH, gradleContent, 'utf8');
  console.log('✅ Updated android/app/build.gradle');

  // Update package.json
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    pkg.version = newName;
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('✅ Updated frontend/package.json');
  }

  // 3. Build Web Assets & Sync Capacitor
  console.log('\n📦 Step 1: Building frontend & syncing Capacitor...');
  runCommand('npm run build:mobile', FRONTEND_DIR);
  runCommand('npx cap sync android', FRONTEND_DIR);

  // 4. Build Signed Android App Bundle (.aab)
  console.log('\n🔨 Step 2: Building signed release bundle with Gradle...');
  const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat bundleRelease' : './gradlew bundleRelease';
  runCommand(gradlewCmd, ANDROID_DIR);

  // 5. Verify & Copy Output
  const sourceAab = path.join(RELEASE_OUTPUT_DIR, 'app-release.aab');
  if (!fs.existsSync(sourceAab)) {
    throw new Error(`Expected bundle not found at ${sourceAab}`);
  }

  if (!fs.existsSync(CONVENIENCE_RELEASE_DIR)) {
    fs.mkdirSync(CONVENIENCE_RELEASE_DIR, { recursive: true });
  }

  const destAab = path.join(CONVENIENCE_RELEASE_DIR, 'app-release.aab');
  fs.copyFileSync(sourceAab, destAab);

  const stats = fs.statSync(destAab);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n==============================================');
  console.log('🎉 RELEASE BUILD FINISHED SUCCESSFULLY!');
  console.log('==============================================');
  console.log(`📱 Version Name : ${newName}`);
  console.log(`🔢 Version Code : ${newCode}`);
  console.log(`📦 Bundle Size  : ${sizeMb} MB`);
  console.log(`📁 Upload File  : ${destAab}`);
  console.log('==============================================');
  console.log('👉 Ready to upload to Google Play Console (Production / Release track)!');
}

try {
  main();
} catch (err) {
  console.error('\n❌ Release build failed:', err.message);
  process.exit(1);
}
