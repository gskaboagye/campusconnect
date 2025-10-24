/* script.js — CampusConnect (Static JSON version for GitHub Pages)
   Author: Godfred Sefa Aboagye
   Version: 1.1
   Description: Uses local static JSON for services listing on GitHub Pages
*/

// Helper shortcuts
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

// ------------------------------
// Configuration
// ------------------------------
const API = 'data/services.json'; // Static JSON file in /data/
const LS_FAVS = 'cc_favs';
const LS_THEME = 'cc_theme';

// ------------------------------
// LocalStorage helpers
// ------------------------------
function loadFavs() {
  try {
    return JSON.parse(localStorage.getItem(LS_FAVS) || '[]');
  } catch {
    return [];
  }
}
function saveFavs(arr) {
  localStorage.setItem(LS_FAVS, JSON.stringify(arr));
}

// ------------------------------
// Fetch services from static JSON
// ------------------------------
async function fetchServicesFromBackend(filters = {}) {
  const res = await fetch(API);
  if (!res.ok) throw new Error('Failed to load local services.json');
  let services = await res.json();

  // Apply filters
  if (filters.category && filters.category !== 'all') {
    services = services.filter(s => s.category === filters.category);
  }
  if (filters.university && filters.university !== 'all') {
    services = services.filter(s => s.university === filters.university);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    services = services.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }
  if (filters.sort === 'price-low-high') {
    services.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (filters.sort === 'price-high-low') {
    services.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }
  return services;
}

// ------------------------------
// UI helpers: date/time, theme, menu
// ------------------------------
function startDateTime() {
  const els = qsa('[id^="dateTimeSmall"], #dateTimeSmall');
  const tick = () => {
    const now = new Date();
    els.forEach(el => (el.textContent = now.toLocaleString()));
  };
  tick();
  setInterval(tick, 1000);
}

function initTheme() {
  const saved = localStorage.getItem(LS_THEME) || 'light';
  if (saved === 'dark') document.documentElement.classList.add('dark');

  qsa('#themeToggle, #themeToggle2').forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem(
        LS_THEME,
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      );
      const i = btn.querySelector('i');
      if (i) i.classList.toggle('fa-moon'), i.classList.toggle('fa-sun');
    });
  });
}

function initMobileMenu() {
  qsa('.menu-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const nav = btn.nextElementSibling;
      if (nav) nav.classList.toggle('open');
    });
  });
}

// ------------------------------
// Universities (Complete Public List - Ghana)
// ------------------------------
const universities = [
  'University of Ghana',
  'Kwame Nkrumah University of Science and Technology (KNUST)',
  'University of Cape Coast (UCC)',
  'University for Development Studies (UDS)',
  'University of Education, Winneba (UEW)',
  'University of Mines and Technology (UMaT)',
  'University of Energy and Natural Resources (UENR)',
  'University of Health and Allied Sciences (UHAS)',
  'C.K. Tedam University of Technology and Applied Sciences (CKT-UTAS)',
  'Simon Diedong Dombo University of Business and Integrated Development Studies (SDD-UBIDS)',
  'Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development (AAMUSTED)',
  'Ghana Institute of Journalism (GIJ)',
  'Ghana Institute of Management and Public Administration (GIMPA)',
  'University of Professional Studies, Accra (UPSA)',
  'Kwame Nkrumah University of Science and Technology Obuasi Campus',
  'University for Environment and Sustainable Development (UESD)'
];

function populateUniversities() {
  qsa('#universityFilter, #university, #universityFilter2').forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="all">All</option>';
    universities.forEach(u => {
      const o = document.createElement('option');
      o.value = u;
      o.textContent = u;
      sel.appendChild(o);
    });
  });
}

// ------------------------------
// Categories from JSON
// ------------------------------
async function populateCategories() {
  try {
    const services = await fetchServicesFromBackend();
    const cats = Array.from(
      new Set((services || []).map(s => s.category).filter(Boolean))
    ).sort();

    qsa('#categoryFilter, #category, #homeCategory').forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      const defaultOpt =
        sel.id === 'categoryFilter'
          ? new Option('All', 'all')
          : new Option('-- all --', '');
      sel.appendChild(defaultOpt);
      cats.forEach(c => sel.appendChild(new Option(c, c)));
    });

    const pillContainer = qs('#categoryPills');
    if (pillContainer) {
      pillContainer.innerHTML = '';
      cats.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.textContent = c;
        btn.onclick = () => {
          qs('#categoryFilter').value = c;
          applyFilters();
          window.scrollTo({ top: 200, behavior: 'smooth' });
        };
        pillContainer.appendChild(btn);
      });
    }
  } catch (e) {
    console.error('Error populating categories', e);
  }
}

// ------------------------------
// Card creation
// ------------------------------
function createServiceCard(s, highlight = '') {
  const div = document.createElement('div');
  div.className = 'card service-card';
  const imgSrc = s.image || 'images/placeholder.png';
  const titleHtml = highlightText(s.title, highlight);
  const descHtml = highlightText(s.description, highlight);
  div.innerHTML = `
    <img class="thumb" src="${imgSrc}" alt="${escapeHtml(s.title)}" loading="lazy">
    <h3>${titleHtml}</h3>
    <p class="meta"><i class="fas fa-tags"></i> ${escapeHtml(s.category)} • 
      <i class="fas fa-university"></i> ${escapeHtml(s.university)} 
      ${s.hostel ? '• ' + escapeHtml(s.hostel) : ''}
    </p>
    <p class="desc">${descHtml}</p>
    <p class="price">GH₵${escapeHtml(s.price)}</p>
    <div class="card-actions">
      <a class="btn" href="service.html?id=${s.id}"><i class="fas fa-eye"></i> View</a>
      <button class="btn ghost fav-btn" onclick="toggleFav(${s.id}, this)">
        <i class="fas fa-heart"></i> Fav
      </button>
    </div>
  `;
  return div;
}

function highlightText(text, q) {
  if (!q) return escapeHtml(text);
  const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
  return escapeHtml(text).replace(re, '<mark>$1</mark>');
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ------------------------------
// Render listings
// ------------------------------
async function renderPopular() {
  const el = qs('#popularContainer');
  if (!el) return;
  el.innerHTML = '';
  try {
    const list = (await fetchServicesFromBackend()).slice(0, 6);
    list.forEach(s => {
      const a = document.createElement('a');
      a.href = `service.html?id=${s.id}`;
      a.className = 'service-card';
      a.innerHTML = `
        <div style="min-height:120px;display:flex;align-items:center;justify-content:center">
          <h4>${escapeHtml(s.title)}</h4>
        </div>
        <p style="margin-top:8px;color:var(--muted);font-size:0.95rem">${escapeHtml(
          s.category
        )}</p>
      `;
      el.appendChild(a);
    });
  } catch (e) {
    el.innerHTML = `<div class="card"><p class="muted">Unable to load popular services.</p></div>`;
  }
}

async function loadListings() {
  const container = qs('#listingsContainer');
  if (!container) return;
  container.innerHTML = `<div class="card"><p class="muted">Loading...</p></div>`;
  const cat = qs('#categoryFilter')?.value || 'all';
  const uni = qs('#universityFilter')?.value || 'all';
  const q = qs('#searchInput')?.value.trim() || '';
  const sort = qs('#sortFilter')?.value || 'relevance';
  try {
    const list = await fetchServicesFromBackend({
      category: cat,
      university: uni,
      search: q,
      sort
    });
    container.innerHTML = '';
    if (!list.length) {
      container.innerHTML = `<div class="card"><p class="muted">No services match your filters.</p></div>`;
      return;
    }
    list.forEach(s => container.appendChild(createServiceCard(s, q)));
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="card"><p class="muted">Failed to load services.</p></div>`;
  }
}

// ------------------------------
// Filters
// ------------------------------
function applyFilters() {
  loadListings();
}
function clearFilters() {
  qs('#categoryFilter').value = 'all';
  qs('#universityFilter').value = 'all';
  qs('#searchInput').value = '';
  qs('#sortFilter').value = 'relevance';
  loadListings();
}

// ------------------------------
// Favorites
// ------------------------------
function toggleFav(id, btn) {
  let favs = loadFavs();
  const strId = String(id);
  if (favs.includes(strId)) {
    favs = favs.filter(x => x !== strId);
    btn.classList.remove('active');
    btn.innerHTML = '<i class="fas fa-heart"></i> Fav';
  } else {
    favs.push(strId);
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-heart"></i> Saved';
  }
  saveFavs(favs);
}

// ------------------------------
// Homepage search
// ------------------------------
function searchFromHome() {
  const q = qs('#searchBar')?.value.trim();
  const cat = qs('#homeCategory')?.value || '';
  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (cat) params.set('category', cat);
  window.location.href = 'listings.html?' + params.toString();
}

// ------------------------------
// Init
// ------------------------------
async function initApp() {
  startDateTime();
  initTheme();
  initMobileMenu();
  populateUniversities();
  await populateCategories();
  renderPopular();
  await loadListings();

  const sInput = qs('#searchInput');
  if (sInput) sInput.addEventListener('input', () => loadListings());
}

window.addEventListener('DOMContentLoaded', initApp);
