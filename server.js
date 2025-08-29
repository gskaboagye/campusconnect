// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'services.json');

// helpers to read/write the JSON file
function loadServices() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
function saveServices(arr) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(arr, null, 2));
}

/**
 * GET /api/services
 * supports query params:
 *  - category (exact)
 *  - university (exact)
 *  - search (title or description substring)
 *  - sort (price | alpha | newest)
 */
app.get('/api/services', (req, res) => {
  let services = loadServices();

  const { category, university, search, sort } = req.query;

  if (category && category !== 'all') {
    services = services.filter(s => String(s.category).toLowerCase() === String(category).toLowerCase());
  }
  if (university && university !== 'all') {
    services = services.filter(s => String(s.university).toLowerCase() === String(university).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    services = services.filter(s =>
      (s.title || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      (s.hostel || '').toLowerCase().includes(q)
    );
  }

  if (sort === 'price') services.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === 'alpha') services.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  if (sort === 'newest') services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  // default: newest first
  if (!sort) services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(services);
});

// GET single service
app.get('/api/services/:id', (req, res) => {
  const services = loadServices();
  const id = Number(req.params.id);
  const service = services.find(s => Number(s.id) === id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

// POST add service
app.post('/api/services', (req, res) => {
  const services = loadServices();
  const { title, description, price, category, university, hostel, contact, image } = req.body;
  if (!title || !category || !university) {
    return res.status(400).json({ error: 'title, category and university are required' });
  }
  const newId = services.length ? (Math.max(...services.map(s => Number(s.id))) + 1) : 1;
  const newService = {
    id: newId,
    title,
    description: description || '',
    price: String(price || '0'),
    category,
    university,
    hostel: hostel || '',
    contact: contact || '',
    image: image || '',
    createdAt: new Date().toISOString()
  };
  services.push(newService);
  saveServices(services);
  res.status(201).json(newService);
});

// PUT update service (optional edit)
app.put('/api/services/:id', (req, res) => {
  const services = loadServices();
  const id = Number(req.params.id);
  const idx = services.findIndex(s => Number(s.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Service not found' });

  const updated = { ...services[idx], ...req.body, id };
  services[idx] = updated;
  saveServices(services);
  res.json(updated);
});

// DELETE service
app.delete('/api/services/:id', (req, res) => {
  let services = loadServices();
  const id = Number(req.params.id);
  const before = services.length;
  services = services.filter(s => Number(s.id) !== id);
  if (services.length === before) return res.status(404).json({ error: 'Service not found' });
  saveServices(services);
  res.json({ success: true, message: `Service ${id} deleted` });
});

// static health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running: http://localhost:${PORT}`));
