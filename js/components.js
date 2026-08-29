/* ===== DEVO STORE — SHARED HTML COMPONENTS ===== */

const NAV_HTML = `
<div class="announcement-bar">🚚 Free Delivery in Sohag | 📍 Sharia Al-Jumhuriya, Sohag | 📞 010 68333271</div>
<nav class="navbar">
  <a href="/index.html" class="navbar-logo">
    <span class="logo-text">DE<span class="logo-v">V</span>O</span>
  </a>
  <ul class="nav-links" id="nav-links">
    <li><a href="/index.html">Home</a></li>
    <li><a href="/pages/shop.html">Shop</a></li>
    <li><a href="/pages/about.html">About Us</a></li>
    <li><a href="/pages/contact.html">Contact</a></li>
  </ul>
  <div class="nav-actions">
    <button class="nav-icon-btn" id="cart-btn" title="Cart">
      🛒
      <span class="cart-badge" id="cart-badge" style="display:none">0</span>
    </button>
    <a href="/pages/account.html" class="nav-icon-btn" id="nav-user-btn" style="display:none" title="My Account">
      👤 <span id="nav-user-name"></span>
    </a>
    <button class="btn btn-nav-login" id="nav-login-btn" onclick="openModal('login-modal')">Login</button>
    <button class="hamburger" id="hamburger">☰</button>
  </div>
</nav>`;

const CART_SIDEBAR_HTML = `
<div class="cart-overlay" id="cart-overlay"></div>
<div class="cart-sidebar" id="cart-sidebar">
  <div class="cart-header">
    <h3>🛒 YOUR CART</h3>
    <button class="cart-close" id="cart-close">✕</button>
  </div>
  <div class="cart-items" id="cart-items"></div>
  <div class="cart-footer">
    <div class="cart-total">
      <span>Total</span>
      <span id="cart-total">EGP 0</span>
    </div>
    <button class="btn btn-primary btn-full btn-lg" id="checkout-btn">Proceed to Checkout →</button>
    <div style="text-align:center;margin-top:0.8rem">
      <a href="/pages/shop.html" style="color:var(--gray-mid);font-size:0.85rem;text-decoration:none">Continue Shopping</a>
    </div>
  </div>
</div>`;

const LOGIN_MODAL_HTML = `
<div class="modal-overlay" id="login-modal">
  <div class="modal">
    <div class="modal-header">
      <h3>LOGIN TO DEVO STORE</h3>
      <button class="modal-close" onclick="closeModal('login-modal')">✕</button>
    </div>
    <div class="modal-body">
      <form id="login-form">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" name="email" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top:1rem">Sign In</button>
      </form>
      <div style="text-align:center;margin-top:1.5rem;color:var(--gray-dark);font-size:0.9rem">
        Don't have an account?
        <a href="#" style="color:var(--amber);font-weight:700" onclick="closeModal('login-modal');openModal('register-modal')">Create Account</a>
      </div>
      <div style="text-align:center;margin-top:0.5rem;font-size:0.8rem;color:var(--gray-mid)">
        Admin? Use: admin@devostore.com / admin123
      </div>
    </div>
  </div>
</div>`;

const REGISTER_MODAL_HTML = `
<div class="modal-overlay" id="register-modal">
  <div class="modal">
    <div class="modal-header">
      <h3>CREATE ACCOUNT</h3>
      <button class="modal-close" onclick="closeModal('register-modal')">✕</button>
    </div>
    <div class="modal-body">
      <form id="register-form">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="name" placeholder="Ahmed Mohamed" required>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" name="email" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phone" placeholder="010 XXXXXXXX">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••" required minlength="6">
        </div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top:1rem">Create Account</button>
      </form>
      <div style="text-align:center;margin-top:1.5rem;color:var(--gray-dark);font-size:0.9rem">
        Already have an account?
        <a href="#" style="color:var(--amber);font-weight:700" onclick="closeModal('register-modal');openModal('login-modal')">Sign In</a>
      </div>
    </div>
  </div>
</div>`;

const FOOTER_HTML = `
<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <span class="logo-text">DE<span style="color:var(--amber)">V</span>O</span>
      <p>Your destination for premium footwear in Sohag, Egypt. Quality shoes for every step of your journey.</p>
      <div class="footer-socials">
        <a href="#" class="social-link">📘</a>
        <a href="#" class="social-link">📸</a>
        <a href="#" class="social-link">🐦</a>
        <a href="https://wa.me/201068333271" class="social-link" target="_blank">💬</a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Shop</h4>
      <ul>
        <li><a href="/pages/shop.html">All Shoes</a></li>
        <li><a href="/pages/shop.html?gender=Men">Men's</a></li>
        <li><a href="/pages/shop.html?gender=Women">Women's</a></li>
        <li><a href="/pages/shop.html?category=Kids">Kids</a></li>
        <li><a href="/pages/shop.html?sale=true">Sale</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Categories</h4>
      <ul>
        <li><a href="/pages/shop.html?category=Running">Running</a></li>
        <li><a href="/pages/shop.html?category=Lifestyle">Lifestyle</a></li>
        <li><a href="/pages/shop.html?category=Sports">Sports</a></li>
        <li><a href="/pages/shop.html?category=Training">Training</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Help</h4>
      <ul>
        <li><a href="/pages/about.html">About Us</a></li>
        <li><a href="/pages/contact.html">Contact Us</a></li>
        <li><a href="/pages/account.html">My Account</a></li>
        <li><a href="/pages/account.html">Track Order</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 DEVO Store — Sharia Al-Jumhuriya, Sohag, Egypt 82511</span>
    <span style="color:var(--amber)">Made with ❤️ in Sohag</span>
  </div>
</footer>`;

// Inject components
function injectComponents() {
  const navMount = document.getElementById('nav-mount');
  const footerMount = document.getElementById('footer-mount');
  if (navMount) navMount.innerHTML = NAV_HTML + CART_SIDEBAR_HTML + LOGIN_MODAL_HTML + REGISTER_MODAL_HTML;
  if (footerMount) footerMount.innerHTML = FOOTER_HTML;
}

document.addEventListener('DOMContentLoaded', injectComponents);
