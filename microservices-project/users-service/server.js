const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const client = require('prom-client');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors());
app.use(express.json());

const users = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' }
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
  res.json({ status: 'ok', service: 'users-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(authenticate);

app.get('/', (req, res) => {
  res.json(users);
});

app.get('/:id', (req, res) => {
  const user = users.find((item) => item.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'user not found' });
  }
  res.json(user);
});

app.post('/', (req, res) => {
  const { name, email, role = 'user' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  const user = { id: randomUUID(), name, email, role };
  users.push(user);
  res.status(201).json(user);
});

app.put('/:id', (req, res) => {
  const index = users.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'user not found' });
  }

  users[index] = { ...users[index], ...req.body, id: req.params.id };
  res.json(users[index]);
});

app.delete('/:id', (req, res) => {
  const index = users.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'user not found' });
  }

  const [deletedUser] = users.splice(index, 1);
  res.json(deletedUser);
});

app.listen(PORT, () => {
  console.log(`users-service listening on port ${PORT}`);
});
