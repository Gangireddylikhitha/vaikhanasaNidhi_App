//  Created 1-Click Automated Release Command!
// I have created an automated build script and registered a simple npm command: npm run release:bundle.

// ⚡ How to Use It (Whenever you want to release a new version):
// Open PowerShell in the frontend folder and run:

// powershell


// cd "c:\vaikhanasa nidhi\vaikhanasaNidhi_App\frontend"


//main command to run the script
// npm run release:bundle
///////////////////////////


// (Optional: If you want to specify a custom version name like 1.1.0, you can run: npm run release:bundle -- 1.1.0)

// 🤖 What This Single Command Does Automatically:
// Auto-Increments Version Numbers:
// Reads versionCode and bumps it (e.g. 5 ➔ 6).
// Increments versionName (e.g. 1.0.3 ➔ 1.0.4).
// Updates both 
// android/app/build.gradle
//  and 
// frontend/package.json
// .
// Checks & Fixes Keystore Properties:
// Ensures keystore.properties is present and points to your release keystore app/vaikhanasa-upload.jks.
// Builds Web Assets & Syncs Capacitor:
// Runs npm run build:mobile (Vite build) and npx cap sync android.
// Builds & Signs the Release Bundle (.aab):
// Runs Gradle bundleRelease using your upload keystore.
// Copies the Output File:
// Places the signed bundle at frontend/android/app/release/app-release.aab ready for instant upload to Google Play Console.
// 📋 Sample Output:
// text


// ==============================================
// 🎉 RELEASE BUILD FINISHED SUCCESSFULLY!
// ==============================================
// 📱 Version Name : 1.0.4
// 🔢 Version Code : 6
// 📦 Bundle Size  : 34.78 MB
// 📁 Upload File  : c:\vaikhanasa nidhi\vaikhanasaNidhi_App\frontend\android\app\release\app-release.aab
// ==============================================
// 👉 Ready to upload to Google Play Console (Production / Release track)!