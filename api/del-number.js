// 📁 Lokasi: /api/del-number.js
const FIREBASE_URL = 'https://database-858e5-default-rtdb.asia-southeast1.firebasedatabase.app/';
const API_KEY = 'radit123'; // Ganti dengan password/kunci Anda sendiri

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method tidak diizinkan' });
    }

    const { nomor, password } = req.body || {};

    if (password !== API_KEY) {
        return res.status(401).json({ status: 'error', message: 'Password salah!' });
    }

    let formattedNumber = (nomor || '').toString().replace(/[^0-9]/g, '');
    if (formattedNumber && !formattedNumber.startsWith('62')) formattedNumber = '62' + formattedNumber;

    if (!formattedNumber || formattedNumber.length < 10) {
        return res.status(400).json({ status: 'error', message: 'Nomor tidak valid!' });
    }

    try {
        const listUrl = `${FIREBASE_URL}epin_active_numbers.json`;
        const current = await (await fetch(listUrl)).json();
        const numbers = Array.isArray(current) ? current : [];

        if (!numbers.includes(formattedNumber)) {
            return res.status(404).json({ status: 'error', message: 'Nomor tidak ditemukan di daftar akses!' });
        }

        const updated = numbers.filter(n => n !== formattedNumber);

        await fetch(listUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });

        console.log(`🗑️ Nomor ${formattedNumber} berhasil dihapus.`);
        return res.status(200).json({
            status: 'success',
            message: 'Nomor berhasil dihapus dari daftar akses.',
            data: { nomor: formattedNumber, total: updated.length }
        });
    } catch (error) {
        console.error('Error Firebase:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
