# 🛒 DEVO STORE — Full Ecommerce Website

Premium footwear ecommerce for **DEVO Store**, Sharia Al-Jumhuriya, Sohag, Egypt.

---

## 📁 Project Structure

```
devo-store/
├── index.html              ← Homepage
├── server.js               ← Express backend (Node.js)
├── package.json
├── devo_store.db           ← SQLite database (auto-created on first run)
│
├── css/
│   └── style.css           ← All brand styles (amber/black/white)
│
├── js/
│   ├── main.js             ← Cart, Auth, API, Toast utilities
│   └── components.js       ← Shared Navbar, Footer, Cart sidebar, Modals
│
├── pages/
│   ├── shop.html           ← Product listing with filters
│   ├── product.html        ← Product detail + reviews
│   ├── checkout.html       ← Order placement
│   ├── account.html        ← Customer profile & orders
│   ├── about.html          ← About Us page
│   └── contact.html        ← Contact page
│
├── admin/
│   ├── dashboard.html      ← Admin overview & stats
│   ├── products.html       ← Add/Edit/Delete products
│   ├── orders.html         ← View & update order statuses
│   └── customers.html      ← View & manage customers
│
└── api/
    └── db.js               ← SQLite database setup & seeding
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open in Browser
```
http://localhost:3000
```

The database (`devo_store.db`) is created automatically with **8 sample products** and an **admin account**.

---

## 🔑 Login Credentials

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Admin    | admin@devostore.com    | admin123   |
| Customer | (register new account) | —          |

---

## 📄 Pages Overview

### Customer Pages
| Page        | URL                      | Description                        |
|-------------|--------------------------|------------------------------------|
| Homepage    | `/index.html`            | Hero, featured products, about     |
| Shop        | `/pages/shop.html`       | All products with filters & search |
| Product     | `/pages/product.html?id=1` | Detail, size/color picker, reviews |
| Checkout    | `/pages/checkout.html`   | Cart review & order placement      |
| Account     | `/pages/account.html`    | Profile & order history            |
| About Us    | `/pages/about.html`      | Story, values, team, store info    |
| Contact     | `/pages/contact.html`    | Contact form & store details       |

### Admin Pages
| Page        | URL                         | Description                    |
|-------------|-----------------------------|--------------------------------|
| Dashboard   | `/admin/dashboard.html`     | Stats & recent orders          |
| Products    | `/admin/products.html`      | Add/Edit/Delete products       |
| Orders      | `/admin/orders.html`        | Manage order statuses          |
| Customers   | `/admin/customers.html`     | View & delete customers        |

---

## 🔌 API Endpoints

### Products
- `GET  /api/products`              — List all (supports `?category=`, `?gender=`, `?featured=`, `?search=`, `?sort=`)
- `GET  /api/products/:id`          — Single product with reviews
- `POST /api/products`              — Create product (admin)
- `PUT  /api/products/:id`          — Update product (admin)
- `DELETE /api/products/:id`        — Delete product (admin)

### Auth
- `POST /api/register`              — Register customer
- `POST /api/login`                 — Login

### Orders
- `POST /api/orders`                — Place order
- `GET  /api/orders`                — All orders / `?user_id=` for customer
- `GET  /api/orders/:id`            — Order detail with items
- `PUT  /api/orders/:id/status`     — Update order status (admin)

### Users
- `GET  /api/users`                 — All users (admin)
- `PUT  /api/users/:id`             — Update profile
- `DELETE /api/users/:id`           — Delete user (admin)

### Reviews
- `POST /api/reviews`               — Submit product review

### Stats
- `GET  /api/stats`                 — Dashboard stats (admin)

---

## 🎨 Brand Colors
| Color       | Hex        | Usage                      |
|-------------|------------|----------------------------|
| Amber       | `#F5A623`  | Primary brand, CTAs, accents |
| Black       | `#1A1A1A`  | Navbar, hero, backgrounds  |
| White       | `#FFFFFF`  | Text on dark, cards        |

---

## 🏪 Store Info
- **Address:** Sharia Al-Jumhuriya, Sohag, Egypt, 82511
- **Phone:** 010 68333271 / +20 10 68333271
- **Hours:** Sat–Thu 10am–10pm | Fri 2pm–10pm

---

## ⚙️ Technologies Used
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js + Express.js
- **Database:** SQLite (via better-sqlite3)
- **Fonts:** Barlow Condensed + Inter (Google Fonts)
- **Images:** Unsplash (placeholder product images)

---

## 🛠️ Customization

### Add Products
Login as admin → Admin Panel → Products → "+ Add New Product"

### Change Store Info
Edit `js/components.js` → Update the `FOOTER_HTML` and `NAV_HTML` strings.

### Change Colors
Edit `css/style.css` → Update the `:root` CSS variables at the top.

### Change Product Images
In Admin → Products → Edit → paste any image URL (Unsplash, your own hosting, etc.)

---

*Built for DEVO Store — Sohag, Egypt 🇪🇬*
