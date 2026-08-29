import { Icons } from "./icons.js";

const DB = window.DevoDB;
const Cart = window.DevoCart;

const STORE = {
  name: "DEVO Store",
  phone: "01068333271",
  phoneIntl: "201068333271",
  city: "سوهاج",
  address: "شارع الجمهورية، سوهاج، مصر",
  followers: "22,000+",
};

const $app = document.getElementById("app");

/* ---------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ---------------------------------------------------------------------- */

function fmtPrice(n) {
  return `${Math.round(n).toLocaleString("en-US")} ج.م`;
}

function starsHTML(rating) {
  const full = Math.round(rating);
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += `<span style="opacity:${i < full ? 1 : 0.28}">${Icons.star}</span>`;
  }
  return out;
}

function toast(message, iconName = "check") {
  const wrap = document.getElementById("toast-wrap");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${Icons[iconName] || Icons.check}<span>${message}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s ease, transform .3s ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

function navigate(hash) {
  window.location.hash = hash;
}

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path, queryStr] = raw.split("?");
  const params = new URLSearchParams(queryStr || "");
  const segments = path.split("/").filter(Boolean);
  return { segments, params };
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

/* ---------------------------------------------------------------------- */
/* Product card                                                            */
/* ---------------------------------------------------------------------- */

function productCard(p) {
  const wished = Cart.isWishlisted(p.id);
  const discount = p.old_price ? Math.round(100 - (p.price / p.old_price) * 100) : null;
  const colors = productColors(p);
  return `
  <article class="p-card" data-id="${p.id}">
    <a href="#/product/${p.id}" class="p-card-media">
      <div class="p-tags">
        ${p.is_new ? `<span class="tag tag-new">جديد</span>` : ""}
        ${discount ? `<span class="tag tag-sale">خصم ${discount}%</span>` : ""}
      </div>
      <img class="js-card-image" src="${p.image}" alt="${p.name_ar}" loading="lazy">
      <button class="p-quickadd btn btn-primary btn-block btn-sm js-quickadd" data-id="${p.id}">أضف للسلة</button>
    </a>
    <button class="p-wish js-wish ${wished ? "active" : ""}" data-id="${p.id}" aria-label="أضف للمفضلة">${wished ? Icons.heartFill : Icons.heart}</button>
    <div class="p-card-body">
      <span class="p-cat-label">${p.cat_name}</span>
      <a href="#/product/${p.id}"><h3 class="p-name">${p.name_ar}</h3></a>
      ${p.brand ? `<span class="p-brand">${p.brand}</span>` : ""}
      <div class="p-rating">${starsHTML(p.rating)}<span>(${p.reviews})</span></div>
      <div class="p-price-row">
        <span class="p-price">${fmtPrice(p.price)}</span>
        ${p.old_price ? `<span class="p-price-old">${fmtPrice(p.old_price)}</span>` : ""}
      </div>
      ${colors.length ? `<div class="card-colors" aria-label="الألوان المتاحة">${colors.map((color, index) => `<button class="card-color js-card-color ${index === 0 ? "active" : ""}" type="button" data-color="${color}" data-image="${imageForColor(p, color)}" aria-label="لون ${color}" title="${color}" style="--swatch:${colorKey(color)}"></button>`).join("")}<span class="card-color-name">${colors[0]}</span></div>` : ""}
    </div>
  </article>`;
}

function normalizeColorName(str) {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/[ً-ْ]/g, "") // remove tashkeel
    .replace(/[أإآ]/g, "ا") // unify alef
    .replace(/ة/g, "ه") // unify taa marbouta
    .replace(/ى/g, "ي") // unify alef maksura
    .replace(/چ/g, "ج") // unify geem
    .replace(/[\s\-_]+/g, ""); // remove spaces/hyphens
}

function colorKey(color) {
  if (!color) return "#C97F1B";
  const raw = String(color).trim();

  // If hex or rgb or CSS color is passed directly
  if (raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl")) return raw;

  const normalized = normalizeColorName(raw);

  const colorMap = {
    // White / Off-white / Cream
    "ابيض": "#FFFFFF",
    "white": "#FFFFFF",
    "سكري": "#FDFBF7",
    "اوفوايت": "#F8F6F0",
    "offwhite": "#F8F6F0",
    "كريمي": "#FFFDD0",
    "cream": "#FFFDD0",

    // Black / Dark
    "اسود": "#16130E",
    "black": "#16130E",
    "فحمي": "#2B2B2B",
    "charcoal": "#2B2B2B",

    // Grey / Silver
    "رمادي": "#8C8577",
    "رصاصي": "#9E9E9E",
    "grey": "#8C8577",
    "gray": "#8C8577",
    "فضي": "#C0C0C0",
    "silver": "#C0C0C0",

    // Blue / Navy / Cyan
    "كحلي": "#1B2A4A",
    "navy": "#1B2A4A",
    "ازرق": "#2563EB",
    "blue": "#2563EB",
    "سماوي": "#38BDF8",
    "cyan": "#06B6D4",
    "بترولي": "#0E7490",
    "نيلي": "#4338CA",
    "indigo": "#4338CA",

    // Red / Burgundy / Maroon / Pink
    "احمر": "#DC2626",
    "red": "#DC2626",
    "عنابي": "#7D2935",
    "burgundy": "#7D2935",
    "نبيتي": "#6B1D2F",
    "maroon": "#6B1D2F",
    "وردي": "#EC4899",
    "بينك": "#F472B6",
    "pink": "#F472B6",
    "فوشيا": "#D946EF",

    // Green / Olive
    "اخضر": "#16A34A",
    "green": "#16A34A",
    "زيتي": "#4D533C",
    "olive": "#4D533C",
    "فستقي": "#93C572",
    "ليموني": "#84CC16",

    // Yellow / Gold / Mustard
    "اصفر": "#EAB308",
    "yellow": "#EAB308",
    "ذهبي": "#D4AF37",
    "gold": "#D4AF37",
    "خردلي": "#CA8A04",
    "mustard": "#CA8A04",

    // Orange / Peach
    "برتقالي": "#EA580C",
    "orange": "#EA580C",
    "خوخي": "#FB923C",
    "peach": "#FB923C",

    // Brown / Beige / Tan / Camel
    "بني": "#78350F",
    "brown": "#78350F",
    "بيج": "#D9C5A1",
    "beige": "#D9C5A1",
    "هافان": "#C26D38",
    "havana": "#C26D38",
    "جملي": "#C19A6B",
    "camel": "#C19A6B",
    "تان": "#D2B48C",
    "tan": "#D2B48C",
    "كافيه": "#8D6E63",

    // Purple / Violet
    "موف": "#8B5CF6",
    "بنفسجي": "#7C3AED",
    "purple": "#8B5CF6",
    "ارجواني": "#9333EA",
  };

  if (colorMap[normalized]) return colorMap[normalized];

  for (const key in colorMap) {
    if (normalized.includes(key)) {
      return colorMap[key];
    }
  }

  return "#C97F1B";
}

function productColors(product) {
  if (!product) return [];
  const fromColors = (product.colors || "").split(/[،,]/).map((color) => color.trim()).filter(Boolean);
  if (fromColors.length) return fromColors;
  const fromImages = Object.keys(productColorImages(product));
  return fromImages;
}

function productColorImages(product) {
  if (!product) return {};
  const images = {};
  (product.color_images || "").split("|").forEach((item) => {
    const separator = item.indexOf("=");
    const color = separator >= 0 ? item.slice(0, separator).trim() : "";
    const image = separator >= 0 ? item.slice(separator + 1).trim() : "";
    if (color && image) images[color] = image;
  });
  return images;
}

function allProductImages(product) {
  if (!product) return ["assets/products/prod_01.jpg"];
  const list = [];
  if (product.image) list.push(product.image);
  const colorMap = productColorImages(product);
  Object.values(colorMap).forEach((img) => {
    if (img && !list.includes(img)) list.push(img);
  });
  return list.length ? list : [product.image || "assets/products/prod_01.jpg"];
}

function imageForColor(product, color) {
  const map = productColorImages(product);
  const cleanColor = (color || "").trim();
  if (map[cleanColor]) return map[cleanColor];
  
  // Try normalized lookup
  const norm = normalizeColorName(cleanColor);
  for (const k in map) {
    if (normalizeColorName(k) === norm) return map[k];
  }

  return product.image;
}

function skeletonCards(n = 8) {
  return Array.from({ length: n })
    .map(
      () => `<div class="p-card"><div class="skel" style="aspect-ratio:1/1"></div>
      <div class="p-card-body"><div class="skel" style="height:12px;width:60%"></div><div class="skel" style="height:16px;width:90%"></div><div class="skel" style="height:20px;width:40%"></div></div></div>`
    )
    .join("");
}

/* ---------------------------------------------------------------------- */
/* Chrome: nav categories + cart badge                                     */
/* ---------------------------------------------------------------------- */

function updateCartBadge() {
  const { count } = Cart.totals();
  document.querySelectorAll(".js-cart-badge").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

function updateWishlistBadge() {
  const list = Cart.loadWishlist();
  const count = list.length;
  document.querySelectorAll(".js-wish-badge").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ---------------------------------------------------------------------- */
/* PAGE: Home                                                              */
/* ---------------------------------------------------------------------- */

function pageHome() {
  const cats = DB.getCategories();
  const counts = DB.countByCategory();
  const catIcons = { sneakers: "catSneaker", running: "catRunner", slides: "catSlide", sandals: "catSandal", loafers: "catLoafer" };
  const categoryImages = Object.fromEntries(cats.map((c) => [c.slug, DB.getProducts({ category: c.slug })[0]?.image]));

  $app.innerHTML = `
  <section class="hero">
    <div class="hero-glow"></div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <div class="hero-eyebrow"><span class="dot"></span> أكبر وأقوى استور أحذية في سوهاج</div>
        
        <h1 class="h-display">
          <span class="cut">خطوتك</span> الجاية<br>
          من <span class="accent">DE<span class="brand-v">V</span>O</span>
        </h1>
        <p class="hero-sub">سنيكرز، شبشب، صنادل وكاجوال أصلي 100%. تشكيلة جديدة كل أسبوع، وتوصيل لكل محافظات الجمهورية.</p>
        <div class="hero-ctas">
          <a href="#/shop" class="btn btn-gold">تسوق دلوقتي ${Icons.arrowRTL}</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><b>${STORE.followers}</b><span>متابع على فيسبوك</span></div>
          <div class="stat"><b>+${DB.getProducts().length}</b><span>موديل متاح</span></div>
          <div class="stat"><b>27</b><span>محافظة توصيل</span></div>
        </div>
      </div>
      <div class="hero-stage">
        <img class="hero-product-image" src="assets/hero-shoe-action.png" alt="حذاء رياضي أسود من DEVO">
        <div class="hero-sticker s2">شحن لكل الجمهورية</div>
      </div>
    </div>
  </section>

  <section class="confidence-strip" aria-label="مميزات التسوق من DEVO">
    <div class="container">
      <span>${Icons.shieldCheck} منتجات أصلية مختارة بعناية</span>
      <span>${Icons.truck} توصيل سريع لكل المحافظات</span>
      <span>${Icons.cash} الدفع عند الاستلام</span>
      <span>${Icons.refresh} استبدال المقاس بسهولة</span>
    </div>
  </section>

  <section class="cat-strip container">
    <div class="section-head"><h2>تسوق حسب النوع</h2></div>
    <div class="cat-row">
      ${cats
      .slice(0, 5)
      .map(
        (c) => `
        <a href="#/shop?cat=${c.slug}" class="cat-chip">
          <span class="cat-icon"><img src="${categoryImages[c.slug] || "assets/logo.jpg"}" alt="${c.name_ar}"></span>
          <b>${c.name_ar}</b>
          <span>${counts[c.slug] || 0} موديل</span>
        </a>`
      )
      .join("")}
    </div>
    ${cats.length > 5 ? `<div style="text-align:center;margin-top:22px"><a href="#/categories" class="btn btn-outline" style="border-color:var(--ink-line);color:var(--ink)">عرض كل الفئات ${Icons.arrowRTL}</a></div>` : ""}
  </section>

  <section class="block">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="eyebrow">الأكثر رواجًا</span>
          <h2>ترندات الأسبوع</h2>
          <p>الموديلات اللي بتتباع أسرع من أي حاجة تانية في المتجر.</p>
        </div>
        <a href="#/shop" class="link-arrow">تصفح الكل ${Icons.arrowRTL}</a>
      </div>
      <div class="product-grid" id="featured-grid">${skeletonCards(8)}</div>
    </div>
  </section>

  <section class="block block-alt">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">لقطة حلوة</span><h2>عروض الأسبوع</h2><p>خصومات حقيقية على موديلات مختارة، لفترة محدودة.</p></div>
        <a href="#/shop?sort=price-asc" class="link-arrow">شوف العروض ${Icons.arrowRTL}</a>
      </div>
      <div class="product-grid" id="deals-grid">${skeletonCards(4)}</div>
    </div>
  </section>

  <section class="block block-ink">
    <div class="container story-grid">
      <div class="story-copy">
        <span class="eyebrow" style="color:var(--gold)">قصتنا</span>
        <h2>من سوهاج لكل الجمهورية</h2>
        <p>بدأنا في سوهاج بشغف بسيط لأحذية أصلية بأسعار عادلة، ودلوقتي DEVO بقى وجهة الشباب لأحدث السنيكرز والكاجوال والصنادل. كل قطعة بنختارها بعناية، وكل طلب بنوصله بأمان لحد باب البيت.</p>
        <div class="story-stats">
          <div class="stat-box"><b>22K+</b><span>متابع</span></div>
          <div class="stat-box"><b>4.8</b><span>تقييم العملاء</span></div>
          <div class="stat-box"><b>100%</b><span>منتج أصلي</span></div>
        </div>
      </div>
      <div class="story-gallery">
        <a href="#/shop"><img src="assets/products/prod_03.jpg" alt=""></a>
        <a href="#/shop"><img src="assets/products/prod_18.jpg" alt=""></a>
        <a href="#/shop"><img src="assets/products/prod_31.jpg" alt=""></a>
      </div>
    </div>
  </section>

  <section class="block block-alt">
    <div class="container">
      <div class="section-head"><h2>آراء العملاء</h2><p>تجارب حقيقية من عملاء DEVO في سوهاج وخارجها.</p></div>
      <div class="review-track">
        ${reviewCard("أحمد سمير", "عميل من سوهاج", "الشحن وصل بسرعة والمقاس بالظبط زي ما طلبت. هرجع أطلب تاني أكيد.", 5)}
        ${reviewCard("مريم عادل", "عميلة من قنا", "الجودة فوق التوقعات، والتعامل مع الأونر محترم جدًا. شكرًا DEVO.", 5)}
        ${reviewCard("كريم فتحي", "عميل من أسوان", "أسعار مناسبة جدًا مقارنة بالجودة، وفيه تنوع كبير في الموديلات.", 4)}
      </div>
    </div>
  </section>

  <section class="block">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>مقاسك خلص؟ اطلب دلوقتي واحنا نوصلك</h2>
          <p>الدفع عند الاستلام متاح، وتوصيل لكل محافظات مصر خلال 2-5 أيام عمل.</p>
        </div>
        <a href="#/shop" class="btn btn-primary">ابدأ التسوق ${Icons.arrowRTL}</a>
      </div>
    </div>
  </section>
  `;

  const featured = DB.getFeatured(8).length ? DB.getFeatured(8) : DB.getProducts().slice(0, 8);
  document.getElementById("featured-grid").innerHTML = featured.map(productCard).join("");
  document.getElementById("deals-grid").innerHTML = DB.getDeals(4).map(productCard).join("") || `<div class="empty-state" style="grid-column:1/-1">العروض قريبًا</div>`;

}

function reviewCard(name, role, text, rating) {
  return `<div class="review-card">
    <div class="review-stars">${Array.from({ length: 5 }).map((_, i) => `<span style="opacity:${i < rating ? 1 : 0.25}">${Icons.star}</span>`).join("")}</div>
    <p>"${text}"</p>
    <div class="review-name">${name}</div>
    <div class="review-role">${role}</div>
  </div>`;
}

function categoryLinks(cats, counts) {
  return cats.map((category) => `<a class="category-drawer-link" href="#/shop?cat=${category.slug}">
    <span><b>${category.name_ar}</b><small>${category.tagline_ar || "تشكيلة مختارة"}</small></span>
    <em>${counts[category.slug] || 0}</em>
  </a>`).join("");
}

function pageCategories() {
  const cats = DB.getCategories();
  const counts = DB.countByCategory();
  $app.innerHTML = `
    <div class="page-head"><div class="container"><div class="breadcrumb"><a href="#/">الرئيسية</a> / الفئات</div><h1 class="h-display">كل الفئات</h1></div></div>
    <section class="container categories-page">
      <div class="categories-intro"><span class="eyebrow">اختار ستايلك</span><p>كل تشكيلتنا مرتبة علشان تلاقي الموديل المناسب أسرع.</p></div>
      <div class="category-directory">${cats.map((category) => `
        <a class="category-directory-item" href="#/shop?cat=${category.slug}">
          <div class="category-directory-image"><img src="${DB.getProducts({ category: category.slug })[0]?.image || "assets/logo.jpg"}" alt="${category.name_ar}"></div>
          <div><span class="eyebrow">${String(counts[category.slug] || 0).padStart(2, "0")} موديل</span><h2>${category.name_ar}</h2><p>${category.tagline_ar || "تشكيلة مختارة من DEVO"}</p></div>
          <span class="category-arrow">${Icons.arrowRTL}</span>
        </a>`).join("")}</div>
    </section>`;
}

/* ---------------------------------------------------------------------- */
/* PAGE: Shop                                                              */
/* ---------------------------------------------------------------------- */

function pageShop(params) {
  const cats = DB.getCategories();
  const bounds = DB.getPriceBounds();
  const counts = DB.countByCategory();
  const allProducts = DB.getProducts();
  const colors = [...new Set(allProducts.flatMap(productColors))].sort((a, b) => a.localeCompare(b, "ar"));
  const brands = DB.getBrands();

  const activeCat = params.get("cat") || "";
  const activeColor = params.get("color") || "";
  const activeBrand = params.get("brand") || "";
  const search = params.get("q") || "";
  const sort = params.get("sort") || "featured";
  const dealOnly = params.get("deals") === "1";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = 12;
  const maxPrice = params.get("max") ? Number(params.get("max")) : bounds.max;

  $app.innerHTML = `
  <div class="page-head">
    <div class="container">
      <div class="breadcrumb"><a href="#/">الرئيسية</a> / المتجر</div>
      <h1 class="h-display">${activeCat ? cats.find((c) => c.slug === activeCat)?.name_ar || "المتجر" : "كل المنتجات"}</h1>
    </div>
  </div>
  <div class="container" style="padding:40px 24px 80px">
    <div class="shop-layout">
      <aside class="filters">
        <h3>الفئة</h3>
        <div class="filter-group">
          <label class="f-option"><input type="radio" name="cat" value="" ${!activeCat ? "checked" : ""}> الكل <span class="count">${DB.getProducts().length}</span></label>
          ${cats
      .map(
        (c) => `<label class="f-option"><input type="radio" name="cat" value="${c.slug}" ${activeCat === c.slug ? "checked" : ""}> ${c.name_ar} <span class="count">${counts[c.slug] || 0}</span></label>`
      )
      .join("")}
        </div>
        <div class="filter-group">
          <h3>السعر</h3>
          <div class="price-slider">
            <input type="range" id="price-range" min="${bounds.min}" max="${bounds.max}" value="${maxPrice}" step="10">
            <span class="val">حتى <span id="price-val">${fmtPrice(maxPrice)}</span></span>
          </div>
        </div>
        <div class="filter-group">
          <h3>اللون</h3>
          <select class="filter-select" id="color-filter" aria-label="تصفية حسب اللون">
            <option value="">كل الألوان</option>
            ${colors.map((color) => `<option value="${color}" ${activeColor === color ? "selected" : ""}>${color}</option>`).join("")}
          </select>
        </div>
        <div class="filter-group">
          <h3>العلامة</h3>
          <select class="filter-select" id="brand-filter" aria-label="تصفية حسب العلامة">
            <option value="">كل العلامات</option>
            ${brands.map((brand) => `<option value="${brand}" ${activeBrand === brand ? "selected" : ""}>${brand}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-outline btn-block btn-sm" id="reset-filters">إعادة تعيين</button>
      </aside>

      <div>
        <div class="shop-toolbar">
          <span class="result-count" id="result-count">جارِ التحميل...</span>
          <div class="deal-filters" aria-label="نوع المنتجات">
            <a class="deal-filter ${!dealOnly ? "active" : ""}" href="#/shop">كل المنتجات</a>
            <a class="deal-filter ${dealOnly ? "active" : ""}" href="#/shop?deals=1">العروض فقط</a>
          </div>
          <select id="sort-select">
            <option value="featured" ${sort === "featured" ? "selected" : ""}>الأكثر تميزًا</option>
            <option value="new" ${sort === "new" ? "selected" : ""}>الأحدث</option>
            <option value="price-asc" ${sort === "price-asc" ? "selected" : ""}>السعر: من الأقل للأعلى</option>
            <option value="price-desc" ${sort === "price-desc" ? "selected" : ""}>السعر: من الأعلى للأقل</option>
            <option value="rating" ${sort === "rating" ? "selected" : ""}>الأعلى تقييمًا</option>
          </select>
        </div>
        <div class="product-grid" id="shop-grid">${skeletonCards(8)}</div>
        <nav class="pagination" id="pagination" aria-label="صفحات المنتجات"></nav>
      </div>
    </div>
  </div>
  `;

  function refresh() {
    const cat = document.querySelector('input[name="cat"]:checked')?.value || "";
    const color = document.getElementById("color-filter").value;
    const brand = document.getElementById("brand-filter").value;
    const sortVal = document.getElementById("sort-select").value;
    const max = document.getElementById("price-range").value;
    document.getElementById("price-val").textContent = fmtPrice(max);

    let items = DB.getProducts({
      category: cat || null,
      color: color || null,
      brand: brand || null,
      search,
      sort: sortVal,
      maxPrice: Number(max),
    });
    if (dealOnly) items = items.filter((item) => item.old_price);

    document.getElementById("result-count").textContent = `${items.length} منتج`;
    const grid = document.getElementById("shop-grid");
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visibleItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    grid.innerHTML =
      visibleItems.length > 0
        ? visibleItems.map(productCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1">${Icons.box}<h3>مفيش نتائج مطابقة</h3><p>جرّب تغيير الفلاتر أو ابحث بكلمة تانية.</p></div>`;

    document.getElementById("pagination").innerHTML = pageCount > 1
      ? Array.from({ length: pageCount }, (_, index) => `<a class="page-number ${index + 1 === currentPage ? "active" : ""}" href="#/shop?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(window.location.hash.split("?")[1] || "")), page: String(index + 1) })}">${index + 1}</a>`).join("")
      : "";

    // Reflect state in URL without full reload
    const qp = new URLSearchParams();
    if (cat) qp.set("cat", cat);
    if (color) qp.set("color", color);
    if (brand) qp.set("brand", brand);
    if (search) qp.set("q", search);
    if (sortVal !== "featured") qp.set("sort", sortVal);
    if (dealOnly) qp.set("deals", "1");
    if (Number(max) !== bounds.max) qp.set("max", max);
    if (currentPage > 1) qp.set("page", String(currentPage));
    const newHash = `#/shop${qp.toString() ? "?" + qp.toString() : ""}`;
    history.replaceState(null, "", newHash);
  }

  document.querySelectorAll('input[name="cat"]').forEach((r) => r.addEventListener("change", refresh));
  document.getElementById("sort-select").addEventListener("change", refresh);
  document.getElementById("color-filter").addEventListener("change", refresh);
  document.getElementById("brand-filter").addEventListener("change", refresh);
  document.getElementById("price-range").addEventListener("input", refresh);
  document.getElementById("reset-filters").addEventListener("click", () => {
    navigate("/shop");
    setTimeout(() => pageShop(new URLSearchParams()), 0);
  });

  refresh();
}

/* ---------------------------------------------------------------------- */
/* PAGE: Product detail                                                    */
/* ---------------------------------------------------------------------- */

function pageProduct(id) {
  const p = DB.getProductById(id);
  if (!p) {
    $app.innerHTML = `<div class="empty-state">${Icons.box}<h3>المنتج غير موجود</h3><a href="#/shop" class="btn btn-gold" style="margin-top:16px">الرجوع للمتجر</a></div>`;
    return;
  }
  const sizes = p.sizes.split(",");
  const colors = productColors(p);
  const colorMap = productColorImages(p);
  const allImages = allProductImages(p);
  const related = DB.getRelated(p, 4);
  let selectedSize = sizes[Math.floor(sizes.length / 2)];

  $app.innerHTML = `
  <div class="page-head">
    <div class="container">
      <div class="breadcrumb"><a href="#/">الرئيسية</a> / <a href="#/shop?cat=${p.cat_slug}">${p.cat_name}</a> / ${p.name_ar}</div>
    </div>
  </div>
  <div class="container pd-grid">
    <div>
      <div class="pd-gallery-main"><img id="pd-main-img" src="${p.image}" alt="${p.name_ar}"></div>
      <div class="pd-thumbs">
        ${allImages.map((image, index) => `
          <button class="pd-thumb ${index === 0 ? "active" : ""}" data-src="${image}">
            <img src="${image}" alt="${p.name_ar}">
          </button>
        `).join("")}
      </div>
    </div>
    <div>
      <span class="pd-cat">${p.cat_name}</span>
      <h1 class="pd-title h-display">${p.name_ar}</h1>
      <div class="pd-rating">
        <span class="stars">${starsHTML(p.rating)}</span>
        <span>${p.rating} · ${p.reviews} تقييم</span>
      </div>
      <div class="pd-price-row">
        <span class="pd-price">${fmtPrice(p.price)}</span>
        ${p.old_price ? `<span class="pd-price-old">${fmtPrice(p.old_price)}</span><span class="pd-save">وفّر ${Math.round(100 - (p.price / p.old_price) * 100)}%</span>` : ""}
      </div>
      <p class="pd-desc">${p.description_ar}</p>

      ${colors.length ? `
        <div class="pd-colors">
          <div class="pd-block-label">
            <span>اختر اللون</span>
            <span id="selected-color">${colors[0]}</span>
          </div>
          <div class="color-options" id="color-options">
            ${colors.map((color, index) => `
              <button class="color-option ${index === 0 ? "active" : ""}" data-color="${color.trim()}" title="${color.trim()}" aria-label="${color.trim()}" style="--swatch:${colorKey(color)}"></button>
            `).join("")}
          </div>
        </div>` : ""
      }

      <div class="pd-block-label"><span>اختر المقاس</span><span style="color:var(--mist);font-weight:600">دليل المقاسات</span></div>
      <div class="size-grid" id="size-grid">
        ${sizes.map((s) => `<button class="size-box ${s === selectedSize ? "active" : ""}" data-size="${s}">${s}</button>`).join("")}
      </div>

      <div class="pd-actions">
        <button class="btn btn-primary" id="add-to-cart-btn">${Icons.cart} أضف للسلة — ${fmtPrice(p.price)}</button>
        <button class="icon-btn js-wish" data-id="${p.id}" style="border:2px solid var(--ink-line);width:54px;height:54px">${Cart.isWishlisted(p.id) ? Icons.heartFill : Icons.heart}</button>
      </div>

      <ul class="pd-meta-list">
        <li>${Icons.truck} توصيل خلال 2-5 أيام عمل لكل المحافظات</li>
        <li>${Icons.cash} الدفع عند الاستلام متاح</li>
        <li>${Icons.shieldCheck} منتج أصلي 100% ${p.stock > 0 ? `· متبقي ${p.stock} قطعة` : ""}</li>
      </ul>
    </div>
  </div>

  ${related.length
      ? `<div class="container related-row block">
    <div class="section-head"><h2>منتجات مشابهة</h2></div>
    <div class="product-grid">${related.map(productCard).join("")}</div>
  </div>`
      : ""
    }
  `;

  document.querySelectorAll(".size-box").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-box").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = btn.dataset.size;
    });
  });

  document.querySelectorAll(".color-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.color;
      document.querySelectorAll(".color-option").forEach((option) => option.classList.toggle("active", option === btn));
      document.getElementById("selected-color").textContent = selected;
      const targetImg = imageForColor(p, selected);
      document.getElementById("pd-main-img").src = targetImg;
      document.querySelectorAll(".pd-thumb").forEach((thumb) => {
        thumb.classList.toggle("active", thumb.dataset.src === targetImg);
      });
    });
  });

  document.querySelectorAll(".pd-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const src = thumb.dataset.src;
      document.getElementById("pd-main-img").src = src;
      document.querySelectorAll(".pd-thumb").forEach((item) => item.classList.toggle("active", item === thumb));
      
      // Match color option if exists
      for (const col of colors) {
        if (imageForColor(p, col) === src) {
          document.querySelectorAll(".color-option").forEach((opt) => {
            opt.classList.toggle("active", opt.dataset.color === col);
          });
          const selText = document.getElementById("selected-color");
          if (selText) selText.textContent = col;
          break;
        }
      }
    });
  });

  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    Cart.add(p, selectedSize, 1);
    toast(`تمت إضافة ${p.name_ar} (مقاس ${selectedSize}) للسلة`, "cart");
    openCartDrawer();
  });
}

/* ---------------------------------------------------------------------- */
/* PAGE: About                                                             */
/* ---------------------------------------------------------------------- */

function pageAbout() {
  $app.innerHTML = `
  <div class="page-head">
    <div class="container">
      <div class="breadcrumb"><a href="#/">الرئيسية</a> / من نحن</div>
      <h1 class="h-display">قصة DEVO</h1>
    </div>
  </div>
  <div class="container about-grid">
    <div class="about-media">
      <a href="#"><img src="assets/products/prod_09.jpg" alt=""></a>
      <a href="#"><img src="assets/products/prod_20.jpg" alt=""></a>
      <a href="#"><img src="assets/products/prod_41.jpg" alt=""></a>
    </div>
    <div>
      <span class="eyebrow">من سوهاج، لكل مصر</span>
      <h2 style="font-size:32px;margin:14px 0">إحنا مش مجرد محل أحذية</h2>
      <p style="color:var(--mist);line-height:1.9;font-size:15.5px;margin-bottom:16px">
        DEVO Store بدأت في سوهاج كمشروع بسيط بيهتم باختيار أحذية أصلية بجودة عالية وأسعار عادلة.
        دلوقتي بقينا من أكبر وجهات السنيكرز والكاجوال والصنادل في سوهاج، وبنوصل طلبات لكل محافظات الجمهورية.
      </p>
      <p style="color:var(--mist);line-height:1.9;font-size:15.5px;margin-bottom:26px">
        بنؤمن إن كل زبون يستاهل يحس إنه لابس حاجة أصلية ومختارة بعناية، من غير ما يدفع فلوس زيادة.
      </p>
      <a href="#/shop" class="btn btn-gold">شوف تشكيلتنا ${Icons.arrowRTL}</a>
    </div>
  </div>

  <div class="container" style="padding-bottom:70px">
    <div class="contact-cards">
      <div class="contact-card">${Icons.pin}<h4>الفرع</h4><p>${STORE.address}</p></div>
      <div class="contact-card">${Icons.phone}<h4>اتصل بينا</h4><p dir="ltr">${STORE.phone}</p></div>
      <div class="contact-card">${Icons.clock}<h4>مواعيد العمل</h4><p>يوميًا 11 ص - 11 م</p></div>
    </div>
  </div>

  <div class="container" style="padding-bottom:80px">
    <a class="map-frame" style="display:flex;align-items:center;justify-content:center;background:var(--cream);flex-direction:column;gap:10px;color:var(--ink-soft)"
       href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Devo Store, Sohag, Egypt")}" target="_blank" rel="noopener">
      ${Icons.pin}
      <b>افتح الموقع على خرائط جوجل</b>
    </a>
  </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* PAGE: Local admin                                                       */
/* ---------------------------------------------------------------------- */

/* ---------------------------------------------------------------------- */
/* PAGE: Modern Managerial Admin Dashboard                                 */
/* ---------------------------------------------------------------------- */

const adminState = {
  activeTab: "overview", // 'overview' | 'products' | 'orders' | 'categories' | 'system'
  productSearch: "",
  productCategory: "all",
  productStock: "all", // 'all' | 'ok' | 'low' | 'out'
  productSort: "new",
  productsPage: 1,
  productsPerPage: 10,
  orderStatus: "all",
  orderSearch: "",
  ordersPage: 1,
  ordersPerPage: 10,
};

function pageAdmin() {
  if (sessionStorage.getItem("devo_admin") !== "1") {
    renderAdminLogin();
    return;
  }

  const categories = DB.getCategories();
  const products = DB.getProducts({ sort: "new" });
  const orders = DB.getOrders();

  // Metrics calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "قيد المراجعة");
  const confirmedOrders = orders.filter((o) => o.status === "تم التأكيد");
  const deliveredOrders = orders.filter((o) => o.status === "تم التسليم");
  const lowStockProducts = products.filter((p) => Number(p.stock) <= 3 && Number(p.stock) > 0);
  const outOfStockProducts = products.filter((p) => Number(p.stock) === 0);
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  $app.innerHTML = `
    <div class="container admin-page">
      <!-- Admin Top Bar -->
      <header class="admin-top-bar">
        <div class="admin-brand-info">
          <div class="admin-brand-logo">D</div>
          <div class="admin-brand-text">
            <h1>لوحة الإدارة والإشراف — DEVO</h1>
            <span><span class="admin-status-dot"></span> قاعدة البيانات نشطة ومحدثة محلياً</span>
          </div>
        </div>
        <div class="admin-top-actions">
          <a href="#/" class="btn btn-outline btn-sm">${Icons.eye} معاينة المتجر</a>
          <button class="btn btn-outline btn-sm" id="admin-logout-btn">${Icons.logout} خروج</button>
        </div>
      </header>

      <!-- Tab Navigation -->
      <nav class="admin-nav-tabs" aria-label="أقسام الإدارة">
        <button class="admin-nav-tab ${adminState.activeTab === "overview" ? "active" : ""}" data-tab="overview">
          ${Icons.dashboard} نظرة عامة والتحليلات
        </button>
        <button class="admin-nav-tab ${adminState.activeTab === "products" ? "active" : ""}" data-tab="products">
          ${Icons.package} إدارة المنتجات
          <span class="admin-tab-badge">${products.length}</span>
          ${(lowStockProducts.length + outOfStockProducts.length) > 0 ? `<span class="admin-tab-badge badge-alert" title="تنبيهات مخزون">${lowStockProducts.length + outOfStockProducts.length}</span>` : ""}
        </button>
        <button class="admin-nav-tab ${adminState.activeTab === "orders" ? "active" : ""}" data-tab="orders">
          ${Icons.orders} إدارة الطلبات
          <span class="admin-tab-badge">${orders.length}</span>
          ${pendingOrders.length > 0 ? `<span class="admin-tab-badge badge-alert" title="طلبات بانتظار المراجعة">${pendingOrders.length}</span>` : ""}
        </button>
        <button class="admin-nav-tab ${adminState.activeTab === "categories" ? "active" : ""}" data-tab="categories">
          ${Icons.layers} الأقسام والفئات
          <span class="admin-tab-badge">${categories.length}</span>
        </button>
        <button class="admin-nav-tab ${adminState.activeTab === "system" ? "active" : ""}" data-tab="system">
          ${Icons.settings} معلومات النظام
        </button>
      </nav>

      <!-- Main Active Tab Content -->
      <main id="admin-tab-content">
        ${renderActiveAdminTab({ categories, products, orders, totalRevenue, pendingOrders, confirmedOrders, deliveredOrders, lowStockProducts, outOfStockProducts, avgOrderValue })}
      </main>

      <!-- Dynamic Modal Container -->
      <div id="admin-modal-root"></div>
    </div>
  `;

  // Attach Top Bar & Tab Events
  document.getElementById("admin-logout-btn")?.addEventListener("click", () => {
    sessionStorage.removeItem("devo_admin");
    pageAdmin();
  });

  document.querySelectorAll(".admin-nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      adminState.activeTab = btn.dataset.tab;
      pageAdmin();
    });
  });

  // Attach tab specific listeners
  attachAdminTabEvents({ categories, products, orders });
}

/* ---------------------------------------------------------------------- */
/* Admin Login View                                                       */
/* ---------------------------------------------------------------------- */

function renderAdminLogin() {
  $app.innerHTML = `
    <div class="admin-login-screen">
      <div class="admin-login-card">
        <div class="admin-login-header">
          <div class="admin-login-icon">${Icons.dashboard}</div>
          <span class="eyebrow">DEVO Store Manager</span>
          <h1>دخول الإدارة</h1>
          <p>لوحة التحكم المركزية لإدارة المنتجات، المخزون، والطلبات.</p>
          <div class="admin-login-demo-chip" id="demo-login-chip" title="انقر لتعبئة بيانات الدخول تلقائياً">
            ⚡ حساب تجريبي سريع: <b>admin / devo2026</b>
          </div>
        </div>

        <form class="form-card" id="admin-login-form" style="border:none; padding:0; box-shadow:none;">
          <div class="form-row">
            <label>اسم المستخدم</label>
            <input name="username" id="login-username" autocomplete="username" placeholder="admin" required>
          </div>
          <div class="form-row">
            <label>كلمة المرور</label>
            <div class="admin-password-wrap">
              <input name="password" id="login-password" type="password" autocomplete="current-password" placeholder="••••••••" required>
              <button type="button" class="admin-password-toggle" id="toggle-password" aria-label="إظهار كلمة المرور">
                ${Icons.eye}
              </button>
            </div>
          </div>
          <div class="admin-login-error" id="admin-login-error">اسم المستخدم أو كلمة المرور غير صحيحة</div>
          <button class="btn btn-primary btn-block" style="margin-top:10px;">تسجيل الدخول للوحة التحكم</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById("admin-login-form");
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const togglePassBtn = document.getElementById("toggle-password");
  const errorMsg = document.getElementById("admin-login-error");
  const demoChip = document.getElementById("demo-login-chip");

  demoChip?.addEventListener("click", () => {
    usernameInput.value = "admin";
    passwordInput.value = "devo2026";
    toast("تم ملء بيانات الدخول التجريبية", "check");
  });

  togglePassBtn?.addEventListener("click", () => {
    const isPass = passwordInput.type === "password";
    passwordInput.type = isPass ? "text" : "password";
    togglePassBtn.innerHTML = isPass ? Icons.eyeOff : Icons.eye;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = usernameInput.value.trim();
    const p = passwordInput.value;
    if (u === "admin" && p === "devo2026") {
      sessionStorage.setItem("devo_admin", "1");
      pageAdmin();
      toast("تم تسجيل الدخول بنجاح. أهلاً بك!", "check");
    } else {
      errorMsg.classList.add("show");
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 400);
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Admin Active Tab Router                                                */
/* ---------------------------------------------------------------------- */

function renderActiveAdminTab(data) {
  switch (adminState.activeTab) {
    case "overview":
      return renderAdminOverview(data);
    case "products":
      return renderAdminProducts(data);
    case "orders":
      return renderAdminOrders(data);
    case "categories":
      return renderAdminCategories(data);
    case "system":
      return renderAdminSystem(data);
    default:
      return renderAdminOverview(data);
  }
}

/* ---------------------------------------------------------------------- */
/* TAB 1: Overview & Analytics                                            */
/* ---------------------------------------------------------------------- */

function renderAdminOverview({ categories, products, orders, totalRevenue, pendingOrders, confirmedOrders, deliveredOrders, lowStockProducts, outOfStockProducts, avgOrderValue }) {
  const cancelledOrders = orders.filter((o) => o.status === "ملغي");
  const shippedOrders = orders.filter((o) => o.status === "تم الشحن");
  const totalOrdersCount = orders.length || 1;

  const pctPending = Math.round((pendingOrders.length / totalOrdersCount) * 100);
  const pctConfirmed = Math.round((confirmedOrders.length / totalOrdersCount) * 100);
  const pctShipped = Math.round((shippedOrders.length / totalOrdersCount) * 100);
  const pctDelivered = Math.round((deliveredOrders.length / totalOrdersCount) * 100);
  const pctCancelled = Math.round((cancelledOrders.length / totalOrdersCount) * 100);

  const recentOrders = orders.slice(0, 5);

  return `
    <!-- Executive KPI Cards -->
    <div class="admin-kpis">
      <div class="admin-kpi-card kpi-accent">
        <div class="admin-kpi-header">
          <span class="admin-kpi-title">إجمالي المبيعات</span>
          <div class="admin-kpi-icon">${Icons.cash}</div>
        </div>
        <div class="admin-kpi-value">${fmtPrice(totalRevenue)}</div>
        <div class="admin-kpi-meta">
          <span>متوسط قيمة الطلب: <b>${fmtPrice(avgOrderValue)}</b></span>
        </div>
      </div>

      <div class="admin-kpi-card">
        <div class="admin-kpi-header">
          <span class="admin-kpi-title">إجمالي الطلبات</span>
          <div class="admin-kpi-icon">${Icons.orders}</div>
        </div>
        <div class="admin-kpi-value">${orders.length} <small style="font-size:14px; font-weight:normal;">طلب</small></div>
        <div class="admin-kpi-meta">
          ${pendingOrders.length > 0 ? `<span style="color:#B45309; font-weight:700;">⚠️ ${pendingOrders.length} طلب بانتظار المراجعة</span>` : `<span style="color:#065F46;">✓ تم التعامل مع جميع الطلبات</span>`}
        </div>
      </div>

      <div class="admin-kpi-card">
        <div class="admin-kpi-header">
          <span class="admin-kpi-title">المنتجات والمخزون</span>
          <div class="admin-kpi-icon">${Icons.package}</div>
        </div>
        <div class="admin-kpi-value">${products.length} <small style="font-size:14px; font-weight:normal;">منتج</small></div>
        <div class="admin-kpi-meta">
          ${(lowStockProducts.length + outOfStockProducts.length) > 0 ? `<span style="color:#B45309; font-weight:700;">⚠️ ${lowStockProducts.length + outOfStockProducts.length} منتج يحتاج تزويد المخزون</span>` : `<span style="color:#065F46;">✓ المخزون بحالة ممتازة</span>`}
        </div>
      </div>

      <div class="admin-kpi-card">
        <div class="admin-kpi-header">
          <span class="admin-kpi-title">الفئات النشطة</span>
          <div class="admin-kpi-icon">${Icons.layers}</div>
        </div>
        <div class="admin-kpi-value">${categories.length} <small style="font-size:14px; font-weight:normal;">فئة</small></div>
        <div class="admin-kpi-meta">
          <span>موزعة عبر المتجر والقائمة</span>
        </div>
      </div>
    </div>

    <!-- 2 Column Overview Layout -->
    <div class="admin-grid-2">
      <!-- Right: Orders Status Breakdown & Recent Orders -->
      <div class="admin-card">
        <div class="admin-card-head">
          <h3>${Icons.trendUp} توزيع حالات الطلبات</h3>
          <button class="btn btn-outline btn-sm js-goto-tab" data-tab="orders">عرض جميع الطلبات ←</button>
        </div>

        <!-- Segmented Distribution Bar -->
        <div class="admin-dist-bar">
          <div class="admin-dist-segment status-bg-pending" style="width: ${pctPending}%" title="قيد المراجعة (${pendingOrders.length})"></div>
          <div class="admin-dist-segment status-bg-confirmed" style="width: ${pctConfirmed}%" title="تم التأكيد (${confirmedOrders.length})"></div>
          <div class="admin-dist-segment status-bg-shipped" style="width: ${pctShipped}%" title="تم الشحن (${shippedOrders.length})"></div>
          <div class="admin-dist-segment status-bg-delivered" style="width: ${pctDelivered}%" title="تم التسليم (${deliveredOrders.length})"></div>
          <div class="admin-dist-segment status-bg-cancelled" style="width: ${pctCancelled}%" title="ملغي (${cancelledOrders.length})"></div>
        </div>

        <div class="admin-dist-legend">
          <div class="admin-dist-item"><span class="admin-dist-dot status-bg-pending"></span> قيد المراجعة (${pendingOrders.length})</div>
          <div class="admin-dist-item"><span class="admin-dist-dot status-bg-confirmed"></span> تم التأكيد (${confirmedOrders.length})</div>
          <div class="admin-dist-item"><span class="admin-dist-dot status-bg-shipped"></span> تم الشحن (${shippedOrders.length})</div>
          <div class="admin-dist-item"><span class="admin-dist-dot status-bg-delivered"></span> تم التسليم (${deliveredOrders.length})</div>
          <div class="admin-dist-item"><span class="admin-dist-dot status-bg-cancelled"></span> ملغي (${cancelledOrders.length})</div>
        </div>

        <div style="margin-top: 24px;">
          <h4 style="font:800 15px var(--f-display); margin-bottom:12px;">أحدث الطلبات المستلمة</h4>
          ${recentOrders.length ? `
            <div class="admin-table-container">
              <table class="admin-pro-table">
                <thead>
                  <tr>
                    <th>الطلب</th>
                    <th>العميل</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentOrders.map((order) => `
                    <tr>
                      <td><b>#${order.id}</b></td>
                      <td>${order.customer_name} <small style="display:block; color:var(--mist);">${order.city || ""}</small></td>
                      <td><b>${fmtPrice(order.total)}</b></td>
                      <td>
                        <select class="admin-select order-status-select" data-id="${order.id}">
                          <option value="قيد المراجعة" ${order.status === "قيد المراجعة" ? "selected" : ""}>قيد المراجعة</option>
                          <option value="تم التأكيد" ${order.status === "تم التأكيد" ? "selected" : ""}>تم التأكيد</option>
                          <option value="تم الشحن" ${order.status === "تم الشحن" ? "selected" : ""}>تم الشحن</option>
                          <option value="تم التسليم" ${order.status === "تم التسليم" ? "selected" : ""}>تم التسليم</option>
                          <option value="ملغي" ${order.status === "ملغي" ? "selected" : ""}>ملغي</option>
                        </select>
                      </td>
                      <td>
                        <button class="btn btn-outline btn-sm js-goto-tab" data-tab="orders">تفاصيل</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : `<p style="color:var(--mist); padding:16px 0;">لا توجد طلبات بعد.</p>`}
        </div>
      </div>

      <!-- Left: Stock Warnings & Quick Actions -->
      <div class="admin-card">
        <div class="admin-card-head">
          <h3>${Icons.alertCircle} تنبيهات المخزون الحرجة</h3>
          <span class="stock-badge ${lowStockProducts.length + outOfStockProducts.length > 0 ? "stock-low" : "stock-ok"}">
            ${lowStockProducts.length + outOfStockProducts.length} منتجات
          </span>
        </div>

        <div class="admin-alert-list">
          ${[...outOfStockProducts, ...lowStockProducts].length ? [...outOfStockProducts, ...lowStockProducts].slice(0, 6).map((p) => `
            <div class="admin-alert-item">
              <div class="admin-alert-info">
                <img src="${p.image}" alt="">
                <div>
                  <b>${p.name_ar}</b>
                  <span>${p.stock === 0 ? "نفد من المخزون تماماً (0)" : `متبقي ${p.stock} قطع فقط`}</span>
                </div>
              </div>
              <div class="quick-stock-stepper">
                <button type="button" class="js-quick-stock" data-id="${p.id}" data-delta="1" title="إضافة 1 للمخزون">+</button>
                <span>${p.stock}</span>
                <button type="button" class="js-quick-stock" data-id="${p.id}" data-delta="-1" title="خصم 1 من المخزون">-</button>
              </div>
            </div>
          `).join("") : `
            <div style="text-align:center; padding:30px 10px; color:var(--mist);">
              <div style="font-size:24px; margin-bottom:6px;">🎉</div>
              <b>المخزون متوفر بالكامل</b>
              <p style="font-size:12px; margin:4px 0 0;">لا توجد منتجات منخفضة المخزون حالياً.</p>
            </div>
          `}
        </div>

        <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--ink-line);">
          <h4 style="font:800 14px var(--f-utility); margin-bottom:10px;">إجراءات إدارية سريعة</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <button class="btn btn-primary btn-block btn-sm" id="btn-quick-add-product">+ إضافة منتج جديد</button>
            <button class="btn btn-outline btn-block btn-sm" id="btn-quick-add-category">+ إضافة قسم/فئة جديدة</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* TAB 2: Products Management                                             */
/* ---------------------------------------------------------------------- */

function renderAdminProducts({ categories, products }) {
  let filtered = [...products];

  // Search filter
  if (adminState.productSearch) {
    const q = adminState.productSearch.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name_ar.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.colors && p.colors.toLowerCase().includes(q)) ||
      (p.sizes && p.sizes.includes(q))
    );
  }

  // Category filter
  if (adminState.productCategory !== "all") {
    filtered = filtered.filter((p) => String(p.category_id) === String(adminState.productCategory));
  }

  // Stock filter
  if (adminState.productStock === "low") {
    filtered = filtered.filter((p) => Number(p.stock) <= 3 && Number(p.stock) > 0);
  } else if (adminState.productStock === "out") {
    filtered = filtered.filter((p) => Number(p.stock) === 0);
  } else if (adminState.productStock === "ok") {
    filtered = filtered.filter((p) => Number(p.stock) > 3);
  }

  // Sort
  if (adminState.productSort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (adminState.productSort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (adminState.productSort === "stock-asc") filtered.sort((a, b) => a.stock - b.stock);
  else if (adminState.productSort === "stock-desc") filtered.sort((a, b) => b.stock - a.stock);
  else filtered.sort((a, b) => b.id - a.id);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / adminState.productsPerPage));
  if (adminState.productsPage > totalPages) adminState.productsPage = totalPages;
  if (adminState.productsPage < 1) adminState.productsPage = 1;

  const startIndex = (adminState.productsPage - 1) * adminState.productsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + adminState.productsPerPage);

  return `
    <div class="admin-card">
      <div class="admin-toolbar-row">
        <!-- Search Input -->
        <div class="admin-search-box">
          ${Icons.search}
          <input type="search" id="admin-prod-search-input" value="${adminState.productSearch}" placeholder="ابحث بالاسم، الماركة، الألوان أو المقاسات...">
        </div>

        <!-- Filters -->
        <div class="admin-filters">
          <select class="admin-select" id="admin-prod-cat-filter">
            <option value="all">كل الفئات (${categories.length})</option>
            ${categories.map((c) => `<option value="${c.id}" ${adminState.productCategory === String(c.id) ? "selected" : ""}>${c.name_ar}</option>`).join("")}
          </select>

          <select class="admin-select" id="admin-prod-stock-filter">
            <option value="all" ${adminState.productStock === "all" ? "selected" : ""}>كل حالات المخزون</option>
            <option value="ok" ${adminState.productStock === "ok" ? "selected" : ""}>متوفر (> 3)</option>
            <option value="low" ${adminState.productStock === "low" ? "selected" : ""}>مخزون منخفض (1-3)</option>
            <option value="out" ${adminState.productStock === "out" ? "selected" : ""}>نفد من المخزون (0)</option>
          </select>

          <select class="admin-select" id="admin-prod-sort-filter">
            <option value="new" ${adminState.productSort === "new" ? "selected" : ""}>الأحدث أولاً</option>
            <option value="price-desc" ${adminState.productSort === "price-desc" ? "selected" : ""}>السعر: من الأعلى</option>
            <option value="price-asc" ${adminState.productSort === "price-asc" ? "selected" : ""}>السعر: من الأقل</option>
            <option value="stock-asc" ${adminState.productSort === "stock-asc" ? "selected" : ""}>المخزون: من الأقل</option>
            <option value="stock-desc" ${adminState.productSort === "stock-desc" ? "selected" : ""}>المخزون: من الأعلى</option>
          </select>

          <button class="btn btn-primary" id="btn-add-new-product">+ إضافة منتج جديد</button>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:12px; color:var(--mist);">
        <span>عرض <b>${filtered.length ? startIndex + 1 : 0} - ${Math.min(startIndex + adminState.productsPerPage, filtered.length)}</b> من أصل <b>${filtered.length}</b> منتج</span>
        ${(adminState.productSearch || adminState.productCategory !== "all" || adminState.productStock !== "all") ? `<button class="btn btn-outline btn-sm" id="btn-reset-prod-filters">إلغاء الفلاتر</button>` : ""}
      </div>

      <!-- Products Table -->
      <div class="admin-table-container">
        <table class="admin-pro-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الفئة</th>
              <th>السعر</th>
              <th>المخزون والتحكم السريع</th>
              <th>المقاسات</th>
              <th>الألوان</th>
              <th style="text-align:end;">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.length ? pageItems.map((p) => {
              const discount = p.old_price ? Math.round(100 - (p.price / p.old_price) * 100) : 0;
              const stockClass = p.stock === 0 ? "stock-out" : (p.stock <= 3 ? "stock-low" : "stock-ok");
              const stockText = p.stock === 0 ? "نفد" : (p.stock <= 3 ? `منخفض (${p.stock})` : `متوفر (${p.stock})`);
              const pColors = productColors(p);

              return `
                <tr>
                  <td>
                    <div class="admin-prod-cell">
                      <img class="admin-prod-thumb" src="${p.image}" alt="">
                      <div class="admin-prod-details">
                        <b>${p.name_ar}</b>
                        <span>${p.brand || "DEVO"} · #${p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="stock-badge" style="background:var(--cream); color:var(--ink);">${p.cat_name || "غير محدد"}</span></td>
                  <td>
                    <b>${fmtPrice(p.price)}</b>
                    ${p.old_price ? `<small style="display:block; text-decoration:line-through; color:var(--mist);">${fmtPrice(p.old_price)}</small><span class="stock-badge stock-low" style="font-size:10px;">-${discount}%</span>` : ""}
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span class="stock-badge ${stockClass}">${stockText}</span>
                      <div class="quick-stock-stepper">
                        <button type="button" class="js-quick-stock" data-id="${p.id}" data-delta="1" title="إضافة 1">+</button>
                        <span>${p.stock}</span>
                        <button type="button" class="js-quick-stock" data-id="${p.id}" data-delta="-1" title="خصم 1">-</button>
                      </div>
                    </div>
                  </td>
                  <td><small style="color:var(--ink);">${p.sizes || "—"}</small></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                      ${pColors.map((c) => `<span class="card-color" title="${c}" style="--swatch:${colorKey(c)}; width:18px; height:18px;"></span>`).join("")}
                      <small style="font-size:11px; color:var(--mist);">${pColors.length} لون</small>
                    </div>
                  </td>
                  <td style="text-align:end;">
                    <div style="display:inline-flex; gap:6px;">
                      <button class="btn btn-outline btn-sm js-edit-product" data-id="${p.id}" title="تعديل المنتج">${Icons.edit} تعديل</button>
                      <button class="btn btn-outline btn-sm js-delete-product" data-id="${p.id}" style="color:var(--flame); border-color:rgba(232,67,44,0.3);" title="حذف">${Icons.trash}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("") : `
              <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:var(--mist);">
                  لا توجد منتجات مطابقة لخيارات البحث والفلاتر الحالية.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- Pagination for Products -->
      ${totalPages > 1 ? `
        <div class="admin-pagination">
          <div class="admin-pagination-info">
            صفحة <b>${adminState.productsPage}</b> من <b>${totalPages}</b>
          </div>
          <div class="admin-pagination-btns">
            <button class="admin-page-btn js-prod-page-btn" data-page="${adminState.productsPage - 1}" ${adminState.productsPage <= 1 ? "disabled" : ""}>السابق</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => `
              <button class="admin-page-btn js-prod-page-btn ${pg === adminState.productsPage ? "active" : ""}" data-page="${pg}">${pg}</button>
            `).join("")}
            <button class="admin-page-btn js-prod-page-btn" data-page="${adminState.productsPage + 1}" ${adminState.productsPage >= totalPages ? "disabled" : ""}>التالي</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* TAB 3: Orders Management                                               */
/* ---------------------------------------------------------------------- */

function renderAdminOrders({ orders }) {
  let filtered = [...orders];

  // Status Filter
  if (adminState.orderStatus !== "all") {
    filtered = filtered.filter((o) => o.status === adminState.orderStatus);
  }

  // Search Filter
  if (adminState.orderSearch) {
    const q = adminState.orderSearch.toLowerCase();
    filtered = filtered.filter((o) =>
      String(o.id).includes(q) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q)) ||
      (o.city && o.city.toLowerCase().includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q))
    );
  }

  const filteredTotal = filtered.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const statuses = ["all", "قيد المراجعة", "تم التأكيد", "تم الشحن", "تم التسليم", "ملغي"];

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / adminState.ordersPerPage));
  if (adminState.ordersPage > totalPages) adminState.ordersPage = totalPages;
  if (adminState.ordersPage < 1) adminState.ordersPage = 1;

  const startIndex = (adminState.ordersPage - 1) * adminState.ordersPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + adminState.ordersPerPage);

  return `
    <div class="admin-card">
      <div class="admin-toolbar-row">
        <!-- Search Input -->
        <div class="admin-search-box">
          ${Icons.search}
          <input type="search" id="admin-order-search-input" value="${adminState.orderSearch}" placeholder="ابحث برقم الطلب #، اسم العميل، الهاتف، أو المدينة...">
        </div>

        <div style="font:800 14px var(--f-utility); color:var(--ink);">
          مجموع الطلبات المحددة: <b style="color:var(--gold-deep); font-size:18px;">${fmtPrice(filteredTotal)}</b> (${filtered.length} طلب)
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="admin-nav-tabs" style="margin-bottom:20px; background:var(--white);">
        ${statuses.map((st) => {
          const count = st === "all" ? orders.length : orders.filter((o) => o.status === st).length;
          const label = st === "all" ? "كل الطلبات" : st;
          return `
            <button class="admin-nav-tab js-order-status-tab ${adminState.orderStatus === st ? "active" : ""}" data-status="${st}">
              ${label} <span class="admin-tab-badge">${count}</span>
            </button>
          `;
        }).join("")}
      </div>

      <!-- Orders List Cards -->
      <div class="admin-orders-grid">
        ${pageItems.length ? pageItems.map((order) => {
          let items = [];
          try { items = JSON.parse(order.items_json || "[]"); } catch (e) { items = []; }

          const cleanPhone = (order.phone || "").replace(/[^0-9]/g, "");
          const intlPhone = cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone;
          const waMsg = encodeURIComponent(`مرحباً أستاذ ${order.customer_name}، نتواصل معك من متجر DEVO بخصوص طلبك رقم #${order.id} بقيمة ${fmtPrice(order.total)}.`);
          const waUrl = `https://wa.me/${intlPhone}?text=${waMsg}`;

          let statusClass = "status-pending";
          if (order.status === "تم التأكيد") statusClass = "status-confirmed";
          else if (order.status === "تم الشحن") statusClass = "status-shipped";
          else if (order.status === "تم التسليم") statusClass = "status-delivered";
          else if (order.status === "ملغي") statusClass = "status-cancelled";

          return `
            <article class="admin-order-card" data-id="${order.id}">
              <header class="admin-order-card-header">
                <div class="admin-order-main-info">
                  <span class="admin-order-id">#${order.id}</span>
                  <span class="admin-order-customer">${order.customer_name}</span>
                  <span class="admin-order-time">${fmtOrderDate(order.created_at)}</span>
                </div>
                <div class="admin-order-controls">
                  <span class="status-badge ${statusClass}">${order.status}</span>
                  <select class="admin-select order-status-select" data-id="${order.id}">
                    <option value="قيد المراجعة" ${order.status === "قيد المراجعة" ? "selected" : ""}>قيد المراجعة</option>
                    <option value="تم التأكيد" ${order.status === "تم التأكيد" ? "selected" : ""}>تم التأكيد</option>
                    <option value="تم الشحن" ${order.status === "تم الشحن" ? "selected" : ""}>تم الشحن</option>
                    <option value="تم التسليم" ${order.status === "تم التسليم" ? "selected" : ""}>تم التسليم</option>
                    <option value="ملغي" ${order.status === "ملغي" ? "selected" : ""}>ملغي</option>
                  </select>
                </div>
              </header>

              <div class="admin-order-body">
                <!-- Customer Details -->
                <div class="admin-order-details-box">
                  <div><b>الهاتف:</b> <a href="tel:${order.phone}" style="color:var(--gold-deep); font-weight:700;">${order.phone}</a></div>
                  <div><b>المحافظة / المدينة:</b> ${order.city || "—"}</div>
                  <div><b>العنوان بالتفصيل:</b> ${order.address || "—"}</div>
                  ${order.notes ? `<div><b>ملاحظات العميل:</b> <span style="color:#B45309;">${order.notes}</span></div>` : ""}
                </div>

                <!-- Line Items -->
                <div class="admin-order-items-list">
                  <div style="font:800 12px var(--f-utility); color:var(--mist); margin-bottom:2px;">الأصناف المطلوبة (${items.length}):</div>
                  ${items.length ? items.map((it) => `
                    <div class="admin-order-item-row">
                      <div class="admin-order-item-prod">
                        <img src="${it.image || "assets/products/prod_01.jpg"}" alt="">
                        <div>
                          <b style="font-size:13px; display:block;">${it.name_ar || it.name || "منتج"}</b>
                          <span class="admin-order-item-meta">المقاس: <b>${it.size || "—"}</b> ${it.color ? `· اللون: <b>${it.color}</b>` : ""}</span>
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:12px; color:var(--mist);">الكمية: <b>${it.qty || 1}</b></span>
                        <span class="admin-order-item-price">${fmtPrice(it.price * (it.qty || 1))}</span>
                      </div>
                    </div>
                  `).join("") : `<span style="color:var(--mist); font-size:12px;">لا توجد أصناف مسجلة</span>`}
                </div>
              </div>

              <footer class="admin-order-footer">
                <div class="admin-order-total">
                  إجمالي الطلب: <b>${fmtPrice(order.total)}</b>
                </div>
                <div class="admin-order-actions">
                  <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-whatsapp">
                    ${Icons.whatsapp} واتساب العميل
                  </a>
                  <a href="tel:${order.phone}" class="btn btn-outline btn-sm">
                    ${Icons.phone} اتصال
                  </a>
                </div>
              </footer>
            </article>
          `;
        }).join("") : `
          <div style="text-align:center; padding:50px 20px; background:var(--white); border-radius:12px; border:1px solid var(--ink-line);">
            <div style="font-size:32px; margin-bottom:10px;">📑</div>
            <h3 style="font:800 18px var(--f-display); margin:0 0 6px;">لا توجد طلبات تطابق الفلتر</h3>
            <p style="color:var(--mist); font-size:13px;">جرب تغيير كلمة البحث أو حالة الطلب لإظهار النتائج.</p>
          </div>
        `}
      </div>

      <!-- Pagination for Orders -->
      ${totalPages > 1 ? `
        <div class="admin-pagination">
          <div class="admin-pagination-info">
            صفحة <b>${adminState.ordersPage}</b> من <b>${totalPages}</b>
          </div>
          <div class="admin-pagination-btns">
            <button class="admin-page-btn js-order-page-btn" data-page="${adminState.ordersPage - 1}" ${adminState.ordersPage <= 1 ? "disabled" : ""}>السابق</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => `
              <button class="admin-page-btn js-order-page-btn ${pg === adminState.ordersPage ? "active" : ""}" data-page="${pg}">${pg}</button>
            `).join("")}
            <button class="admin-page-btn js-order-page-btn" data-page="${adminState.ordersPage + 1}" ${adminState.ordersPage >= totalPages ? "disabled" : ""}>التالي</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* TAB 4: Categories Management                                           */
/* ---------------------------------------------------------------------- */

function renderAdminCategories({ categories, products }) {
  const prodCounts = {};
  products.forEach((p) => {
    prodCounts[p.category_id] = (prodCounts[p.category_id] || 0) + 1;
  });

  return `
    <div class="admin-card">
      <div class="admin-card-head">
        <div>
          <h2 style="margin:0 0 4px;">إدارة الأقسام والفئات</h2>
          <p style="color:var(--mist); font-size:13px; margin:0;">أضف أو عدّل الفئات التي تظهر في المتجر والقوائم وتصنيف المنتجات.</p>
        </div>
        <button class="btn btn-primary" id="btn-add-category-modal">+ إضافة فئة جديدة</button>
      </div>

      <div class="admin-categories-grid" style="margin-top:20px;">
        ${categories.map((c) => {
          const count = prodCounts[c.id] || 0;
          return `
            <div class="admin-cat-card">
              <div>
                <div class="admin-cat-card-header">
                  <h3>${c.name_ar}</h3>
                  <span class="admin-cat-count">${count} منتج</span>
                </div>
                <div style="font:700 11px var(--f-utility); color:var(--gold-deep); margin-bottom:4px;">slug: ${c.slug}</div>
                <div class="admin-cat-tagline">${c.tagline_ar || "لا يوجد وصف مختصر"}</div>
              </div>
              <div class="admin-cat-actions">
                <button class="btn btn-outline btn-sm js-edit-category" data-id="${c.id}">${Icons.edit} تعديل</button>
                <button class="btn btn-outline btn-sm js-delete-category" data-id="${c.id}" data-count="${count}" style="color:var(--flame); border-color:rgba(232,67,44,0.3);">${Icons.trash} حذف</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* TAB 5: System, Database & Settings                                     */
/* ---------------------------------------------------------------------- */

function renderAdminSystem({ products, categories, orders }) {
  return `
    <div class="admin-card" style="max-width:860px; margin:0 auto;">
      <div class="admin-card-head">
        <div>
          <h2 style="margin:0 0 4px;">معلومات وإعدادات النظام</h2>
          <p style="color:var(--mist); font-size:13px; margin:0;">إدارة محرك قاعدة البيانات SQLite WASM والبيانات المحفوظة.</p>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:20px; margin-top:20px;">
        <!-- DB Status Box -->
        <div style="padding:18px; background:var(--cream); border-radius:12px; border:1px solid var(--ink-line);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <b style="font:800 15px var(--f-display);">حالة قاعدة البيانات (SQLite WASM)</b>
            <span class="stock-badge stock-ok">نشط ومحدث</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; text-align:center;">
            <div style="background:var(--white); padding:12px; border-radius:8px; border:1px solid var(--ink-line);">
              <b style="font:900 20px var(--f-display); color:var(--gold-deep); display:block;">${products.length}</b>
              <span style="font-size:12px; color:var(--mist);">منتجات مسجلة</span>
            </div>
            <div style="background:var(--white); padding:12px; border-radius:8px; border:1px solid var(--ink-line);">
              <b style="font:900 20px var(--f-display); color:var(--gold-deep); display:block;">${categories.length}</b>
              <span style="font-size:12px; color:var(--mist);">فئات معتمدة</span>
            </div>
            <div style="background:var(--white); padding:12px; border-radius:8px; border:1px solid var(--ink-line);">
              <b style="font:900 20px var(--f-display); color:var(--gold-deep); display:block;">${orders.length}</b>
              <span style="font-size:12px; color:var(--mist);">طلبات مخزنة</span>
            </div>
          </div>
        </div>

        <!-- System Reset / Clear -->
        <div style="padding:18px; background:#FEF2F2; border-radius:12px; border:1px solid #FCA5A5;">
          <h3 style="font:800 16px var(--f-display); color:#991B1B; margin-bottom:8px;">إعادة تعيين قاعدة البيانات</h3>
          <p style="font-size:13px; color:#7F1D1D; line-height:1.6; margin-bottom:14px;">
            مسح التغييرات المحفوظة محلياً في هذا المتصفح واستعادة النسخة الأصلية من ملف <code>assets/db/devo.sqlite</code>.
          </p>
          <button class="btn btn-outline" id="btn-system-reset" style="color:#991B1B; border-color:#F87171;">
            ${Icons.refresh} استعادة النسخة الافتراضية
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* Admin Event Attachments                                                */
/* ---------------------------------------------------------------------- */

function attachAdminTabEvents({ categories, products, orders }) {
  // Navigation shortcuts
  document.querySelectorAll(".js-goto-tab").forEach((b) => {
    b.addEventListener("click", () => {
      adminState.activeTab = b.dataset.tab;
      pageAdmin();
    });
  });

  // Pagination buttons for products
  document.querySelectorAll(".js-prod-page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      adminState.productsPage = Number(btn.dataset.page);
      pageAdmin();
    });
  });

  // Pagination buttons for orders
  document.querySelectorAll(".js-order-page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      adminState.ordersPage = Number(btn.dataset.page);
      pageAdmin();
    });
  });

  // Quick stock stepper on all views
  document.querySelectorAll(".js-quick-stock").forEach((b) => {
    b.addEventListener("click", () => {
      const id = Number(b.dataset.id);
      const delta = Number(b.dataset.delta);
      const p = DB.getProductById(id);
      if (!p) return;
      p.stock = Math.max(0, Number(p.stock) + delta);
      DB.updateProduct(p);
      pageAdmin();
      toast(`تم تحديث مخزون "${p.name_ar}" إلى ${p.stock}`, "box");
    });
  });

  // Order status changes
  document.querySelectorAll(".order-status-select").forEach((sel) => {
    sel.addEventListener("change", () => {
      const id = Number(sel.dataset.id);
      const val = sel.value;
      DB.updateOrderStatus(id, val);
      toast(`تم تغيير حالة الطلب #${id} إلى "${val}"`, "check");
      pageAdmin();
    });
  });

  // Order status tabs
  document.querySelectorAll(".js-order-status-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      adminState.orderStatus = btn.dataset.status;
      adminState.ordersPage = 1;
      pageAdmin();
    });
  });

  // Order Search
  const orderSearchInput = document.getElementById("admin-order-search-input");
  orderSearchInput?.addEventListener("input", (e) => {
    adminState.orderSearch = e.target.value;
    adminState.ordersPage = 1;
    clearTimeout(window._orderSearchTimer);
    window._orderSearchTimer = setTimeout(() => pageAdmin(), 250);
  });

  // Product Search & Filters
  const prodSearchInput = document.getElementById("admin-prod-search-input");
  prodSearchInput?.addEventListener("input", (e) => {
    adminState.productSearch = e.target.value;
    adminState.productsPage = 1;
    clearTimeout(window._prodSearchTimer);
    window._prodSearchTimer = setTimeout(() => pageAdmin(), 250);
  });

  document.getElementById("admin-prod-cat-filter")?.addEventListener("change", (e) => {
    adminState.productCategory = e.target.value;
    adminState.productsPage = 1;
    pageAdmin();
  });

  document.getElementById("admin-prod-stock-filter")?.addEventListener("change", (e) => {
    adminState.productStock = e.target.value;
    adminState.productsPage = 1;
    pageAdmin();
  });

  document.getElementById("admin-prod-sort-filter")?.addEventListener("change", (e) => {
    adminState.productSort = e.target.value;
    adminState.productsPage = 1;
    pageAdmin();
  });

  document.getElementById("btn-reset-prod-filters")?.addEventListener("click", () => {
    adminState.productSearch = "";
    adminState.productCategory = "all";
    adminState.productStock = "all";
    adminState.productsPage = 1;
    pageAdmin();
  });

  // Add Product Modals
  document.getElementById("btn-add-new-product")?.addEventListener("click", () => openProductModal(null, categories));
  document.getElementById("btn-quick-add-product")?.addEventListener("click", () => openProductModal(null, categories));

  // Edit Product Modal
  document.querySelectorAll(".js-edit-product").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = DB.getProductById(Number(btn.dataset.id));
      if (p) openProductModal(p, categories);
    });
  });

  // Delete Product
  document.querySelectorAll(".js-delete-product").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const p = DB.getProductById(id);
      if (!p) return;
      if (confirm(`هل أنت متأكد من حذف منتج "${p.name_ar}" نهائياً؟`)) {
        DB.deleteProduct(id);
        toast("تم حذف المنتج بنجاح", "trash");
        pageAdmin();
      }
    });
  });

  // Add Category Modals
  document.getElementById("btn-add-category-modal")?.addEventListener("click", () => openCategoryModal(null));
  document.getElementById("btn-quick-add-category")?.addEventListener("click", () => openCategoryModal(null));

  // Edit Category Modal
  document.querySelectorAll(".js-edit-category").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = categories.find((c) => c.id === Number(btn.dataset.id));
      if (cat) openCategoryModal(cat);
    });
  });

  // Delete Category
  document.querySelectorAll(".js-delete-category").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const count = Number(btn.dataset.count || 0);
      if (count > 0) {
        alert(`لا يمكن حذف هذه الفئة لأنها تحتوي على (${count}) منتج. يرجى نقل أو حذف المنتجات المرتبطة بها أولاً.`);
        return;
      }
      if (confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
        DB.deleteCategory(id);
        toast("تم حذف الفئة بنجاح", "trash");
        pageAdmin();
      }
    });
  });

  // System Reset
  document.getElementById("btn-system-reset")?.addEventListener("click", () => {
    if (confirm("هل أنت متأكد من استعادة النسخة الافتراضية؟ سيتم مسح أي تعديلات غير مصدرة في المتصفح.")) {
      localStorage.removeItem("devo_database_snapshot_v1");
      window.location.reload();
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Admin Modals (Product & Category)                                      */
/* ---------------------------------------------------------------------- */

function openProductModal(product = null, categories = []) {
  const isEdit = !!product;
  const modalRoot = document.getElementById("admin-modal-root");
  if (!modalRoot) return;

  const defaultSizes = "38, 39, 40, 41, 42, 43, 44";
  
  // Extract all existing colors and images
  const existingColorMap = product ? productColorImages(product) : {};
  const existingColorsList = product ? productColors(product) : [];

  // Determine main image color if present
  let mainColorName = "";
  if (product && existingColorsList.length) {
    mainColorName = existingColorsList[0] || "";
  }

  modalRoot.innerHTML = `
    <div class="admin-modal-backdrop" id="product-modal-backdrop">
      <div class="admin-modal" role="dialog" aria-modal="true">
        <div class="admin-modal-header">
          <h2>${isEdit ? `تعديل منتج: ${product.name_ar}` : "إضافة منتج جديد"}</h2>
          <button class="admin-modal-close" id="modal-close-btn" aria-label="إغلاق">${Icons.close}</button>
        </div>

        <form id="product-modal-form" style="display:flex; flex-direction:column; flex:1; overflow:hidden;">
          <div class="admin-modal-body">
            <div class="modal-form-grid">
              <!-- Name & Category -->
              <div class="modal-form-group full-span">
                <label>اسم المنتج *</label>
                <input name="name_ar" value="${product?.name_ar || ""}" placeholder="مثال: حذاء كلاسيك أكسفورد جلد طبيعي" required>
              </div>

              <div class="modal-form-group">
                <label>القسم / الفئة *</label>
                <select name="category_id" required>
                  ${categories.map((c) => `<option value="${c.id}" ${product && product.category_id === c.id ? "selected" : ""}>${c.name_ar}</option>`).join("")}
                </select>
              </div>

              <div class="modal-form-group">
                <label>العلامة التجارية</label>
                <input name="brand" value="${product?.brand || "DEVO"}" placeholder="DEVO">
              </div>

              <!-- Price & Stock -->
              <div class="modal-form-group">
                <label>السعر الحالي (ج.م) *</label>
                <input name="price" type="number" min="0" value="${product?.price || ""}" placeholder="599" required>
              </div>

              <div class="modal-form-group">
                <label>السعر القديم قبل الخصم (اختياري)</label>
                <input name="old_price" type="number" min="0" value="${product?.old_price || ""}" placeholder="799">
              </div>

              <div class="modal-form-group">
                <label>كمية المخزون المتاحة *</label>
                <input name="stock" type="number" min="0" value="${product ? product.stock : 10}" required>
              </div>

              <div class="modal-form-group">
                <label>المقاسات المتاحة (مفصولة بفاصلة)</label>
                <input name="sizes" value="${product?.sizes || defaultSizes}" placeholder="39, 40, 41, 42, 43, 44">
              </div>

              <!-- Description -->
              <div class="modal-form-group full-span">
                <label>وصف وتفاصيل المنتج</label>
                <textarea name="description_ar" rows="3" placeholder="وصف تفصيلي للخامات، النعل، والمميزات...">${product?.description_ar || ""}</textarea>
              </div>

              <!-- Badges -->
              <div class="modal-form-group full-span modal-checkboxes">
                <label>
                  <input type="checkbox" name="is_new" ${product?.is_new ? "checked" : ""}>
                  شارة "منتج جديد"
                </label>
                <label>
                  <input type="checkbox" name="is_featured" ${product?.is_featured ? "checked" : ""}>
                  تمييز في الصفحة الرئيسية
                </label>
              </div>

              <!-- Main Image Upload Zone -->
              <div class="modal-form-group full-span">
                <label>الصورة الرئيسية للمنتج ولونها الأساسي *</label>
                <input type="hidden" name="image" id="modal-main-image-val" value="${product?.image || "assets/products/prod_01.jpg"}">
                <div class="admin-upload-zone" style="flex-wrap:wrap;">
                  <img src="${product?.image || "assets/products/prod_01.jpg"}" id="modal-main-image-preview" alt="معاينة الصورة">
                  <div class="admin-upload-input-wrap">
                    <input type="file" id="modal-main-image-file" accept="image/*">
                    <span>اختر ملف صورة من جهازك.</span>
                  </div>
                  <div style="width:100%; margin-top:10px;">
                    <label style="font-size:12px; font-weight:700;">اسم لون الصورة الرئيسية (مثال: أبيض، أسود، كحلي)</label>
                    <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                      <span class="card-color" id="main-color-preview-circle" style="--swatch:${colorKey(mainColorName)}; width:24px; height:24px; flex-shrink:0;"></span>
                      <input type="text" id="modal-main-color-name" value="${mainColorName}" placeholder="اكتب اسم لون الصورة الرئيسية (مثال: أبيض)" style="flex:1;">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Color Variants & Images Manager -->
              <div class="modal-form-group full-span" style="background:var(--cream); padding:16px; border-radius:12px; border:1px solid var(--ink-line);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <div>
                    <b style="font:800 14px var(--f-display);">ألوان وفروقات إضافية للمنتج</b>
                    <p style="font-size:12px; color:var(--mist); margin:2px 0 0;">أضف أي ألوان إضافية للمنتج مع صورها الخاصة لتظهر في دوائر الألوان ومعرض الصور.</p>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" id="modal-add-color-btn">+ إضافة لون وصورة</button>
                </div>

                <div id="modal-colors-list" style="display:flex; flex-direction:column; gap:8px;"></div>
                <input type="hidden" name="colors" id="modal-colors-hidden" value="${product?.colors || ""}">
                <input type="hidden" name="color_images" id="modal-color-images-hidden" value="${product?.color_images || ""}">
              </div>
            </div>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="btn btn-outline" id="modal-cancel-btn">إلغاء</button>
            <button type="submit" class="btn btn-primary">${isEdit ? "حفظ التعديلات" : "إضافة المنتج"}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Close modal logic
  const closeModal = () => { modalRoot.innerHTML = ""; };
  document.getElementById("modal-close-btn")?.addEventListener("click", closeModal);
  document.getElementById("modal-cancel-btn")?.addEventListener("click", closeModal);
  document.getElementById("product-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "product-modal-backdrop") closeModal();
  });

  // Main Image file handler
  const mainImageInput = document.getElementById("modal-main-image-val");
  const mainImagePreview = document.getElementById("modal-main-image-preview");
  const mainImageFile = document.getElementById("modal-main-image-file");
  const mainColorInput = document.getElementById("modal-main-color-name");
  const mainColorCircle = document.getElementById("main-color-preview-circle");

  mainColorInput?.addEventListener("input", (e) => {
    mainColorCircle.style.setProperty("--swatch", colorKey(e.target.value));
    syncColors();
  });

  mainImageFile?.addEventListener("change", () => {
    const file = mainImageFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      mainImageInput.value = reader.result;
      mainImagePreview.src = reader.result;
      syncColors();
    };
    reader.readAsDataURL(file);
  });

  // Color Variants Builder
  const colorsListEl = document.getElementById("modal-colors-list");
  const colorsHidden = document.getElementById("modal-colors-hidden");
  const colorImagesHidden = document.getElementById("modal-color-images-hidden");

  const syncColors = () => {
    const colorItems = [];

    // Main color if present
    const mainCol = (mainColorInput?.value || "").trim();
    const mainImg = mainImageInput?.value || "";
    if (mainCol) {
      colorItems.push({ name: mainCol, img: mainImg });
    }

    // Additional color rows
    const rows = Array.from(colorsListEl.querySelectorAll(".admin-color-item"));
    rows.forEach((row) => {
      const name = row.querySelector(".js-c-name").value.trim();
      const img = row.dataset.image || mainImg;
      if (name && !colorItems.some((item) => normalizeColorName(item.name) === normalizeColorName(name))) {
        colorItems.push({ name, img });
      }
    });

    colorsHidden.value = colorItems.map((x) => x.name).join(", ");
    colorImagesHidden.value = colorItems.map((x) => `${x.name}=${x.img}`).join("|");
  };

  const addColorRow = (colorName = "", colorImg = "") => {
    const row = document.createElement("div");
    row.className = "admin-color-item";
    row.dataset.image = colorImg || mainImageInput.value;
    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="card-color js-c-circle" style="--swatch:${colorKey(colorName)}; width:22px; height:22px; flex-shrink:0;"></span>
        <input class="js-c-name" value="${colorName}" placeholder="اسم اللون (مثال: أسود)" required style="flex:1;">
      </div>
      <input type="file" class="js-c-file" accept="image/*">
      <img src="${colorImg || mainImageInput.value}" class="js-c-preview" alt="">
      <button type="button" class="admin-modal-close js-c-remove" style="color:var(--flame);" title="حذف اللون">${Icons.trash}</button>
    `;

    const nameInput = row.querySelector(".js-c-name");
    const circle = row.querySelector(".js-c-circle");

    nameInput.addEventListener("input", () => {
      circle.style.setProperty("--swatch", colorKey(nameInput.value));
      syncColors();
    });

    row.querySelector(".js-c-file").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        row.dataset.image = reader.result;
        row.querySelector(".js-c-preview").src = reader.result;
        syncColors();
      };
      reader.readAsDataURL(file);
    });

    row.querySelector(".js-c-remove").addEventListener("click", () => {
      row.remove();
      syncColors();
    });

    colorsListEl.appendChild(row);
  };

  // Populate additional colors (skip the first color if it's already in the main color input)
  const remainingColors = existingColorsList.slice(mainColorName ? 1 : 0);
  if (remainingColors.length) {
    remainingColors.forEach((c) => {
      addColorRow(c, existingColorMap[c] || "");
    });
  } else if (!isEdit) {
    // default helper: don't force extra row, user can click +
  }

  document.getElementById("modal-add-color-btn")?.addEventListener("click", () => addColorRow());

  // Form Submit Handler
  document.getElementById("product-modal-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    syncColors();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      id: isEdit ? Number(product.id) : undefined,
      name_ar: data.name_ar.trim(),
      category_id: Number(data.category_id),
      brand: data.brand ? data.brand.trim() : "DEVO",
      price: Number(data.price),
      old_price: data.old_price ? Number(data.old_price) : null,
      stock: Number(data.stock) || 0,
      sizes: data.sizes.trim(),
      colors: data.colors.trim(),
      color_images: data.color_images,
      image: data.image || "assets/products/prod_01.jpg",
      description_ar: data.description_ar ? data.description_ar.trim() : "",
      is_new: !!data.is_new,
      is_featured: !!data.is_featured,
    };

    if (isEdit) {
      DB.updateProduct(payload);
      toast("تم حفظ تعديلات المنتج بنجاح", "check");
    } else {
      DB.insertProduct(payload);
      toast("تمت إضافة المنتج الجديد بنجاح", "check");
    }

    closeModal();
    pageAdmin();
  });
}

function openCategoryModal(category = null) {
  const isEdit = !!category;
  const modalRoot = document.getElementById("admin-modal-root");
  if (!modalRoot) return;

  modalRoot.innerHTML = `
    <div class="admin-modal-backdrop" id="cat-modal-backdrop">
      <div class="admin-modal" style="max-width:500px;" role="dialog" aria-modal="true">
        <div class="admin-modal-header">
          <h2>${isEdit ? `تعديل قسم: ${category.name_ar}` : "إضافة قسم/فئة جديدة"}</h2>
          <button class="admin-modal-close" id="cat-modal-close">${Icons.close}</button>
        </div>

        <form id="cat-modal-form">
          <div class="admin-modal-body">
            <div class="modal-form-group" style="margin-bottom:14px;">
              <label>اسم الفئة (بالعربية) *</label>
              <input name="name_ar" value="${category?.name_ar || ""}" placeholder="مثال: أحذية جري وسنيكرز" required>
            </div>

            <div class="modal-form-group" style="margin-bottom:14px;">
              <label>المعرف الإنجليزي (Slug) *</label>
              <input name="slug" value="${category?.slug || ""}" placeholder="مثال: runners" required>
            </div>

            <div class="modal-form-group">
              <label>الوصف القصير</label>
              <input name="tagline_ar" value="${category?.tagline_ar || ""}" placeholder="مثال: خفة وراحة لكل خطوة">
            </div>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="btn btn-outline" id="cat-modal-cancel">إلغاء</button>
            <button type="submit" class="btn btn-primary">${isEdit ? "حفظ التعديل" : "إضافة الفئة"}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { modalRoot.innerHTML = ""; };
  document.getElementById("cat-modal-close")?.addEventListener("click", closeModal);
  document.getElementById("cat-modal-cancel")?.addEventListener("click", closeModal);
  document.getElementById("cat-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "cat-modal-backdrop") closeModal();
  });

  document.getElementById("cat-modal-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const payload = {
      id: isEdit ? category.id : undefined,
      name_ar: data.name_ar.trim(),
      slug: data.slug.trim().toLowerCase(),
      tagline_ar: data.tagline_ar.trim(),
    };

    if (isEdit) {
      DB.updateCategory(payload);
      toast("تم حفظ تعديل الفئة", "check");
    } else {
      DB.insertCategory(payload);
      toast("تمت إضافة الفئة بنجاح", "check");
    }

    closeModal();
    pageAdmin();
  });
}

function fmtOrderDate(iso) {
  if (!iso) return "مؤخراً";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return iso;
  }
}


/* ---------------------------------------------------------------------- */
/* PAGE: Checkout                                                          */
/* ---------------------------------------------------------------------- */

function pageCheckout() {
  const items = Cart.load();
  const { subtotal, shipping, total } = Cart.totals();

  if (items.length === 0) {
    $app.innerHTML = `<div class="empty-state">${Icons.cart}<h3>السلة فاضية</h3><p>ضيف منتجات الأول علشان تقدر تكمل الطلب.</p><a href="#/shop" class="btn btn-gold" style="margin-top:16px">تصفح المتجر</a></div>`;
    return;
  }

  $app.innerHTML = `
  <div class="page-head">
    <div class="container">
      <div class="breadcrumb"><a href="#/">الرئيسية</a> / إتمام الطلب</div>
      <h1 class="h-display">إتمام الطلب</h1>
    </div>
  </div>
  <div class="container checkout-grid">
    <form class="form-card" id="checkout-form" novalidate>
      <h3>بيانات التوصيل</h3>
      <div class="form-row" data-field="name">
        <label>الاسم بالكامل</label>
        <input type="text" name="name" placeholder="مثال: محمد أحمد">
        <span class="field-error">من فضلك أدخل الاسم</span>
      </div>
      <div class="form-grid-2">
        <div class="form-row" data-field="phone">
          <label>رقم الموبايل</label>
          <input type="tel" name="phone" placeholder="01xxxxxxxxx" dir="ltr">
          <span class="field-error">رقم موبايل غير صحيح</span>
        </div>
        <div class="form-row" data-field="city">
          <label>المحافظة</label>
          <select name="city">
            <option value="">اختر المحافظة</option>
            ${["سوهاج", "قنا", "أسوان", "الأقصر", "القاهرة", "الجيزة", "الإسكندرية", "المنيا", "أسيوط", "بني سويف", "الفيوم", "المنصورة", "الغربية"].map((c) => `<option value="${c}">${c}</option>`).join("")}
          </select>
          <span class="field-error">اختر المحافظة</span>
        </div>
      </div>
      <div class="form-row" data-field="address">
        <label>العنوان بالتفصيل</label>
        <textarea name="address" rows="3" placeholder="اسم الشارع، رقم العقار، علامة مميزة..."></textarea>
        <span class="field-error">من فضلك أدخل العنوان</span>
      </div>
      <div class="form-row">
        <label>ملاحظات (اختياري)</label>
        <textarea name="notes" rows="2" placeholder="أي تفاصيل إضافية عن الطلب"></textarea>
      </div>

      <h3 style="margin-top:8px">طريقة الدفع</h3>
      <div class="pay-options">
        <label class="pay-option selected">
          <input type="radio" name="pay" value="cod" checked style="display:none">
          ${Icons.cash}
          <span><b>الدفع عند الاستلام</b><span>ادفع نقدًا لما يوصلك الطلب</span></span>
        </label>
        <label class="pay-option">
          <input type="radio" name="pay" value="wallet" style="display:none">
          ${Icons.card}
          <span><b>محفظة إلكترونية / فودافون كاش</b><span>هنتواصل معاك لتأكيد الدفع</span></span>
        </label>
      </div>

      <button type="submit" class="btn btn-primary btn-block" style="margin-top:22px">تأكيد الطلب — ${fmtPrice(total)}</button>
    </form>

    <div class="summary-card">
      <h3>ملخص الطلب</h3>
      <div id="summary-lines">
        ${items
      .map(
        (i) => `<div class="summary-line-item">
              <img src="${i.image}" alt="">
              <div><div class="name">${i.name}</div><div class="meta">مقاس ${i.size} × ${i.qty}</div></div>
              <div class="price">${fmtPrice(i.price * i.qty)}</div>
            </div>`
      )
      .join("")}
      </div>
      <div style="margin-top:18px">
        <div class="sum-row"><span>المجموع الفرعي</span><span>${fmtPrice(subtotal)}</span></div>
        <div class="sum-row"><span>الشحن</span><span>${shipping === 0 ? "مجاني" : fmtPrice(shipping)}</span></div>
        <div class="sum-row total"><span>الإجمالي</span><span>${fmtPrice(total)}</span></div>
      </div>
    </div>
  </div>
  `;

  document.querySelectorAll(".pay-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".pay-option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      opt.querySelector("input").checked = true;
    });
  });

  document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      city: form.city.value,
      address: form.address.value.trim(),
      notes: form.notes.value.trim(),
    };

    let valid = true;
    const setError = (field, isError) => {
      const row = form.querySelector(`[data-field="${field}"]`);
      if (!row) return;
      row.classList.toggle("error", isError);
      if (isError) valid = false;
    };

    setError("name", data.name.length < 2);
    setError("phone", !/^01[0-2,5]\d{8}$/.test(data.phone));
    setError("city", !data.city);
    setError("address", data.address.length < 5);

    if (!valid) {
      toast("من فضلك راجع البيانات المطلوبة", "close");
      return;
    }

    const orderId = DB.insertOrder({ ...data, items, total });
    Cart.clear();
    navigate(`/order/${orderId}`);
  });
}

/* ---------------------------------------------------------------------- */
/* PAGE: Order confirmation                                                 */
/* ---------------------------------------------------------------------- */

function pageOrderConfirm(orderId) {
  const waText = encodeURIComponent(`مرحبًا DEVO Store، عايز أأكد طلبي رقم #${orderId}`);
  $app.innerHTML = `
  <div class="confirm-wrap">
    <div class="confirm-icon">${Icons.check}</div>
    <h1 class="h-display">تم استلام طلبك!</h1>
    <p>هيتم التواصل معاك خلال ساعات لتأكيد الطلب، وبعدين هيوصلك خلال 2-5 أيام عمل.</p>
    <div class="confirm-order-id">رقم الطلب: #${orderId}</div>
    <div class="confirm-actions">
      <a href="https://wa.me/${STORE.phoneIntl}?text=${waText}" target="_blank" rel="noopener" class="btn btn-gold">${Icons.whatsapp} أكّد عبر واتساب</a>
      <a href="#/shop" class="btn btn-outline">متابعة التسوق</a>
    </div>
  </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* Cart drawer                                                             */
/* ---------------------------------------------------------------------- */

function renderCartDrawer() {
  const items = Cart.load();
  const { subtotal, shipping, total } = Cart.totals();
  const body = document.getElementById("drawer-body");
  const foot = document.getElementById("drawer-foot");

  if (items.length === 0) {
    body.innerHTML = `<div class="empty-state">${Icons.cart}<h3>السلة فاضية</h3><p>ضيف موديلك المفضل وابدأ التسوق.</p></div>`;
    foot.innerHTML = `<a href="#/shop" class="btn btn-gold btn-block js-close-drawer">تصفح المتجر</a>`;
    return;
  }

  body.innerHTML = items
    .map(
      (i) => `
    <div class="cart-line" data-id="${i.id}" data-size="${i.size}">
      <img src="${i.image}" alt="">
      <div class="cart-line-info">
        <h4>${i.name}</h4>
        <div class="cart-line-meta">مقاس ${i.size}</div>
        <div class="qty-stepper">
          <button class="js-qty-minus">${Icons.minus}</button>
          <span>${i.qty}</span>
          <button class="js-qty-plus">${Icons.plus}</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px">
        <span class="cart-line-price">${fmtPrice(i.price * i.qty)}</span>
        <button class="cart-line-remove js-remove">إزالة</button>
      </div>
    </div>`
    )
    .join("");

  foot.innerHTML = `
    <div class="sum-row"><span>المجموع الفرعي</span><span>${fmtPrice(subtotal)}</span></div>
    <div class="sum-row"><span>الشحن</span><span>${shipping === 0 ? "مجاني" : fmtPrice(shipping)}</span></div>
    <div class="sum-row total"><span>الإجمالي</span><span>${fmtPrice(total)}</span></div>
    <a href="#/checkout" class="btn btn-primary btn-block js-close-drawer" style="margin-top:14px">إتمام الطلب</a>
  `;

  body.querySelectorAll(".cart-line").forEach((line) => {
    const id = Number(line.dataset.id);
    const size = line.dataset.size;
    const item = items.find((i) => i.id === id && i.size === size);
    line.querySelector(".js-qty-plus").addEventListener("click", () => Cart.updateQty(id, size, item.qty + 1));
    line.querySelector(".js-qty-minus").addEventListener("click", () => Cart.updateQty(id, size, item.qty - 1));
    line.querySelector(".js-remove").addEventListener("click", () => Cart.remove(id, size));
  });

  foot.querySelectorAll(".js-close-drawer").forEach((el) => el.addEventListener("click", closeCartDrawer));
}

function closeAllDrawers() {
  document.getElementById("overlay").classList.remove("open");
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("categories-drawer")?.classList.remove("open");
  document.getElementById("wishlist-drawer")?.classList.remove("open");
}

function openCartDrawer() {
  closeAllDrawers();
  renderCartDrawer();
  document.getElementById("overlay").classList.add("open");
  document.getElementById("cart-drawer").classList.add("open");
}
function closeCartDrawer() {
  closeAllDrawers();
}

function renderCategoriesDrawer() {
  const cats = DB.getCategories();
  document.getElementById("categories-drawer-body").innerHTML = `<a class="category-drawer-link all" href="#/categories"><span><b>كل الفئات</b><small>تصفح الدليل الكامل</small></span>${Icons.arrowRTL}</a>${categoryLinks(cats, DB.countByCategory())}`;
}

function openCategoriesDrawer() {
  closeAllDrawers();
  renderCategoriesDrawer();
  document.getElementById("overlay").classList.add("open");
  document.getElementById("categories-drawer").classList.add("open");
}

function closeCategoriesDrawer() {
  closeAllDrawers();
}

/* ---------------------------------------------------------------------- */
/* Wishlist drawer                                                         */
/* ---------------------------------------------------------------------- */

function renderWishlistDrawer() {
  const ids = Cart.loadWishlist();
  const body = document.getElementById("wishlist-drawer-body");
  if (ids.length === 0) {
    body.innerHTML = `<div class="empty-state">${Icons.heart}<h3>المفضلة فاضية</h3><p>أضف منتجاتك المفضلة وارجع لها بسهولة.</p></div>`;
    return;
  }
  body.innerHTML = ids.map((id) => {
    const p = DB.getProductById(id);
    if (!p) return "";
    return `<a href="#/product/${p.id}" class="wishlist-item js-close-wishlist">
      <img src="${p.image}" alt="${p.name_ar}">
      <div class="wishlist-item-info">
        <h4>${p.name_ar}</h4>
        <span class="wishlist-item-price">${fmtPrice(p.price)}</span>
      </div>
      <button class="wishlist-item-remove js-wish-remove" data-id="${p.id}" aria-label="إزالة">${Icons.close}</button>
    </a>`;
  }).join("");

  body.querySelectorAll(".js-wish-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      Cart.toggleWishlist(Number(btn.dataset.id));
      updateWishlistBadge();
      renderWishlistDrawer();
      toast("تمت الإزالة من المفضلة", "heart");
    });
  });

  body.querySelectorAll(".js-close-wishlist").forEach((el) => el.addEventListener("click", closeWishlistDrawer));
}

function openWishlistDrawer() {
  closeAllDrawers();
  renderWishlistDrawer();
  document.getElementById("overlay").classList.add("open");
  document.getElementById("wishlist-drawer").classList.add("open");
}

function closeWishlistDrawer() {
  closeAllDrawers();
}

/* ---------------------------------------------------------------------- */
/* Router                                                                   */
/* ---------------------------------------------------------------------- */

function router() {
  const { segments, params } = parseHash();
  closeMobileMenu();
  closeCategoriesDrawer();
  scrollTop();

  document.querySelectorAll(".nav-links a").forEach((a) => a.classList.remove("active"));

  if (segments.length === 0) {
    pageHome();
    document.querySelector('.nav-links a[href="#/"]')?.classList.add("active");
  } else if (segments[0] === "shop") {
    pageShop(params);
    document.querySelector('.nav-links a[href="#/shop"]')?.classList.add("active");
  } else if (segments[0] === "categories") {
    pageCategories();
    document.querySelector('.nav-links a[href="#/categories"]')?.classList.add("active");
  } else if (segments[0] === "product" && segments[1]) {
    pageProduct(Number(segments[1]));
  } else if (segments[0] === "checkout") {
    pageCheckout();
  } else if (segments[0] === "order" && segments[1]) {
    pageOrderConfirm(segments[1]);
  } else if (segments[0] === "about") {
    pageAbout();
    document.querySelector('.nav-links a[href="#/about"]')?.classList.add("active");
  } else if (segments[0] === "admin") {
    pageAdmin();
  } else {
    pageHome();
  }
}

/* ---------------------------------------------------------------------- */
/* Mobile menu                                                             */
/* ---------------------------------------------------------------------- */

function openMobileMenu() {
  document.getElementById("mobile-menu").classList.add("open");
}
function closeMobileMenu() {
  document.getElementById("mobile-menu")?.classList.remove("open");
}

/* ---------------------------------------------------------------------- */
/* Global event delegation (quick-add, wishlist, search, cart open)         */
/* ---------------------------------------------------------------------- */

function wireGlobalEvents() {
  document.body.addEventListener("click", (e) => {
    const cardColor = e.target.closest(".js-card-color");
    if (cardColor) {
      e.preventDefault();
      const card = cardColor.closest(".p-card");
      card.querySelectorAll(".js-card-color").forEach((button) => button.classList.toggle("active", button === cardColor));
      card.querySelector(".js-card-image").src = cardColor.dataset.image;
      card.querySelector(".card-color-name").textContent = cardColor.dataset.color;
      return;
    }

    const quickAdd = e.target.closest(".js-quickadd");
    if (quickAdd) {
      e.preventDefault();
      e.stopPropagation();
      const p = DB.getProductById(Number(quickAdd.dataset.id));
      const defaultSize = p.sizes.split(",")[0];
      Cart.add(p, defaultSize, 1);
      toast(`تمت إضافة ${p.name_ar} للسلة`, "cart");
      return;
    }

    const wish = e.target.closest(".js-wish");
    if (wish) {
      e.preventDefault();
      e.stopPropagation();
      const active = Cart.toggleWishlist(Number(wish.dataset.id));
      wish.classList.toggle("active", active);
      wish.innerHTML = active ? Icons.heartFill : Icons.heart;
      toast(active ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة", "heart");
      return;
    }
  });

  document.getElementById("cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("cart-btn-mobile")?.addEventListener("click", openCartDrawer);
  document.getElementById("overlay").addEventListener("click", closeAllDrawers);
  document.getElementById("drawer-close").addEventListener("click", closeCartDrawer);
  document.getElementById("categories-btn").addEventListener("click", openCategoriesDrawer);
  document.getElementById("categories-drawer-close").addEventListener("click", closeCategoriesDrawer);

  // Wishlist drawer
  document.getElementById("wishlist-btn").addEventListener("click", openWishlistDrawer);
  document.getElementById("wishlist-drawer-close").addEventListener("click", closeWishlistDrawer);

  // Mobile bottom nav
  document.getElementById("mob-nav-cart")?.addEventListener("click", openCartDrawer);
  document.getElementById("mob-nav-wishlist")?.addEventListener("click", openWishlistDrawer);

  document.getElementById("nav-toggle").addEventListener("click", openMobileMenu);
  document.getElementById("mobile-menu-close").addEventListener("click", closeMobileMenu);

  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("search-input").value.trim();
    navigate(`/shop${q ? "?q=" + encodeURIComponent(q) : ""}`);
  });

  const mobileSearchForm = document.getElementById("mobile-search-form");
  mobileSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("mobile-search-input").value.trim();
    navigate(`/shop${q ? "?q=" + encodeURIComponent(q) : ""}`);
  });

  Cart.onChange(() => {
    updateCartBadge();
    updateWishlistBadge();
    if (document.getElementById("cart-drawer").classList.contains("open")) renderCartDrawer();
    if (document.getElementById("wishlist-drawer").classList.contains("open")) renderWishlistDrawer();
  });

  document.getElementById("export-db-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    DB.exportDatabase();
    toast("تم تصدير قاعدة البيانات", "box");
  });

  // Update mobile bottom nav active state on hash change
  function updateMobileNav() {
    const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0];
    document.querySelectorAll(".mob-nav-item[data-page]").forEach((el) => {
      const page = el.dataset.page;
      const isActive = (page === "home" && (hash === "" || hash === "/")) || (page === "shop" && hash.startsWith("shop"));
      el.classList.toggle("active", isActive);
    });
  }
  window.addEventListener("hashchange", updateMobileNav);
  updateMobileNav();
}

/* ---------------------------------------------------------------------- */
/* Boot                                                                     */
/* ---------------------------------------------------------------------- */

export async function boot() {
  await DB.init();
  wireGlobalEvents();
  renderCartDrawer();
  updateCartBadge();
  window.addEventListener("hashchange", router);
  router();

  const loader = document.getElementById("loader-screen");
  setTimeout(() => loader.classList.add("hide"), 350);
}
