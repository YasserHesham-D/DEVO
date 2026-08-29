const express = require('express');
const path = require('path');
const db = require('./api/db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ---- PRODUCTS API ----
app.get('/api/products', (req, res) => {
  const { category, gender, featured, search, sort } = req.query;
  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];
  if (category) { query += " AND category=?"; params.push(category); }
  if (gender) { query += " AND (gender=? OR gender='Unisex')"; params.push(gender); }
  if (featured) { query += " AND featured=1"; }
  if (search) { query += " AND (name LIKE ? OR description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
  if (sort === 'price_asc') query += " ORDER BY COALESCE(sale_price, price) ASC";
  else if (sort === 'price_desc') query += " ORDER BY COALESCE(sale_price, price) DESC";
  else query += " ORDER BY featured DESC, id DESC";
  res.json(db.prepare(query).all(...params));
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id=?").get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const reviews = db.prepare("SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=?").all(product.id);
  res.json({ ...product, reviews });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, sale_price, category, gender, image_url, sizes, colors, stock, featured } = req.body;
  const result = db.prepare("INSERT INTO products (name, description, price, sale_price, category, gender, image_url, sizes, colors, stock, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(name, description, price, sale_price||null, category, gender, image_url, sizes, colors, stock||0, featured?1:0);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/products/:id', (req, res) => {
  const { name, description, price, sale_price, category, gender, image_url, sizes, colors, stock, featured } = req.body;
  db.prepare("UPDATE products SET name=?,description=?,price=?,sale_price=?,category=?,gender=?,image_url=?,sizes=?,colors=?,stock=?,featured=? WHERE id=?").run(name, description, price, sale_price||null, category, gender, image_url, sizes, colors, stock||0, featured?1:0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

// ---- USERS API ----
app.post('/api/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    const result = db.prepare("INSERT INTO users (name, email, password, phone, address) VALUES (?,?,?,?,?)").run(name, email, password, phone||'', address||'');
    const user = db.prepare("SELECT id, name, email, role, phone, address FROM users WHERE id=?").get(result.lastInsertRowid);
    res.json(user);
  } catch(e) { res.status(400).json({ error: 'Email already registered' }); }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT id, name, email, role, phone, address FROM users WHERE email=? AND password=?").get(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json(user);
});

app.get('/api/users', (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, phone, address, created_at FROM users").all();
  res.json(users);
});

app.put('/api/users/:id', (req, res) => {
  const { name, phone, address, password } = req.body;
  if (password) {
    db.prepare("UPDATE users SET name=?,phone=?,address=?,password=? WHERE id=?").run(name, phone, address, password, req.params.id);
  } else {
    db.prepare("UPDATE users SET name=?,phone=?,address=? WHERE id=?").run(name, phone, address, req.params.id);
  }
  res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
  db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

// ---- ORDERS API ----
app.post('/api/orders', (req, res) => {
  const { user_id, items, shipping_name, shipping_address, shipping_phone, notes } = req.body;
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const order = db.prepare("INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_phone, notes) VALUES (?,?,?,?,?,?)").run(user_id||null, total, shipping_name, shipping_address, shipping_phone, notes||'');
  const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, size, color, price) VALUES (?,?,?,?,?,?)");
  items.forEach(i => insertItem.run(order.lastInsertRowid, i.product_id, i.quantity, i.size, i.color, i.price));
  res.json({ id: order.lastInsertRowid, total });
});

app.get('/api/orders', (req, res) => {
  const { user_id } = req.query;
  let orders;
  if (user_id) {
    orders = db.prepare("SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.user_id=? ORDER BY o.created_at DESC").all(user_id);
  } else {
    orders = db.prepare("SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC").all();
  }
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare("SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=?").get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  const items = db.prepare("SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=?").all(order.id);
  res.json({ ...order, items });
});

app.put('/api/orders/:id/status', (req, res) => {
  db.prepare("UPDATE orders SET status=? WHERE id=?").run(req.body.status, req.params.id);
  res.json({ success: true });
});

// ---- REVIEWS API ----
app.post('/api/reviews', (req, res) => {
  const { product_id, user_id, rating, comment } = req.body;
  db.prepare("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)").run(product_id, user_id, rating, comment);
  res.json({ success: true });
});

// ---- STATS API ----
app.get('/api/stats', (req, res) => {
  const total_orders = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const total_revenue = db.prepare("SELECT SUM(total) as s FROM orders WHERE status != 'cancelled'").get().s || 0;
  const total_products = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
  const total_customers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='customer'").get().c;
  const recent_orders = db.prepare("SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT 5").all();
  res.json({ total_orders, total_revenue, total_products, total_customers, recent_orders });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`DEVO Store running on http://localhost:${PORT}`));
