// api/change-password.js - Endpoint untuk ganti password role
const FIREBASE_URL = 'https://database-858e5-default-rtdb.asia-southeast1.firebasedatabase.app/';

// Password default
const DEFAULT_PASSWORDS = {
    'developer': 'radit123',
    'owner': 'ikhwanul',
    'super_reseller': 'wawakinul',
    'reseller': 'ikhwanulreseller'
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { role, oldPassword, newPassword } = req.body;
    
    if (!role || !oldPassword || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Role, oldPassword, dan newPassword diperlukan' 
        });
    }
    
    if (!DEFAULT_PASSWORDS[role]) {
        return res.status(400).json({ 
            success: false, 
            message: 'Role tidak valid' 
        });
    }
    
    if (oldPassword !== DEFAULT_PASSWORDS[role]) {
        return res.status(401).json({ 
            success: false, 
            message: 'Password lama salah!' 
        });
    }
    
    try {
        const passwordsRef = `${FIREBASE_URL}epin_passwords.json`;
        const getResponse = await fetch(passwordsRef);
        let passwords = await getResponse.json() || {};
        
        passwords[role] = newPassword;
        
        await fetch(passwordsRef, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwords)
        });
        
        return res.status(200).json({
            success: true,
            message: `Password untuk role ${role} berhasil diubah!`
        });
        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
