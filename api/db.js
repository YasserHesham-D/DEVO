const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../devo_store.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    sale_price REAL,
    category TEXT,
    gender TEXT,
    image_url TEXT,
    sizes TEXT,
    colors TEXT,
    stock INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_name TEXT,
    shipping_address TEXT,
    shipping_phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    size TEXT,
    color TEXT,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const admin = db.prepare("SELECT id FROM users WHERE email = 'admin@devostore.com'").get();
if (!admin) {
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run('Admin', 'admin@devostore.com', 'admin123', 'admin');
}

const count = db.prepare("SELECT COUNT(*) as c FROM products").get();
if (count.c === 0) {
  const products = [
    { name: 'DEVO Runner Pro', description: 'High-performance running shoe with advanced cushioning and breathable mesh upper. Perfect for long-distance runs and everyday training.', price: 1299, sale_price: 999, category: 'Running', gender: 'Men', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', sizes: '40,41,42,43,44,45,46', colors: 'Black,White,Orange', stock: 50, featured: 1 },
    { name: 'DEVO Street Classic', description: 'Iconic street-style sneaker combining comfort and bold design. Crafted for those who move with purpose.', price: 899, sale_price: null, category: 'Lifestyle', gender: 'Unisex', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', sizes: '36,37,38,39,40,41,42,43,44,45', colors: 'White,Black,Yellow', stock: 80, featured: 1 },
    { name: 'DEVO Court Elite', description: 'Engineered for court sports with superior lateral support, non-marking outsole, and responsive cushioning.', price: 1499, sale_price: 1199, category: 'Sports', gender: 'Men', image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', sizes: '40,41,42,43,44,45', colors: 'Navy,White,Black', stock: 35, featured: 1 },
    { name: 'DEVO Flex Women', description: 'Lightweight and flexible design built for the modern woman. From gym to street, all-day comfort guaranteed.', price: 1099, sale_price: null, category: 'Running', gender: 'Women', image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', sizes: '36,37,38,39,40,41', colors: 'Pink,White,Black', stock: 60, featured: 1 },
    { name: 'DEVO Trainer X', description: 'Cross-training powerhouse with stability for lifting and cushioning for cardio. Your all-in-one gym companion.', price: 1399, sale_price: 1099, category: 'Training', gender: 'Men', image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600', sizes: '40,41,42,43,44,45,46', colors: 'Gray,Black,Red', stock: 45, featured: 0 },
    { name: 'DEVO Aura Women', description: 'Sleek silhouette with memory foam insole and premium suede accents. Style meets comfort for everyday wear.', price: 999, sale_price: null, category: 'Lifestyle', gender: 'Women', image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600', sizes: '36,37,38,39,40,41', colors: 'Beige,White,Black', stock: 55, featured: 0 },
    { name: 'DEVO Speed Lite', description: 'Ultra-lightweight racing shoe designed for speed. Minimal drop, maximal propulsion.', price: 1599, sale_price: null, category: 'Running', gender: 'Unisex', image_url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600', sizes: '38,39,40,41,42,43,44,45', colors: 'Yellow,Black,White', stock: 25, featured: 0 },
    { name: 'DEVO Kids Star', description: 'Fun, durable sneaker for active kids. Easy velcro closure and extra toe protection for rough play.', price: 599, sale_price: 449, category: 'Kids', gender: 'Kids', image_url: 'https://images.unsplash.com/photo-1617143207675-e7e6371f5f5d?w=600', sizes: '28,29,30,31,32,33,34,35', colors: 'Blue,Red,Green', stock: 70, featured: 0 },
  ];
  const insert = db.prepare("INSERT INTO products (name, description, price, sale_price, category, gender, image_url, sizes, colors, stock, featured) VALUES (@name, @description, @price, @sale_price, @category, @gender, @image_url, @sizes, @colors, @stock, @featured)");
  products.forEach(p => insert.run(p));
}

module.exports = db;
