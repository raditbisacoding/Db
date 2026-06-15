// 📁 Lokasi file: /api/add-number.js
// Tujuan: Endpoint untuk menambah nomor WhatsApp ke daftar akses

export default async function handler(req, res) {
    // 1. Hanya izinkan metode POST (untuk keamanan)
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method tidak diizinkan. Gunakan POST.' });
    }

    // 2. Ambil data nomor dari body request
    const { nomor, password } = req.body;

    // 3. Validasi password sederhana (ubah sesuai keinginan Anda)
    const validPassword = 'radit123'; // Ganti dengan password rahasia Anda
    if (password !== validPassword) {
        return res.status(401).json({ status: 'error', message: 'Password salah! Akses ditolak.' });
    }

    // 4. Validasi nomor
    if (!nomor || nomor.length < 10) {
        return res.status(400).json({ status: 'error', message: 'Nomor tidak valid.' });
    }

    // 5. Simpan nomor ke database (contoh sederhana dengan array global)
    // ⚠️ PERINGATAN: Contoh ini hanya untuk ilustrasi.
    // Data akan hilang setiap server restart. Anda HARUS menggunakan database nyata.
    if (!global.aksesList) {
        global.aksesList = [];
    }
    if (global.aksesList.includes(nomor)) {
        return res.status(409).json({ status: 'error', message: 'Nomor sudah ada dalam daftar akses.' });
    }

    global.aksesList.push(nomor);
    console.log('✅ Nomor ditambahkan:', nomor);

    // 6. Kirim respons sukses
    res.status(200).json({
        status: 'success',
        message: 'Nomor berhasil ditambahkan ke daftar akses.',
        data: { nomor: nomor }
    });
}
