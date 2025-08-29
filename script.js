// script.js — CampusConnect final

// Utility helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

// Read data arrays from data.js: universities, services
// data.js must be loaded before this script

/* ------------------------------
   LocalStorage helpers
   ------------------------------ */
const LS_EXTRA = 'cc_extra';
const LS_FAVS = 'cc_favs';
const LS_THEME = 'cc_theme';

function loadExtras(){
  try{ return JSON.parse(localStorage.getItem(LS_EXTRA) || '[]'); }
  catch(e){ return []; }
}
function saveExtra(arr){ localStorage.setItem(LS_EXTRA, JSON.stringify(arr)); }

function loadFavs(){ try{ return JSON.parse(localStorage.getItem(LS_FAVS) || '[]'); }catch(e){return []}}
function saveFavs(arr){ localStorage.setItem(LS_FAVS, JSON.stringify(arr)); }

/* ------------------------------
   Merge seed + extras
   ------------------------------ */
function allServices(){
  const extra = loadExtras();
  const ids = new Set(services.map(s=>s.id));
  const merged = services.slice();
  extra.forEach(e => { if(!ids.has(e.id)) merged.push(e); });
  return merged.sort((a,b)=> new Date(b.createdAt || '2000') - new Date(a.createdAt || '2000'));
}

/* ------------------------------
   Date/time & theme
   ------------------------------ */
function startDateTime(){
  const elSmall = qsa('[id^="dateTimeSmall"]');
  function tick(){
    const now = new Date();
    const txt = now.toLocaleString();
    elSmall.forEach(e => e.textContent = txt);
    const big = qs('#dateTimeSmall') || qs('#dateTime');
    if(big) big.textContent = txt;
  }
  tick();
  setInterval(tick,1000);
}

function initTheme(){
  const saved = localStorage.getItem(LS_THEME) || 'light';
  if(saved === 'dark') document.documentElement.classList.add('dark');
  const themeButtons = qsa('#themeToggle,#themeToggle2');
  themeButtons.forEach(btn=>{
    btn?.addEventListener('click', ()=>{
      document.documentElement.classList.toggle('dark');
      localStorage.setItem(LS_THEME, document.documentElement.classList.contains('dark')?'dark':'light');
      btn.querySelector('i').classList.toggle('fa-moon');
      btn.querySelector('i').classList.toggle('fa-sun');
    });
  });
}

/* ------------------------------
   Mobile menu
   ------------------------------ */
function initMobileMenu(){
  qsa('.menu-toggle').forEach(button => {
    const nav = button.nextElementSibling;
    button.addEventListener('click', ()=>{
      if(nav) nav.classList.toggle('open');
    });
  });
}

/* ------------------------------
   Populate UI helpers
   ------------------------------ */
function populateUniversities(){
  qsa('#universityFilter,#university,#universityFilter2').forEach(sel=>{
    if(!sel) return;
    sel.innerHTML = '<option value="all">All</option>';
    universities.forEach(u => {
      const o = document.createElement('option'); o.value = u; o.textContent = u; sel.appendChild(o);
    });
  });
}

function populateCategories(){
  const cats = Array.from(new Set(allServices().map(s=>s.category))).filter(Boolean).sort();
  const catSelects = qsa('#categoryFilter,#category,#homeCategory');
  catSelects.forEach(sel=>{
    if(!sel) return;
    sel.innerHTML = '';
    if(sel.id === 'categoryFilter') sel.appendChild(new Option('All','all'));
    else sel.appendChild(new Option('-- all --',''));
    cats.forEach(c => sel.appendChild(new Option(c,c)));
  });

  // render pills
  const pillContainer = qs('#categoryPills');
  if(pillContainer){
    pillContainer.innerHTML = '';
    cats.forEach(c=>{
      const a = document.createElement('button');
      a.className = 'pill';
      a.textContent = c;
      a.onclick = ()=> { qs('#categoryFilter').value = c; applyFilters(); window.scrollTo({top:200,behavior:'smooth'}); };
      pillContainer.appendChild(a);
    });
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
    <p class="meta"><i class="fas fa-tags"></i> ${s.category} • <i class="fas fa-university"></i> ${s.university} • ${s.hostel || ''}</p>
    <p class="desc">${descHtml}</p>
    <p class="price">GH₵${s.price}</p>
    <div class="card-actions">
      <a class="btn" href="service.html?id=${s.id}"><i class="fas fa-eye"></i> View</a>
      <button class="btn ghost fav-btn" onclick="toggleFav(${s.id}, this)"><i class="fas fa-heart"></i> Fav</button>
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
   Render popular & listings
   ------------------------------ */
function renderPopular(){
  const el = qs('#popularContainer');
  if(!el) return;
  el.innerHTML = '';
  const list = allServices().slice(0,6);
  list.forEach(s=> el.appendChild(createServiceCard(s)));
}

function loadListings(){
  const container = qs('#listingsContainer');
  if(!container) return;
  container.innerHTML = '';

  const cat = qs('#categoryFilter')?.value || 'all';
  const uni = qs('#universityFilter')?.value || 'all';
  const q = (qs('#searchInput')?.value || '').trim().toLowerCase();
  const sort = qs('#sortFilter')?.value || 'relevance';

  let list = allServices();

  if(cat && cat !== 'all') list = list.filter(x => x.category === cat);
  if(uni && uni !== 'all') list = list.filter(x => x.university === uni);
  if(q) list = list.filter(x => x.title.toLowerCase().includes(q) || x.description.toLowerCase().includes(q) || x.hostel?.toLowerCase().includes(q));
  if(sort === 'price') list.sort((a,b)=> parseFloat(a.price) - parseFloat(b.price));
  if(sort === 'alpha') list.sort((a,b)=> a.title.localeCompare(b.title));
  if(sort === 'newest') list.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

  if(!list.length){
    container.innerHTML = `<div class="card"><p class="muted">No services match your filters.</p></div>`;
    return;
  }

  const qHighlight = q;
  list.forEach(s => container.appendChild(createServiceCard(s,qHighlight)));
}

/* ------------------------------
   Filters UI
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
  loadListings();
}

/* ------------------------------
   Favorites
   ------------------------------ */
function toggleFav(id, btn){
  let favs = loadFavs();
  if(favs.includes(id)){
    favs = favs.filter(x => x !== id);
    btn.classList.remove('active');
    btn.innerHTML = '<i class="fas fa-heart"></i> Fav';
  } else {
    favs.push(id);
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-heart"></i> Saved';
  }
  saveFavs(favs);
}

/* ------------------------------
   Add service form
   ------------------------------ */
function nextId(){
  const all = allServices();
  const max = all.reduce((m,s)=> Math.max(m, s.id||0), 0);
  return max + 1;
}

function handleAddForm(){
  const form = qs('#addServiceForm');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const payload = {
      id: nextId(),
      title: qs('#title').value.trim(),
      description: qs('#description').value.trim(),
      price: qs('#price').value.trim() || '0',
      category: qs('#category').value || 'General',
      university: qs('#university').value || '',
      hostel: qs('#hostel').value || '',
      contact: qs('#contact').value || '',
      image: qs('#image').value.trim() || '',
      createdAt: new Date().toISOString().slice(0,10)
    };
    const extra = loadExtras();
    extra.push(payload);
    saveExtra(extra);
    alert('Service saved locally — it will appear in the listings on this device.');
    window.location.href = 'listings.html';
  });
}

function resetForm(){
  qs('#addServiceForm')?.reset();
}

/* ------------------------------
   Service details page
   ------------------------------ */
function loadServiceDetails(){
  const box = qs('#serviceDetails');
  if(!box) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id){ box.innerHTML = '<p class="muted">Service ID missing.</p>'; return; }
  const item = allServices().find(s => String(s.id) === String(id));
  if(!item){ box.innerHTML = '<p class="muted">Service not found.</p>'; return; }

  const img = item.image ? `<img class="thumb" src="${item.image}" alt="${item.title}">` : '';
  box.innerHTML = `
    ${img}
    <h2>${escapeHtml(item.title)}</h2>
    <p class="meta"><i class="fas fa-tags"></i> ${item.category} • <i class="fas fa-university"></i> ${item.university} • ${item.hostel||''}</p>
    <p>${escapeHtml(item.description)}</p>
    <p class="price">GH₵${item.price}</p>
    <p><strong>Contact:</strong> <a href="tel:${item.contact}">${item.contact}</a> • <a href="https://wa.me/233${item.contact.replace(/^0/,'')}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a></p>
  `;

  // contact button
  const contactBtn = qs('#contactBtn');
  if(contactBtn) contactBtn.onclick = ()=> window.location.href = 'tel:'+item.contact;

  const favBtn = qs('#favBtn');
  if(favBtn){
    favBtn.onclick = ()=>{
      const favs = loadFavs();
      if(favs.includes(item.id)) alert('Already in favorites');
      else { favs.push(item.id); saveFavs(favs); alert('Added to favorites'); }
    };
  }
}

/* ------------------------------
   Homepage simple search
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
   Initialize app
   ------------------------------ */
function initApp(){
  startDateTime();
  initTheme();
  initMobileMenu();
  populateUniversities();
  populateCategories();
  renderPopular();
  loadListings();
  handleAddForm();
  loadServiceDetails();

  // wire live search
  const sInput = qs('#searchInput');
  if(sInput) sInput.addEventListener('input', ()=> loadListings());
}

// helper to avoid name clash with earlier function startDateTime defined
function startDateTime(){ startDateTime = () => {}; /* overwritten */ } // noop placeholder

// actually define startDateTime in more robust way for this combined file:
function startDateTime(){
  const els = qsa('[id^="dateTimeSmall"], #dateTimeSmall, #dateTimeSmall2, #dateTimeSmall3, #dateTimeSmall4, #dateTime');
  function tick(){
    const now = new Date();
    const txt = now.toLocaleString();
    els.forEach(el => { if(el) el.textContent = txt; });
  }
  tick();
  setInterval(tick,1000);
}

// Run init when DOM is ready
window.addEventListener('DOMContentLoaded', initApp);
