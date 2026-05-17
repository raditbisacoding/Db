export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    let phoneNumber = '';
    if (req.method === 'GET') {
        phoneNumber = req.query.number || req.query.phone || '';
    } else if (req.method === 'POST') {
        phoneNumber = req.body.number || req.body.phone || '';
    }
    
    if (!phoneNumber) {
        return res.status(400).json({
            status: 'error',
            message: 'Parameter "number" atau "phone" diperlukan',
            example: '/api/validate?number=628123456789'
        });
    }
    
    let formattedNumber = phoneNumber.toString().replace(/[^0-9]/g, '');
    if (!formattedNumber.startsWith('62')) formattedNumber = '62' + formattedNumber;
    
    try {
        const response = await fetch(https://database-858e5-default-rtdb.asia-southeast1.firebasedatabase.app/epin_active_numbers.json');
        const activeNumbers = await response.json();
        const numbers = Array.isArray(activeNumbers) ? activeNumbers : [];
        const isValid = numbers.includes(formattedNumber);
        
        const blockedResponse = await fetch('https://database-858e5-default-rtdb.asia-southeast1.firebasedatabase.app/epin_blocked_numbers.json');
        const blockedNumbers = await blockedResponse.json();
        const blocked = Array.isArray(blockedNumbers) ? blockedNumbers : [];
        const isBlocked = blocked.includes(formattedNumber);
        
        return res.status(200).json({
            status: 'success',
            data: {
                number: formattedNumber,
                isValid: isValid && !isBlocked,
                isRegistered: isValid,
                isBlocked: isBlocked,
                message: isValid ? (isBlocked ? 'Nomor diblokir' : 'Akses diterima') : 'Nomor tidak terdaftar'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
