// new.js — logika untuk new.html (tambah snippet, dikunci password admin)

const $ = (sel) => document.querySelector(sel);

const gateSection = $('#gate');
const formSection = $('#form-section');
const gateForm = $('#gate-form');
const gateInput = $('#gate-password');
const gateError = $('#gate-error');
const adminBadge = $('#admin-badge');
const logoutBtn = $('#btn-logout');

function showUnlocked() {
  gateSection.hidden = true;
  formSection.hidden = false;
  adminBadge.hidden = false;
}

function showLocked() {
  gateSection.hidden = false;
  formSection.hidden = true;
  adminBadge.hidden = true;
}

if (isAdminUnlocked()) {
  showUnlocked();
} else {
  showLocked();
}

gateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  gateError.hidden = true;
  const ok = await checkAdminPassword(gateInput.value);
  if (ok) {
    setAdminUnlocked();
    gateInput.value = '';
    showUnlocked();
    toast('Masuk sebagai admin');
  } else {
    gateError.hidden = false;
    gateInput.value = '';
    gateInput.focus();
  }
});

logoutBtn.addEventListener('click', () => {
  logoutAdmin();
  showLocked();
  toast('Keluar dari mode admin');
});

$('#snip-form').addEventListener('submit', (e) => {
  e.preventDefault();

  // Jaga-jaga: pastikan masih dalam sesi admin saat submit (misal sesi kadaluarsa/tab lain logout).
  if (!isAdminUnlocked()) {
    showLocked();
    toast('Sesi admin berakhir, masuk lagi dulu');
    return;
  }

  const snippet = normalize({
    title: $('#f-title').value.trim(),
    subtitle: $('#f-subtitle').value.trim(),
    type: $('#f-lang').value,
    filename: $('#f-filename').value.trim(),
    footer: $('#f-author').value.trim(),
    code: $('#f-code').value,
    createdAt: Date.now(),
  });
  if (!snippet.title || !snippet.code.trim()) return;

  const snippets = loadSnippets();
  snippets.unshift(snippet);
  saveSnippets(snippets);
  e.target.reset();
  toast('Snippet tersimpan');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
});
