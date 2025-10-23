/* script.js — CampusConnect (backend integrated) */

// small helpers
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

const API = (window.location.hostname === 'localhost')
  ? 'http://localhost:3000/api/services'
  : 'http://localhost:3000/api/services';

/* ------------------------------
   LocalStorage helpers
   ------------------------------ */
const LS_FAVS = 'cc_favs';
const LS_THEME = 'cc_theme';

function loadFavs(){ try{ return JSON.parse(localStorage.getItem(LS_FAVS) || '[]'); }catch(e){return []} }
function saveFavs(arr){ localStorage.setItem(LS_FAVS, JSON.stringify(arr)); }

/* ------------------------------
   Backend calls
   ------------------------------ */
async function fetchServicesFromBackend(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.university && filters.university !== 'all') params.set('university', filters.university);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);

  const res = await fetch(`${API}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

async function postServiceToBackend(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add service');
  return res.json();
}

async function deleteServiceFromBackend(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Delete failed');
  }
  return res.json();
}

/* ------------------------------
   UI helpers: date/time, theme, menu
   ------------------------------ */
function startDateTime(){
  const els = qsa('[id^="dateTimeSmall"], #dateTimeSmall');
  function tick(){
    const now = new Date();
    const txt = now.toLocaleString();
    els.forEach(el => { if(el) el.textContent = txt; });
  }
  tick();
  setInterval(tick,1000);
}

function initTheme(){
  const saved = localStorage.getItem(LS_THEME) || 'light';
  if(saved === 'dark') document.documentElement.classList.add('dark');
  qsa('#themeToggle,#themeToggle2').forEach(btn=>{
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      document.documentElement.classList.toggle('dark');
      localStorage.setItem(
        LS_THEME,
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      );
      const i = btn.querySelector('i');
      if(i) i.classList.toggle('fa-moon'), i.classList.toggle('fa-sun');
    });
  });
}

function initMobileMenu(){
  qsa('.menu-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const nav = btn.nextElementSibling;
      if(nav) nav.classList.toggle('open');
    });
  });
}

/* ------------------------------
   Populate selects
   ------------------------------ */
function populateUniversities(){
  qsa('#universityFilter,#university,#universityFilter2').forEach(sel=>{
    if(!sel) return;
    sel.innerHTML = '<option value="all">All</option>';
    universities.forEach(u=>{
      const o = document.createElement('option'); 
      o.value = u; 
      o.textContent = u; 
      sel.appendChild(o);
    });
  });
}

async function populateCategories() {
  try {
    const services = await fetchServicesFromBackend({});
    const cats = Array.from(new Set((services||[]).map(s => s.category).filter(Boolean))).sort();
    qsa('#categoryFilter,#category,#homeCategory').forEach(sel=>{
      if(!sel) return;
      sel.innerHTML = '';
      if(sel.id === 'categoryFilter') sel.appendChild(new Option('All','all'));
      else sel.appendChild(new Option('-- all --',''));
      cats.forEach(c => sel.appendChild(new Option(c, c)));
    });
    // pills
    const pillContainer = qs('#categoryPills');
    if(pillContainer){
      pillContainer.innerHTML = '';
      cats.forEach(c=>{
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.textContent = c;
        btn.onclick = ()=> { 
          qs('#categoryFilter').value = c; 
          applyFilters(); 
          window.scrollTo({top:200,behavior:'smooth'}); 
        };
        pillContainer.appendChild(btn);
      });
    }
  } catch (e) {
    console.error('Error populating categories', e);
  }
}

/* ------------------------------
   Card creation
   ------------------------------ */
function createServiceCard(s, highlight=''){
  const div = document.createElement('div');
  div.className = 'card service-card';
  const img = s.image ? `<img class="thumb" src="${s.image}" alt="${s.title}">` : `<div class="thumb" style="background:#eee"></div>`;
  const titleHtml = highlightText(s.title, highlight);
  const descHtml = highlightText(s.description, highlight);
  div.innerHTML = `
    ${img}
    <h3>${titleHtml}</h3>
    <p class="meta"><i class="fas fa-tags"></i> ${escapeHtml(s.category)} • <i class="fas fa-university"></i> ${escapeHtml(s.university)} • ${escapeHtml(s.hostel || '')}</p>
    <p class="desc">${descHtml}</p>
    <p class="price">GH₵${escapeHtml(s.price)}</p>
    <div class="card-actions">
      <a class="btn" href="service.html?id=${s.id}"><i class="fas fa-eye"></i> View</a>
      <button class="btn ghost fav-btn" onclick="toggleFav(${s.id}, this)"><i class="fas fa-heart"></i> Fav</button>
      <button class="btn danger" onclick="handleDelete(${s.id})"><i class="fas fa-trash"></i> Delete</button>
    </div>
  `;
  return div;
}

function highlightText(text, q){
  if(!q) return escapeHtml(text);
  const re = new RegExp(`(${escapeRegExp(q)})`,'ig');
  return escapeHtml(text).replace(re,'<mark>$1</mark>');
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));}
function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');}

/* ------------------------------
   Render listings
   ------------------------------ */
async function renderPopular() {
  const el = document.getElementById('popularContainer');
  if (!el) return;
  el.innerHTML = '';
  try {
    const list = (await fetchServicesFromBackend({})).slice(0,6);
    list.forEach(s => {
      const a = document.createElement('a');
      a.href = `service.html?id=${s.id}`;
      a.className = 'service-card';
      a.innerHTML = `
        <div style="min-height:120px;display:flex;align-items:center;justify-content:center">
          <h4>${escapeHtml(s.title)}</h4>
        </div>
        <p style="margin-top:8px;color:var(--muted);font-size:0.95rem">${escapeHtml(s.category)}</p>
      `;
      el.appendChild(a);
    });
  } catch (e) {
    el.innerHTML = `<div class="card"><p class="muted">Unable to load popular services.</p></div>`;
  }
}

async function loadListings() {
  const container = document.getElementById('listingsContainer');
  if (!container) return;
  container.innerHTML = `<div class="card"><p class="muted">Loading...</p></div>`;
  const cat = document.getElementById('categoryFilter')?.value || 'all';
  const uni = document.getElementById('universityFilter')?.value || 'all';
  const q = (document.getElementById('searchInput')?.value || '').trim();
  const sort = document.getElementById('sortFilter')?.value || 'relevance';
  try {
    const list = await fetchServicesFromBackend({ category: cat, university: uni, search: q, sort });
    container.innerHTML = '';
    if (!list.length) {
      container.innerHTML = `<div class="card"><p class="muted">No services match your filters.</p></div>`;
      return;
    }
    list.forEach(s => container.appendChild(createServiceCard(s, q)));
  } catch (e) {
    container.innerHTML = `<div class="card"><p class="muted">Failed to load services.</p></div>`;
    console.error(e);
  }
}

/* ------------------------------
   Filters
   ------------------------------ */
function applyFilters(){
  const params = new URLSearchParams(window.location.search);
  const cat = qs('#categoryFilter')?.value || '';
  const q = qs('#searchInput')?.value.trim() || '';
  if(cat && cat !== 'all') params.set('category',cat); else params.delete('category');
  if(q) params.set('search',q); else params.delete('search');
  history.replaceState(null,'', 'listings.html?'+params.toString());
  loadListings();
}

function clearFilters(){
  qs('#categoryFilter').value = 'all';
  qs('#universityFilter').value = 'all';
  qs('#searchInput').value = '';
  qs('#sortFilter').value = 'relevance';
  loadListings();
}

/* ------------------------------
   Favorites
   ------------------------------ */
function toggleFav(id, btn){
  let favs = loadFavs();
  const strId = String(id);
  if(favs.includes(strId)){
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

/* ------------------------------
   Add Service Form
   ------------------------------ */
function handleAddForm(){
  const form = qs('#addServiceForm');
  if(!form) return;
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const payload = {
      title: qs('#title').value.trim(),
      description: qs('#description').value.trim(),
      price: qs('#price').value.trim() || '0',
      category: qs('#category').value || 'General',
      university: qs('#university').value || '',
      hostel: qs('#hostel').value || '',
      contact: qs('#contact').value || '',
      image: qs('#image').value.trim() || ''
    };
    try {
      await postServiceToBackend(payload);
      alert('Service added successfully.');
      window.location.href = 'listings.html';
    } catch (err) {
      console.error(err);
      alert('Failed to add service. Backend may not be running.');
    }
  });
}

/* ------------------------------
   Delete service
   ------------------------------ */
async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    await deleteServiceFromBackend(id);
    await loadListings();
  } catch (e) {
    console.error(e);
    alert('Delete failed. Check backend.');
  }
}

/* ------------------------------
   Service Details page
   ------------------------------ */
async function loadServiceDetails(){
  const box = qs('#serviceDetails');
  if(!box) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id){ box.innerHTML = '<p class="muted">Missing service ID.</p>'; return; }
  try {
    const res = await fetch(`${API}/${id}`);
    if(!res.ok){ box.innerHTML = '<p class="muted">Service not found.</p>'; return; }
    const item = await res.json();
    const img = item.image ? `<img class="thumb" src="${item.image}" alt="${item.title}">` : '';
    box.innerHTML = `
      ${img}
      <h2>${escapeHtml(item.title)}</h2>
      <p class="meta"><i class="fas fa-tags"></i> ${item.category} • <i class="fas fa-university"></i> ${item.university} • ${item.hostel||''}</p>
      <p>${escapeHtml(item.description)}</p>
      <p class="price">GH₵${item.price}</p>
      <p><strong>Contact:</strong> <a href="tel:${item.contact}">${item.contact}</a> • 
        <a href="https://wa.me/233${String(item.contact||'').replace(/^0/,'')}" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a>
      </p>
    `;

    // bind contact button
    const contactBtn = qs('#contactBtn');
    if(contactBtn){
      contactBtn.onclick = ()=> window.location.href = `tel:${item.contact}`;
    }

    // clear saved services button
    const clearBtn = document.querySelector('.details-actions button:last-child');
    if(clearBtn){
      clearBtn.onclick = ()=> {
        clearLocalExtras();
      };
    }
  } catch (e) {
    console.error(e);
    box.innerHTML = '<p class="muted">Failed to load service details.</p>';
  }
}

/* ------------------------------
   Clear extras (local only)
   ------------------------------ */
function clearLocalExtras() {
  localStorage.removeItem('cc_extra');
  alert('Cleared locally saved services.');
  loadListings();
}

/* ------------------------------
   Homepage search
   ------------------------------ */
function searchFromHome(){
  const q = qs('#searchBar')?.value.trim();
  const cat = qs('#homeCategory')?.value || '';
  const params = new URLSearchParams();
  if(q) params.set('search', q);
  if(cat) params.set('category', cat);
  window.location.href = 'listings.html?' + params.toString();
}

/* ------------------------------
   Init
   ------------------------------ */
async function initApp(){
  startDateTime();
  initTheme();
  initMobileMenu();
  populateUniversities();
  await populateCategories();
  renderPopular();
  await loadListings();
  handleAddForm();
  loadServiceDetails();

  const sInput = qs('#searchInput');
  if(sInput) sInput.addEventListener('input', ()=> loadListings());
}
window.addEventListener('DOMContentLoaded', initApp);
