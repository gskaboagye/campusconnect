// Utilities
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

// Populate popular on home
function renderPopular() {
  const el = document.getElementById('popularContainer');
  if (!el) return;
  const top = services.slice(0, 6);
  top.forEach(s => el.appendChild(serviceCard(s)));
}

// Listing helpers
function serviceCard(s) {
  const div = document.createElement('div');
  div.className = 'card';
  const img = s.image ? `<img class="thumb" src="${s.image}" alt="${s.title}">` : `<div class="thumb"></div>`;
  div.innerHTML = `${img}
    <h3>${s.title}</h3>
    <p class="meta">${s.category} • ${s.university} • ${s.hostel}</p>
    <p>${s.description}</p>
    <p class="price">${s.price}</p>
    <a class="btn" href="service.html?id=${s.id}">View Details</a>`;
  return div;
}

function loadListings() {
  const container = document.getElementById('listingsContainer');
  if (!container) return;
  container.innerHTML = '';

  // Filters
  const params = getQueryParams();
  const categoryParam = params.category || 'all';
  const searchParam = (params.search || '').toLowerCase();

  // Populate university select
  const uniSel = document.getElementById('universityFilter');
  if (uniSel && !uniSel.options.length) {
    const allOpt = new Option('All', 'all');
    uniSel.add(allOpt);
    universities.forEach(u => uniSel.add(new Option(u, u)));
  }

  // Set initial selects from params if any
  const catSel = document.getElementById('categoryFilter');
  if (catSel && categoryParam !== 'all') catSel.value = categoryParam;

  // Filter data
  let list = [...services];
  if (categoryParam !== 'all') list = list.filter(s => s.category === categoryParam);
  if (searchParam) list = list.filter(s =>
    s.title.toLowerCase().includes(searchParam) ||
    s.description.toLowerCase().includes(searchParam)
  );

  const uniVal = uniSel ? uniSel.value : 'all';
  if (uniVal && uniVal !== 'all') list = list.filter(s => s.university === uniVal);

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = '<p class="muted">No services match your filters.</p>';
    container.appendChild(empty);
    return;
  }

  list.forEach(s => container.appendChild(serviceCard(s)));
}

function applyFilters() {
  const uni = qs('#universityFilter') ? qs('#universityFilter').value : 'all';
  const cat = qs('#categoryFilter') ? qs('#categoryFilter').value : 'all';
  const q = qs('#searchInput') ? qs('#searchInput').value.trim() : '';
  const params = new URLSearchParams();
  if (cat && cat !== 'all') params.set('category', cat);
  if (q) params.set('search', q);
  // Preserve university choice in UI; actual filtering happens client side
  history.replaceState(null, '', 'listings.html?' + params.toString());
  loadListings();
}

function searchServices(){
  const q = document.getElementById('searchBar').value.trim();
  const url = q ? `listings.html?search=${encodeURIComponent(q)}` : 'listings.html';
  window.location.href = url;
}

// Service details
function loadServiceDetails(){
  const box = document.getElementById('serviceDetails');
  if (!box) return;
  const { id } = getQueryParams();
  const item = services.find(s => String(s.id) === String(id));
  if (!item) { box.innerHTML = '<p class="muted">Service not found.</p>'; return; }

  const img = item.image ? `<img class="thumb" src="${item.image}" alt="${item.title}">` : `<div class="thumb"></div>`;
  box.innerHTML = `${img}
    <h2>${item.title}</h2>
    <p class="meta">${item.category} • ${item.university} • ${item.hostel}</p>
    <p>${item.description}</p>
    <p class="price">${item.price}</p>
    <p><strong>Contact:</strong> <a href="tel:${item.contact}">${item.contact}</a> • <a href="https://wa.me/233${item.contact.replace(/^0/, '')}" target="_blank" rel="noopener">WhatsApp</a></p>`;

  const btn = document.getElementById('contactBtn');
  if (btn) btn.onclick = () => {
    window.location.href = 'tel:' + item.contact;
  };
}

// Add service (stored to localStorage for demo)
function populateUniversitySelects(){
  const uniSel = document.getElementById('university');
  if (!uniSel) return;
  universities.forEach(u => uniSel.add(new Option(u, u)));
}

function nextId(){
  const maxInSeed = Math.max(...services.map(s => s.id));
  const extra = JSON.parse(localStorage.getItem('cc_extra') || '[]');
  const maxExtra = extra.length ? Math.max(...extra.map(e => e.id)) : 0;
  return Math.max(maxInSeed, maxExtra) + 1;
}

function handleAddService(){
  const form = document.getElementById('addServiceForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      id: nextId(),
      title: qs('#title').value.trim(),
      category: qs('#category').value,
      description: qs('#description').value.trim(),
      price: 'GH₵' + qs('#price').value.trim(),
      university: qs('#university').value,
      hostel: qs('#hostel').value.trim(),
      contact: qs('#contact').value.trim(),
      image: qs('#image').value.trim()
    };
    const extra = JSON.parse(localStorage.getItem('cc_extra') || '[]');
    extra.push(payload);
    localStorage.setItem('cc_extra', JSON.stringify(extra));
    alert('Service added locally! It will appear in listings on this browser.');
    window.location.href = 'listings.html';
  });
}

// Merge local extra services for demo browsing
function withExtras(){
  const extra = JSON.parse(localStorage.getItem('cc_extra') || '[]');
  // Avoid duplicates if re-run
  const ids = new Set(services.map(s => s.id));
  extra.forEach(e => { if (!ids.has(e.id)) services.push(e); });
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  withExtras();
  renderPopular();
  loadListings();
  loadServiceDetails();
  populateUniversitySelects();
  handleAddService();
});
