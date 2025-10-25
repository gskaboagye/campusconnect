/* =======================================================
   CampusConnect — Main Frontend Script
   Author: Godfred Sefa Aboagye
   Updated by: ChatGPT
   Version: 1.5 (with About Page Integration)
   ======================================================= */

// ------------------------------
// Helper Shortcuts
// ------------------------------
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

// ------------------------------
// Config
// ------------------------------
const API = 'data/services.json';
const LS_FAVS = 'cc_favs';
const LS_THEME = 'cc_theme';

// ------------------------------
// LocalStorage Helpers
// ------------------------------
const loadFavs = () => JSON.parse(localStorage.getItem(LS_FAVS) || '[]');
const saveFavs = favs => localStorage.setItem(LS_FAVS, JSON.stringify(favs));

// ------------------------------
// Date & Time
// ------------------------------
function startDateTime() {
  const els = qsa('#dateTime, #dateTimeSmall, #dateTimeAbout');
  if (!els.length) return;
  const tick = () => {
    const now = new Date();
    const formatted = now.toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    els.forEach(el => (el.textContent = formatted));
  };
  tick();
  setInterval(tick, 1000);
}

// ------------------------------
// Theme Toggle
// ------------------------------
function initTheme() {
  const saved = localStorage.getItem(LS_THEME) || 'light';
  if (saved === 'dark') document.documentElement.classList.add('dark');

  qsa('#themeToggle, #themeToggle2, #themeToggle3').forEach(btn => {
    btn?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem(
        LS_THEME,
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      );
      const icon = btn.querySelector('i');
      if (icon) icon.classList.toggle('fa-sun'), icon.classList.toggle('fa-moon');
    });
  });
}

// ------------------------------
// Mobile Menu
// ------------------------------
function initMobileMenu() {
  qsa('.menu-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const nav = btn.nextElementSibling;
      nav?.classList.toggle('open');
      btn.querySelector('i')?.classList.toggle('fa-times');
      btn.querySelector('i')?.classList.toggle('fa-bars');
    });
  });
}

// ------------------------------
// Fetch Services
// ------------------------------
async function fetchServicesFromBackend(filters = {}) {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Failed to load local services.json');
    let services = await res.json();

    // Filtering
    if (filters.category && filters.category !== 'all')
      services = services.filter(s => s.category === filters.category);

    if (filters.university && filters.university !== 'all')
      services = services.filter(s => s.university === filters.university);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      services = services.filter(
        s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'price-low-high':
        services.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        services.sort((a, b) => b.price - a.price);
        break;
      case 'alpha':
        services.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        services.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return services;
  } catch (err) {
    console.error('Error fetching services:', err);
    return [];
  }
}

// ------------------------------
// Populate Universities
// ------------------------------
function populateUniversities() {
  const unis = window.CampusConnectData?.universities || [];
  qsa('#universityFilter, #university, #universityFilter2').forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="all">All</option>';
    unis.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      sel.appendChild(opt);
    });
  });
}

// ------------------------------
// Populate Categories
// ------------------------------
async function populateCategories() {
  try {
    const services = await fetchServicesFromBackend();
    const fromData = window.CampusConnectData?.categories || [];
    const cats = Array.from(
      new Set([...fromData, ...services.map(s => s.category).filter(Boolean)])
    ).sort();

    qsa('#categoryFilter, #category, #homeCategory').forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      const def =
        sel.id === 'categoryFilter'
          ? new Option('All', 'all')
          : new Option('-- all --', '');
      sel.appendChild(def);
      cats.forEach(c => sel.appendChild(new Option(c, c)));
    });
  } catch (e) {
    console.error('Error populating categories', e);
  }
}

// ------------------------------
// Create Service Card
// ------------------------------
function createServiceCard(s, highlight = '') {
  const div = document.createElement('div');
  div.className = 'card service-card fade-in';

  const imgSrc = s.image || 'images/placeholder.png';
  const titleHtml = highlightText(s.title, highlight);
  const descHtml = highlightText(s.description, highlight);
  const whatsapp = s.contact ? `https://wa.me/${s.contact.replace(/^0/, '233')}` : '#';
  const tel = s.contact ? `tel:${s.contact}` : '#';

  div.innerHTML = `
    <img class="thumb lazy" data-src="${imgSrc}" alt="${escapeHtml(s.title)}">
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
    <div class="social-icons">
      <a href="${whatsapp}" target="_blank" title="Chat on WhatsApp"><i class="fab fa-whatsapp"></i></a>
      <a href="${tel}" title="Call Provider"><i class="fas fa-phone-alt"></i></a>
    </div>
  `;
  return div;
}

// ------------------------------
// Utilities
// ------------------------------
const escapeHtml = s =>
  String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function highlightText(text, q) {
  if (!q) return escapeHtml(text);
  const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
  return escapeHtml(text).replace(re, '<mark>$1</mark>');
}

// ------------------------------
// Lazy Load + Scroll Reveal
// ------------------------------
function lazyLoadImages() {
  const imgs = qsa('img.lazy');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  }, { threshold: 0.15 });
  imgs.forEach(img => observer.observe(img));
}

function scrollReveal() {
  const els = qsa('.fade-in, .about-section, .team-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
}

// ------------------------------
// About Page Enhancements
// ------------------------------
function initAboutPage() {
  const hero = qs('.about-hero');
  if (!hero) return; // not on about.html

  // Animate hero title
  hero.classList.add('fade-in');
  scrollReveal();

  // Highlight team members
  qsa('.team-card').forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('active'));
    card.addEventListener('mouseleave', () => card.classList.remove('active'));
  });
}

// ------------------------------
// Init App
// ------------------------------
async function initApp() {
  startDateTime();
  initTheme();
  initMobileMenu();
  populateUniversities();
  await populateCategories();
  lazyLoadImages();
  scrollReveal();
  initAboutPage();
}

window.addEventListener('DOMContentLoaded', initApp);
