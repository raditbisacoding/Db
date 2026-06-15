// 📁 Lokasi: /api/add-number.js
import admin from 'firebase-admin';

// Cegah multiple initialization di Vercel
if (!admin.apps.length) {
  // Gunakan variabel lingkungan untuk keamanan
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.database();

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method tidak diizinkan' });
  }

  const { nomor, password } = req.body;
  const validPassword = 'radit123'; // Ganti dengan password Anda

  // Validasi password
  if (password !== validPassword) {
    return res.status(401).json({ status: 'error', message: 'Password salah!' });
  }

  // Validasi nomor
  if (!nomor || nomor.length < 10 || isNaN(nomor)) {
    return res.status(400).json({ status: 'error', message: 'Nomor tidak valid!' });
  }

  try {
    const ref = db.ref(`akses/${nomor}`);
    const snapshot = await ref.get();

    if (snapshot.exists()) {
      return res.status(409).json({ status: 'error', message: 'Nomor sudah terdaftar!' });
    }

    // Simpan ke Firebase dengan struktur data
    await ref.set({
      nomor: nomor,
      addedAt: Date.now(),
      addedBy: 'bot',
      status: 'active'
    });

    console.log(`✅ Nomor ${nomor} berhasil ditambahkan.`);
    res.status(200).json({
      status: 'success',
      message: 'Nomor berhasil ditambahkan ke daftar akses.',
      data: { nomor }
    });
  } catch (error) {
    console.error('Error Firebase:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}    // 6. Kirim respons sukses
    res.status(200).json({
        status: 'success',
        message: 'Nomor berhasil ditambahkan ke daftar akses.',
        data: { nomor: nomor }
    });
}
