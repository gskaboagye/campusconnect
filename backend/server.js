const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory dataset (you can later connect this to a DB)
let services = [
  {
    id: 1,
    title: 'Room Cleaning',
    description: 'Daily hostel room cleaning service',
    price: 30,
    category: 'Household',
    university: 'UG',
    hostel: 'Pent',
    createdAt: '2025-08-29'
  },
  {
    id: 2,
    title: 'Tutoring',
    description: 'Maths tutoring for SHS students',
    price: 50,
    category: 'Education',
    university: 'KNUST',
    hostel: 'SRC',
    createdAt: '2025-08-28'
  }
];

// GET services (with sorting support)
app.get('/services', (req, res) => {
  let sorted = [...services];
  const { sort } = req.query;

  if (sort === 'price') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'alpha') sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(sorted);
});

// POST a new service
app.post('/services', (req, res) => {
  const newService = { ...req.body, id: Date.now() }; // simple id
  services.push(newService);
  res.status(201).json(newService);
});

// DELETE a service
app.delete('/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  services = services.filter(s => s.id !== id);
  res.json({ message: `Service ${id} deleted` });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
