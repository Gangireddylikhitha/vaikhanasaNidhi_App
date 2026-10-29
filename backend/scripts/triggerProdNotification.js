require('dotenv').config();

const API_BASE = 'https://api.vaikhanasanidhi.com/api';

async function main() {
  const username = process.env.ADMIN_USERNAME || 'sriharsharompicharla2000@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'HarshaComrade18';

  console.log(`🔐 Logging into Production API (${API_BASE}) as ${username}...`);

  const loginRes = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    console.error('❌ Admin login failed:', loginData);
    process.exit(1);
  }

  const token = loginData.token;
  console.log('✅ Logged in successfully as Admin.');

  console.log('🚀 Creating dummy scripture to trigger push notification from production AWS server...');

  const createRes = await fetch(`${API_BASE}/admin/scriptures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title_telugu: '🔔 ప్రత్యక్ష నోటిఫికేషన్ పరీక్ష (Live Test)',
      title_english: 'Test Push Notification',
      category: 'stotra',
      description: 'మీ ఫోన్‌కు నోటిఫికేషన్ విజయవంతంగా చేరింది! (Notification received successfully)',
      verses: [
        { telugu: 'ఓం నమో వేంకటేశాయ', meaning: 'Salutations to Lord Venkateswara' }
      ]
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    console.error('❌ Failed to trigger scripture notification:', createData);
    process.exit(1);
  }

  console.log('🎉 Notification triggered from AWS! Scripture ID:', createData.id);
  console.log('📱 Check your phone now for the notification!');

  // Wait 10 seconds, then clean up the test scripture
  console.log('⏳ Cleaning up test scripture in 10 seconds...');
  await new Promise((r) => setTimeout(r, 10000));

  const deleteRes = await fetch(`${API_BASE}/admin/scriptures/${createData.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (deleteRes.ok) {
    console.log('🧹 Test scripture cleaned up cleanly from database.');
  }

  console.log('✨ All done!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});
