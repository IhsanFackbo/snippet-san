// list.js — logika untuk index.html (jelajah, cari, bagikan, hapus, ekspor/impor)

const $ = (sel) => document.querySelector(sel);
const grid = $('#grid');
const searchInput = $('#search');
const filterLang = $('#filter-lang');
const countPill = $('#count-pill');
const sharedSlot = $('#shared-banner-slot');

let snippets = loadSnippets();

function populateLangFilter() {
  const langs = [...new Set(snippets.map((s) => s.type))].sort();
  filterLang.innerHTML =
    '<option value="">Semua bahasa</option>' +
    langs.map((l) => `<option value="${l}">${l}</option>`).join('');
}

function matchesQuery(s, q) {
  if (!q) return true;
  q = q.toLowerCase();
  return (
    s.title.toLowerCase().includes(q) ||
    s.subtitle.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.type.toLowerCase().includes(q)
  );
}

function render() {
  const q = searchInput.value.trim();
  const langFilter = filterLang.value;

  const filtered = snippets.filter(
    (s) => matchesQuery(s, q) && (!langFilter || s.type === langFilter)
  );

  countPill.textContent = `${filtered.length} snippet`;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">
      <strong>${snippets.length ? 'Tidak ada hasil' : 'Belum ada snippet'}</strong>
      ${snippets.length ? 'Coba kata kunci lain.' : 'Tambah kode pertamamu lewat halaman "+ Tambah Snippet".'}
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((s) => cardHtml(s, true)).join('');
  grid.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
  bindCardEvents();
}

function cardHtml(s, withDelete) {
  return `
  <article class="snip" data-id="${s.id}">
    <div class="snip-chrome">
      <span class="dots"><span></span><span></span><span></span></span>
      <span class="filename-tab">${escapeHtml(s.filename || s.title)}</span>
      <span class="lang-badge">${escapeHtml(s.type)}</span>
    </div>
    <div class="snip-body">
      <p class="snip-title">${escapeHtml(s.title)}</p>
      ${s.subtitle ? `<p class="snip-subtitle">${escapeHtml(s.subtitle)}</p>` : ''}
      <div class="code-wrap collapsed">
        <pre><code class="language-${escapeHtml(s.type)}">${escapeHtml(s.code)}</code></pre>
      </div>
      <button type="button" class="expand-toggle" data-action="toggle">tampilkan semua ▾</button>
    </div>
    <div class="snip-footer">
      <span class="snip-author">${escapeHtml(s.footer || 'anonim')} &middot; ${timeAgo(s.createdAt)}</span>
      <span class="snip-actions">
        <button type="button" data-action="copy">Salin</button>
        <button type="button" data-action="share">Bagikan</button>
        ${withDelete ? '<button type="button" data-action="delete" class="danger">Hapus</button>' : ''}
      </span>
    </div>
  </article>`;
}

function bindCardEvents() {
  grid.querySelectorAll('.snip').forEach((card) => {
    const id = card.dataset.id;
    const snippet = snippets.find((s) => s.id === id);
    if (!snippet) return;

    card.querySelector('[data-action="toggle"]')?.addEventListener('click', (e) => {
      const wrap = card.querySelector('.code-wrap');
      wrap.classList.toggle('collapsed');
      e.target.textContent = wrap.classList.contains('collapsed')
        ? 'tampilkan semua ▾'
        : 'sembunyikan ▴';
    });

    card.querySelector('[data-action="copy"]')?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(snippet.code);
      toast('Kode disalin ke clipboard');
    });

    card.querySelector('[data-action="share"]')?.addEventListener('click', () => {
      const link = buildShareLink(snippet);
      navigator.clipboard.writeText(link).then(
        () => toast('Link berbagi disalin'),
        () => toast(link)
      );
    });

    card.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      if (!confirm(`Hapus snippet "${snippet.title}"?`)) return;
      snippets = snippets.filter((s) => s.id !== id);
      saveSnippets(snippets);
      populateLangFilter();
      render();
      toast('Snippet dihapus');
    });
  });
}

// ---------- share via URL hash ----------

function buildShareLink(snippet) {
  const payload = {
    title: snippet.title,
    subtitle: snippet.subtitle,
    type: snippet.type,
    filename: snippet.filename,
    footer: snippet.footer,
    code: snippet.code,
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url = new URL(window.location.href);
  url.hash = 's=' + encoded;
  return url.toString();
}

function readShareFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/#s=(.+)/);
  if (!match) return null;
  try {
    const json = decodeURIComponent(escape(atob(match[1])));
    return normalize(JSON.parse(json));
  } catch (e) {
    console.warn('Link berbagi tidak valid', e);
    return null;
  }
}

function showSharedBanner(shared) {
  sharedSlot.innerHTML = `
    <div class="shared-banner">
      <span>Kamu membuka snippet yang dibagikan: <strong>${escapeHtml(shared.title)}</strong></span>
      <button type="button" id="save-shared">Simpan ke koleksiku</button>
    </div>
  `;
  $('#save-shared').addEventListener('click', () => {
    shared.id = cryptoId();
    shared.createdAt = Date.now();
    snippets.unshift(shared);
    saveSnippets(snippets);
    populateLangFilter();
    render();
    sharedSlot.innerHTML = '';
    history.replaceState(null, '', window.location.pathname + window.location.search);
    toast('Ditambahkan ke koleksimu');
  });

  const previewCard = document.createElement('div');
  previewCard.className = 'grid';
  previewCard.style.marginBottom = '1.1rem';
  previewCard.innerHTML = cardHtml(shared, false);
  sharedSlot.appendChild(previewCard);
  previewCard.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
  previewCard.querySelector('[data-action="copy"]')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(shared.code);
    toast('Kode disalin ke clipboard');
  });
  previewCard.querySelector('[data-action="toggle"]')?.addEventListener('click', (e) => {
    const wrap = previewCard.querySelector('.code-wrap');
    wrap.classList.toggle('collapsed');
    e.target.textContent = wrap.classList.contains('collapsed') ? 'tampilkan semua ▾' : 'sembunyikan ▴';
  });
}

// ---------- export / import ----------

$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(snippets, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ibusatset-snippets-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$('#btn-import').addEventListener('click', () => $('#file-import').click());

$('#file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const incoming = Array.isArray(data) ? data : [data];
    incoming.forEach((raw) => {
      const s = normalize(raw);
      s.id = cryptoId();
      snippets.unshift(s);
    });
    saveSnippets(snippets);
    populateLangFilter();
    render();
    toast(`${incoming.length} snippet diimpor`);
  } catch (err) {
    toast('File JSON tidak valid');
  } finally {
    e.target.value = '';
  }
});

// ---------- search/filter bindings ----------

searchInput.addEventListener('input', render);
filterLang.addEventListener('change', render);

// ---------- init ----------

(async function init() {
  snippets = await seedIfEmpty(snippets);
  populateLangFilter();
  render();

  const shared = readShareFromHash();
  if (shared) showSharedBanner(shared);
})();
