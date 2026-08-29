/* ===== DEVO STORE — MAIN JS ===== */

// ===== CART =====
const Cart = {
  get() { return JSON.parse(localStorage.getItem('devo_cart') || '[]'); },
  save(cart) { localStorage.setItem('devo_cart', JSON.stringify(cart)); Cart.updateBadge(); },
  add(item) {
    const cart = Cart.get();
    const idx = cart.findIndex(i => i.product_id === item.product_id && i.size === item.size && i.color === item.color);
    if (idx > -1) cart[idx].quantity += item.quantity;
    else cart.push(item);
    Cart.save(cart);
    showToast('Added to cart! 🛒', 'success');
    Cart.renderSidebar();
  },
  remove(index) {
    const cart = Cart.get();
    cart.splice(index, 1);
    Cart.save(cart);
    Cart.renderSidebar();
  },
  clear() { localStorage.removeItem('devo_cart'); Cart.updateBadge(); },
  total() { return Cart.get().reduce((s, i) => s + i.price * i.quantity, 0); },
  count() { return Cart.get().reduce((s, i) => s + i.quantity, 0); },
  updateBadge() {
    const badge = document.getElementById('cart-badge');
    const count = Cart.count();
    if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  },
  renderSidebar() {
    const items = Cart.get();
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><h3>Your cart is empty</h3><p>Add some shoes to get started!</p></div>`;
    } else {
      container.innerHTML = items.map((item, i) => `
        <div class="cart-item">
          <img src="${item.image_url}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</div>
            <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
          </div>
          <button class="cart-item-remove" onclick="Cart.remove(${i})">✕</button>
        </div>
      `).join('');
    }
    if (totalEl) totalEl.textContent = formatPrice(Cart.total());
    Cart.updateBadge();
  }
};

// ===== AUTH =====
const Auth = {
  get() { return JSON.parse(localStorage.getItem('devo_user') || 'null'); },
  save(user) { localStorage.setItem('devo_user', JSON.stringify(user)); },
  logout() { localStorage.removeItem('devo_user'); window.location.href = '/index.html'; },
  isAdmin() { const u = Auth.get(); return u && u.role === 'admin'; },
  isLoggedIn() { return !!Auth.get(); }
};

// ===== API =====
const API = {
  base: '/api',
  async get(path) {
    const res = await fetch(this.base + path);
    return res.json();
  },
  async post(path, data) {
    const res = await fetch(this.base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },
  async put(path, data) {
    const res = await fetch(this.base + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },
  async delete(path) {
    const res = await fetch(this.base + path, { method: 'DELETE' });
    return res.json();
  }
};

// ===== UTILITIES =====
function formatPrice(p) { return `EGP ${Number(p).toLocaleString()}`; }
function formatDate(d) { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }

function showToast(msg, type = '') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? '#F5A623' : '#ddd'}">★</span>`
  ).join('');
}

// ===== NAVBAR =====
function initNavbar() {
  Cart.updateBadge();
  const user = Auth.get();
  const loginBtn = document.getElementById('nav-login-btn');
  const userBtn = document.getElementById('nav-user-btn');
  const userNameEl = document.getElementById('nav-user-name');

  if (loginBtn && userBtn) {
    if (user) {
      loginBtn.style.display = 'none';
      userBtn.style.display = 'flex';
      if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];
    } else {
      loginBtn.style.display = 'flex';
      userBtn.style.display = 'none';
    }
  }

  // Hamburger
  const ham = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (ham && navLinks) {
    ham.addEventListener('click', () => navLinks.classList.toggle('mobile-open'));
  }

  // Cart sidebar
  const cartBtn = document.getElementById('cart-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartClose = document.getElementById('cart-close');

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      Cart.renderSidebar();
      cartOverlay.classList.add('open');
      cartSidebar.classList.add('open');
    });
  }

  function closeCart() {
    cartOverlay?.classList.remove('open');
    cartSidebar?.classList.remove('open');
  }

  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Checkout button
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (Cart.count() === 0) return showToast('Your cart is empty', 'error');
    window.location.href = '/pages/checkout.html';
  });

  // Active nav link
  const currentPage = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') && currentPage.includes(a.getAttribute('href').replace('/index.html', '').replace('index.html', ''))) {
      a.classList.add('active');
    }
  });
}

// ===== MODAL =====
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ===== LOGIN MODAL =====
function initLoginModal() {
  const form = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.querySelector('[name=email]').value;
    const password = form.querySelector('[name=password]').value;
    const user = await API.post('/login', { email, password });
    if (user.error) return showToast(user.error, 'error');
    Auth.save(user);
    showToast(`Welcome back, ${user.name}! 👋`, 'success');
    closeModal('login-modal');
    setTimeout(() => {
      if (user.role === 'admin') window.location.href = '/admin/dashboard.html';
      else window.location.reload();
    }, 800);
  });

  regForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name: regForm.querySelector('[name=name]').value,
      email: regForm.querySelector('[name=email]').value,
      password: regForm.querySelector('[name=password]').value,
      phone: regForm.querySelector('[name=phone]').value,
    };
    const user = await API.post('/register', data);
    if (user.error) return showToast(user.error, 'error');
    Auth.save(user);
    showToast('Account created! Welcome to DEVO Store 🎉', 'success');
    closeModal('register-modal');
    setTimeout(() => window.location.reload(), 800);
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLoginModal();
});
