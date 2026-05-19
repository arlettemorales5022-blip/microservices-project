const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
  products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003',
  orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3004'
};

app.use(cors());
app.use(morgan('combined'));

client.collectDefaultMetrics();

function makeProxy(target, stripPrefix) {
  return proxy(target, {
    proxyReqPathResolver: (req) => req.originalUrl.replace(stripPrefix, '') || '/',
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Preserve JWT and content negotiation headers when routing internally.
      proxyReqOpts.headers.Authorization = srcReq.headers.authorization || '';
      proxyReqOpts.headers['Content-Type'] = srcReq.headers['content-type'] || 'application/json';
      return proxyReqOpts;
    }
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway-service', services });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/auth', makeProxy(services.auth, /^\/auth/));
app.use('/users', makeProxy(services.users, /^\/users/));
app.use('/products', makeProxy(services.products, /^\/products/));
app.use('/orders', makeProxy(services.orders, /^\/orders/));

app.use((req, res) => {
  res.status(404).json({ message: 'route not found' });
});

app.listen(PORT, () => {
  console.log(`gateway-service listening on port ${PORT}`);
});

