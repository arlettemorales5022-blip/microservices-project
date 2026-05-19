const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const client = require('prom-client');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors());
app.use(express.json());

const users = [];

client.collectDefaultMetrics();
const httpRequests = new client.Counter({
  name: 'auth_service_http_requests_total',
  help: 'Total HTTP requests received by auth-service',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'email, password and name are required' });
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'user already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    email,
    name,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(user);

  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = users.find((storedUser) => storedUser.email === email);
  if (!user) {
    return res.status(401).json({ message: 'invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'invalid credentials' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, tokenType: 'Bearer', expiresIn: 3600 });
});

app.listen(PORT, () => {
  console.log(`auth-service listening on port ${PORT}`);
});
