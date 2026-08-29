/* ==========================================================================
   DEVO STORE — Database layer
   Loads the real SQLite database (assets/db/devo.sqlite) via sql.js (WASM)
   and exposes small query helpers used by the rest of the app.
   ========================================================================== */

window.DevoDB = (function () {
  let SQL = null;
  let db = null;
  const STORAGE_KEY = "devo_database_snapshot_v1";

  function encodeDatabase(data) {
    let binary = "";
    for (let index = 0; index < data.length; index += 1) binary += String.fromCharCode(data[index]);
    return btoa(binary);
  }

  function decodeDatabase(value) {
    const binary = atob(value);
    const data = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) data[index] = binary.charCodeAt(index);
    return data;
  }

  function saveSnapshot() {
    try {
      localStorage.setItem(STORAGE_KEY, encodeDatabase(db.export()));
    } catch (error) {
      console.warn("تعذر حفظ تغييرات قاعدة البيانات في المتصفح", error);
    }
  }

  async function init() {
    SQL = await initSqlJs({
      locateFile: (file) => `js/lib/${file}`,
    });

    const savedDatabase = localStorage.getItem(STORAGE_KEY);
    if (savedDatabase) {
      try {
        db = new SQL.Database(decodeDatabase(savedDatabase));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    if (!db) {
      const res = await fetch("assets/db/devo.sqlite");
      if (!res.ok) throw new Error("تعذر تحميل قاعدة البيانات");
      const buf = await res.arrayBuffer();
      db = new SQL.Database(new Uint8Array(buf));
    }
    ensureProductColumns();
    return db;
  }

  // Earlier catalogue exports did not include these optional merchandising
  // fields. Keep the static site compatible with those exports by upgrading
  // the in-memory database as it is opened.
  function ensureProductColumns() {
    const columns = new Set(query("PRAGMA table_info(products)").map((column) => column.name));
    const additions = [
      ["color_images", "TEXT NOT NULL DEFAULT ''"],
      ["brand", "TEXT NOT NULL DEFAULT 'DEVO'"],
    ];

    additions.forEach(([name, definition]) => {
      if (!columns.has(name)) run(`ALTER TABLE products ADD COLUMN ${name} ${definition}`);
    });
  }

  // Runs a SELECT and returns an array of plain objects.
  function query(sql, params = []) {
    if (!db) throw new Error("Database not initialized");
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function run(sql, params = []) {
    if (!db) throw new Error("Database not initialized");
    db.run(sql, params);
    saveSnapshot();
  }

  function getCategories() {
    return query("SELECT * FROM categories ORDER BY id");
  }

  function getCategoryBySlug(slug) {
    const rows = query("SELECT * FROM categories WHERE slug = ?", [slug]);
    return rows[0] || null;
  }

  function getProducts({ category = null, color = null, brand = null, search = "", sort = "featured", minPrice = null, maxPrice = null } = {}) {
    let sql = `SELECT p.*, c.name_ar as cat_name, c.slug as cat_slug
               FROM products p JOIN categories c ON c.id = p.category_id WHERE 1=1`;
    const params = [];
    if (category) { sql += " AND c.slug = ?"; params.push(category); }
    if (search) { sql += " AND (p.name_ar LIKE ? OR p.colors LIKE ? OR p.brand LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (color) { sql += " AND p.colors LIKE ?"; params.push(`%${color}%`); }
    if (brand) { sql += " AND p.brand = ?"; params.push(brand); }
    if (minPrice != null) { sql += " AND p.price >= ?"; params.push(minPrice); }
    if (maxPrice != null) { sql += " AND p.price <= ?"; params.push(maxPrice); }

    switch (sort) {
      case "price-asc": sql += " ORDER BY p.price ASC"; break;
      case "price-desc": sql += " ORDER BY p.price DESC"; break;
      case "new": sql += " ORDER BY p.is_new DESC, p.id DESC"; break;
      case "rating": sql += " ORDER BY p.rating DESC"; break;
      default: sql += " ORDER BY p.is_featured DESC, p.id ASC";
    }
    return query(sql, params);
  }

  function getBrands() {
    return query("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != '' ORDER BY brand").map((row) => row.brand);
  }

  function getProductById(id) {
    const rows = query(
      `SELECT p.*, c.name_ar as cat_name, c.slug as cat_slug
       FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  function getFeatured(limit = 8) {
    return query(
      `SELECT p.*, c.name_ar as cat_name, c.slug as cat_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.is_featured = 1 ORDER BY p.id LIMIT ?`,
      [limit]
    );
  }

  function getDeals(limit = 8) {
    return query(
      `SELECT p.*, c.name_ar as cat_name, c.slug as cat_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.old_price IS NOT NULL ORDER BY (p.old_price - p.price) DESC, p.id LIMIT ?`,
      [limit]
    );
  }

  function getColorVariants(product, color, limit = 6) {
    return query(
      `SELECT p.*, c.name_ar as cat_name, c.slug as cat_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.category_id = ? AND p.colors LIKE ? ORDER BY p.id LIMIT ?`,
      [product.category_id, `%${color}%`, limit]
    );
  }

  function getOrders() {
    return query("SELECT * FROM orders ORDER BY id DESC");
  }

  function insertProduct(product) {
    run(
      `INSERT INTO products (name_ar, category_id, price, old_price, sizes, colors, color_images, brand, description_ar, image, rating, reviews, is_new, is_featured, stock)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [product.name_ar, product.category_id, product.price, product.old_price || null, product.sizes, product.colors, product.color_images || "", product.brand || "DEVO", product.description_ar, product.image, 5, 0, product.is_new ? 1 : 0, product.is_featured ? 1 : 0, product.stock]
    );
  }

  function updateProduct(product) {
    run(
      `UPDATE products SET name_ar=?, category_id=?, price=?, old_price=?, sizes=?, colors=?, color_images=?, brand=?, description_ar=?, image=?, is_new=?, is_featured=?, stock=? WHERE id=?`,
      [product.name_ar, product.category_id, product.price, product.old_price || null, product.sizes, product.colors, product.color_images || "", product.brand || "DEVO", product.description_ar, product.image, product.is_new ? 1 : 0, product.is_featured ? 1 : 0, product.stock, product.id]
    );
  }

  function deleteProduct(id) {
    run("DELETE FROM products WHERE id = ?", [id]);
  }

  function insertCategory(category) {
    run("INSERT INTO categories (slug, name_ar, tagline_ar) VALUES (?,?,?)", [category.slug, category.name_ar, category.tagline_ar || ""]);
  }

  function updateCategory(category) {
    run("UPDATE categories SET slug=?, name_ar=?, tagline_ar=? WHERE id=?", [category.slug, category.name_ar, category.tagline_ar || "", category.id]);
  }

  function deleteCategory(id) {
    run("DELETE FROM categories WHERE id = ?", [id]);
  }

  function updateOrderStatus(id, status) {
    run("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  }

  function getRelated(product, limit = 4) {
    return query(
      `SELECT p.*, c.name_ar as cat_name, c.slug as cat_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.category_id = ? AND p.id != ? ORDER BY RANDOM() LIMIT ?`,
      [product.category_id, product.id, limit]
    );
  }

  function getPriceBounds() {
    const rows = query("SELECT MIN(price) as min, MAX(price) as max FROM products");
    return rows[0] || { min: 0, max: 2000 };
  }

  function countByCategory() {
    const rows = query(
      `SELECT c.slug, COUNT(p.id) as n FROM categories c
       LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id`
    );
    const map = {};
    rows.forEach((r) => (map[r.slug] = r.n));
    return map;
  }

  function insertOrder(order) {
    run(
      `INSERT INTO orders (customer_name, phone, city, address, notes, items_json, total, status, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        order.name,
        order.phone,
        order.city,
        order.address,
        order.notes || "",
        JSON.stringify(order.items),
        order.total,
        "قيد المراجعة",
        new Date().toISOString(),
      ]
    );
    const rows = query("SELECT last_insert_rowid() as id");
    return rows[0].id;
  }

  function exportDatabase() {
    const data = db.export();
    const blob = new Blob([data], { type: "application/x-sqlite3" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devo-store.sqlite";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return {
    init,
    getCategories,
    getCategoryBySlug,
    getProducts,
    getBrands,
    getProductById,
    getFeatured,
    getDeals,
    getColorVariants,
    getOrders,
    insertProduct,
    updateProduct,
    deleteProduct,
    insertCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    getRelated,
    getPriceBounds,
    countByCategory,
    insertOrder,
    exportDatabase,
  };
})();
