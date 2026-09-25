require('dotenv').config();

const API_BASE = 'https://api.vaikhanasanidhi.com/api';

async function main() {
  const username = process.env.ADMIN_USERNAME || 'sriharsharompicharla2000@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'HarshaComrade18';

  console.log('🔐 Logging in as Admin...');
  const loginRes = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log('🚀 Calling /admin/test-notification on AWS...');
  const testRes = await fetch(`${API_BASE}/admin/test-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: '🕉️ వైఖానస నిధి — ప్రత్యక్ష నోటిఫికేషన్!',
      body: 'మీ ఫోన్‌కు నోటిఫికేషన్ విజయవంతంగా చేరింది! (Live FCM Push Test)',
    }),
  });

  const testData = await testRes.json();
  console.log('📊 Result from AWS:');
  console.log(JSON.stringify(testData, null, 2));
}

main().catch((err) => console.error(err));
