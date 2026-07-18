// store.js — dipakai bersama oleh index.html (daftar) dan new.html (tambah kode).
// Semua data snippet disimpan di localStorage, jadi otomatis nyambung antar halaman
// selama dibuka dari origin/domain yang sama.

const STORAGE_KEY = 'ibusatset_snippets_v1';
const SEED_URL = 'codes/example.json';
const ADMIN_SESSION_KEY = 'ibusatset_admin_ok';

// Ganti hash ini kalau mau ubah password admin.
// Cara generate hash baru (jalankan di Node atau console browser):
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('passwordBaru'))
//     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
// Password default saat ini: ibusatset
const ADMIN_PASSWORD_HASH =
  '59996ac37916b9b201cd56879a600f4089cac4d1a8f5bbca5ebfa8a2756bea1b';

function loadSnippets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Gagal membaca localStorage', e);
  }
  return [];
}

function saveSnippets(snippets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

async function seedIfEmpty(snippets) {
  if (snippets.length) return snippets;
  try {
    const res = await fetch(SEED_URL);
    if (res.ok) {
      const example = await res.json();
      snippets.push(normalize(example));
      saveSnippets(snippets);
    }
  } catch (e) {
    // Tidak masalah kalau seed gagal (mis. dibuka langsung dari file://)
  }
  return snippets;
}

function normalize(raw) {
  return {
    id: raw.id || cryptoId(),
    title: raw.title || 'Tanpa judul',
    subtitle: raw.subtitle || '',
    type: raw.type || 'plaintext',
    filename: raw.filename || '',
    footer: raw.footer || '',
    code: raw.code || '',
    createdAt: raw.createdAt || Date.now(),
  };
}

function cryptoId() {
  return 'sn_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkAdminPassword(input) {
  const hash = await sha256(input);
  return hash === ADMIN_PASSWORD_HASH;
}

function isAdminUnlocked() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

function setAdminUnlocked() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}
