const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const client = require('prom-client');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003';

app.use(cors());
app.use(express.json());

const orders = [];

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
  res.json({ status: 'ok', service: 'orders-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(authenticate);

app.get('/', (req, res) => {
  res.json(orders);
});

app.get('/:id', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'order not found' });
  }
  res.json(order);
});

app.post('/', async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({ message: 'productId and positive quantity are required' });
  }

  try {
    const productResponse = await axios.get(`${PRODUCTS_SERVICE_URL}/${productId}`, {
      headers: { Authorization: req.headers.authorization }
    });

    const product = productResponse.data;
    if (product.stock < quantity) {
      return res.status(409).json({ message: 'insufficient stock' });
    }

    const order = {
      id: randomUUID(),
      userId: req.auth.sub,
      productId,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
      status: 'created',
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    res.status(201).json(order);
  } catch (error) {
    const status = error.response?.status || 502;
    res.status(status).json({
      message: 'could not validate product',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`orders-service listening on port ${PORT}`);
});
