const FIREBASE_URL = 'https://epin-3b848-default-rtdb.asia-southeast1.firebasedatabase.app/';

const DB_ACTIVE = `${FIREBASE_URL}epin_active_numbers.json`;
const DB_BLOCKED = `${FIREBASE_URL}epin_blocked_numbers.json`;
const DB_CHAT = `${FIREBASE_URL}epin_chat_messages.json`;
const DB_ACTIVITY = `${FIREBASE_URL}epin_activity_log.json`;
const DB_PASSWORDS = `${FIREBASE_URL}epin_passwords.json`;

// Role level
const ROLE_LEVEL = {
    'reseller': 1,
    'super_reseller': 2,
    'owner': 3,
    'developer': 4
};

// Password default
const DEFAULT_PASSWORDS = {
    'developer': 'epindev2024',
    'owner': 'epinyaya',
    'super_reseller': 'epinsuper',
    'reseller': 'epinreseller'
};

async function fetchFromFirebase(url, options = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...options.headers } });
        clearTimeout(timeoutId);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) { return null; }
}

async function saveToFirebase(url, data, method = 'PUT') {
    try {
        const response = await fetch(url, { method: method, body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
        return await response.json();
    } catch (error) { return null; }
}

function getEpinTime() {
    const now = new Date();
    const date = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' });
    const time = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
    return { date, time, full: `${date} - ${time}`, timestamp: now.toISOString() };
}

async function loginWithPassword(password) {
    const passwords = await fetchFromFirebase(DB_PASSWORDS) || DEFAULT_PASSWORDS;
    
    if (password === passwords.developer) {
        return { success: true, role: 'developer', name: 'Master Developer', dashboard: 'developer.html' };
    }
    if (password === passwords.owner) {
        return { success: true, role: 'owner', name: 'Epin Store Owner', dashboard: 'owner.html' };
    }
    if (password === passwords.super_reseller) {
        return { success: true, role: 'super_reseller', name: 'Super Reseller', dashboard: 'superreseller.html' };
    }
    if (password === passwords.reseller) {
        return { success: true, role: 'reseller', name: 'Reseller', dashboard: 'reseller.html' };
    }
    
    return { success: false, message: 'Password salah!' };
}

function getDashboardUrl(role) {
    const hash = Math.random().toString(36).substring(2, 10);
    switch(role) {
        case 'developer': return `developer.html?hash=${hash}`;
        case 'owner': return `owner.html?hash=${hash}`;
        case 'super_reseller': return `superreseller.html?hash=${hash}`;
        default: return `reseller.html?hash=${hash}`;
    }
}

async function logEpinActivity(action, role, details) {
    const { date, time, timestamp } = getEpinTime();
    const existing = await fetchFromFirebase(DB_ACTIVITY) || [];
    existing.unshift({ action, role, details, date, time, timestamp });
    if (existing.length > 200) existing.pop();
    await saveToFirebase(DB_ACTIVITY, existing);
}

async function getGlobalChat() { return await fetchFromFirebase(DB_CHAT) || []; }
async function sendGlobalChat(username, message, role) {
    const { time, date } = getEpinTime();
    const chats = await getGlobalChat();
    chats.push({ username, role, message, time, date, timestamp: Date.now() });
    if (chats.length > 100) chats.shift();
    await saveToFirebase(DB_CHAT, chats);
    return true;
}

async function getActiveNumbers() {
    const numbers = await fetchFromFirebase(DB_ACTIVE);
    return Array.isArray(numbers) ? numbers : [];
}

async function addNumberToDatabase(phoneNumber) {
    const numbers = await getActiveNumbers();
    if (numbers.includes(phoneNumber)) {
        return { success: false, message: 'Nomor sudah terdaftar!' };
    }
    numbers.push(phoneNumber);
    await saveToFirebase(DB_ACTIVE, numbers);
    return { success: true, message: 'Nomor berhasil ditambahkan!', total: numbers.length };
}

async function deleteNumberFromDatabase(phoneNumber) {
    const numbers = await getActiveNumbers();
    if (!numbers.includes(phoneNumber)) {
        return { success: false, message: 'Nomor tidak ditemukan!' };
    }
    const newNumbers = numbers.filter(n => n !== phoneNumber);
    await saveToFirebase(DB_ACTIVE, newNumbers);
    return { success: true, message: 'Nomor berhasil dihapus!', total: newNumbers.length };
}

async function checkNumberStatus(phoneNumber) {
    const numbers = await getActiveNumbers();
    const isRegistered = numbers.includes(phoneNumber);
    
    const blocked = await fetchFromFirebase(DB_BLOCKED) || [];
    const isBlocked = blocked.includes(phoneNumber);
    
    if (isBlocked) return { status: 'blocked', message: '❌ Nomor diblokir!' };
    if (isRegistered) return { status: 'active', message: '✅ Nomor aktif dan terdaftar!' };
    return { status: 'not_registered', message: '⚠️ Nomor tidak terdaftar!' };
}