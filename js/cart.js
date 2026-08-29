/* ==========================================================================
   DEVO STORE — Cart
   Persisted in localStorage. Line key = productId + size.
   ========================================================================== */

window.DevoCart = (function () {
  const STORAGE_KEY = "devo_cart_v1";
  const WISHLIST_KEY = "devo_wishlist_v1";
  let listeners = [];

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notify();
  }

  function notify() {
    const items = load();
    listeners.forEach((fn) => fn(items));
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function add(product, size, qty = 1) {
    const items = load();
    const existing = items.find((i) => i.id === product.id && i.size === size);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name_ar,
        price: product.price,
        image: product.image,
        size,
        qty,
      });
    }
    save(items);
  }

  function updateQty(id, size, qty) {
    let items = load();
    if (qty <= 0) {
      items = items.filter((i) => !(i.id === id && i.size === size));
    } else {
      const line = items.find((i) => i.id === id && i.size === size);
      if (line) line.qty = qty;
    }
    save(items);
  }

  function remove(id, size) {
    const items = load().filter((i) => !(i.id === id && i.size === size));
    save(items);
  }

  function clear() {
    save([]);
  }

  function totals() {
    const items = load();
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const shipping = subtotal > 0 ? (subtotal >= 1500 ? 0 : 75) : 0;
    return { subtotal, shipping, total: subtotal + shipping, count };
  }

  // Wishlist (simple id set)
  function loadWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function toggleWishlist(id) {
    let list = loadWishlist();
    if (list.includes(id)) list = list.filter((x) => x !== id);
    else list.push(id);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    notify();
    return list.includes(id);
  }
  function isWishlisted(id) {
    return loadWishlist().includes(id);
  }

  return { load, add, updateQty, remove, clear, totals, onChange, toggleWishlist, isWishlisted, loadWishlist };
})();
