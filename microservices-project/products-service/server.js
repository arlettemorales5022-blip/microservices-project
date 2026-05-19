const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const client = require('prom-client');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors());
app.use(express.json());

const products = [
  { id: '1', name: 'Laptop', price: 1200, stock: 10 },
  { id: '2', name: 'Keyboard', price: 80, stock: 25 }
];

client.collectDefaultMetrics();

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'missing bearer token' });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'invalid or expired token' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'products-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(authenticate);

app.get('/', (req, res) => {
  res.json(products);
});

app.get('/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'product not found' });
  }
  res.json(product);
});

app.post('/', (req, res) => {
  const { name, price, stock = 0 } = req.body;

  if (!name || typeof price !== 'number') {
    return res.status(400).json({ message: 'name and numeric price are required' });
  }

  const product = { id: randomUUID(), name, price, stock };
  products.push(product);
  res.status(201).json(product);
});

app.put('/:id', (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'product not found' });
  }

  products[index] = { ...products[index], ...req.body, id: req.params.id };
  res.json(products[index]);
});

app.delete('/:id', (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'product not found' });
  }

  const [deletedProduct] = products.splice(index, 1);
  res.json(deletedProduct);
});

app.listen(PORT, () => {
  console.log(`products-service listening on port ${PORT}`);
});
