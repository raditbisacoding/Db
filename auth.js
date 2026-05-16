const SESSION_KEY = 'epin_session';
const SESSION_DURATION = 30 * 60 * 1000;

function validatePageAccess(requiredRole) {
    const session = getCurrentSession();
    if (!session) { window.location.href = 'index.html'; return false; }
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = urlParams.get('hash');
    if (!urlHash || urlHash !== session.hash) {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
        return false;
    }
    
    const roleLevel = { 'reseller': 1, 'super_reseller': 2, 'owner': 3, 'developer': 4 };
    if (roleLevel[session.role] < roleLevel[requiredRole]) {
        if (session.role === 'developer') window.location.href = `developer.html?hash=${session.hash}`;
        else if (session.role === 'owner') window.location.href = `owner.html?hash=${session.hash}`;
        else if (session.role === 'super_reseller') window.location.href = `superreseller.html?hash=${session.hash}`;
        else window.location.href = `reseller.html?hash=${session.hash}`;
        return false;
    }
    
    resetAutoLogout();
    displayUserInfo(session);
    return true;
}

function getCurrentSession() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
        const parsed = JSON.parse(session);
        if (parsed.expires > Date.now()) return parsed;
        localStorage.removeItem(SESSION_KEY);
        return null;
    } catch(e) { return null; }
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}

function displayUserInfo(session) {
    const roleNames = { developer: '👑 DEVELOPER', owner: '👑 OWNER', super_reseller: '⭐ SUPER RESELLER', reseller: '🛡️ RESELLER' };
    const roleIcons = { developer: 'fa-code', owner: 'fa-crown', super_reseller: 'fa-star', reseller: 'fa-store' };
    document.querySelectorAll('.user-info').forEach(el => {
        if (el) {
            el.innerHTML = `<span class="badge ${session.role}"><i class="fas ${roleIcons[session.role]}"></i> ${roleNames[session.role]}</span>
                <span class="user-name" style="font-size:12px; color:#ff6600;">${session.name || session.role}</span>
                <button class="btn-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>`;
        }
    });
    document.querySelectorAll('.sidebar-header p').forEach(el => {
        if (el) el.innerHTML = `@${session.role} | <i class="fab fa-telegram"></i> @epineek`;
    });
    document.querySelectorAll('.role-title').forEach(el => {
        if (el) el.innerHTML = `👑 Role Kamu: ${session.role.toUpperCase()}`;
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : (type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'));
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeSlideDown 0.3s ease-out'; setTimeout(() => toast.remove(), 300); }, 3000);
}

let logoutTimer;
function startAutoLogout() {
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        showToast('Session habis, akan logout otomatis', 'warning');
        setTimeout(() => { localStorage.removeItem(SESSION_KEY); window.location.href = 'index.html'; }, 2000);
    }, SESSION_DURATION);
}
function resetAutoLogout() { if (logoutTimer) clearTimeout(logoutTimer); startAutoLogout(); }

if (typeof document !== 'undefined') {
    document.addEventListener('mousemove', resetAutoLogout);
    document.addEventListener('keypress', resetAutoLogout);
    document.addEventListener('click', resetAutoLogout);
    document.addEventListener('scroll', resetAutoLogout);
}

window.logout = logout;
window.showToast = showToast;
window.validatePageAccess = validatePageAccess;