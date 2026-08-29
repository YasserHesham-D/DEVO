import sqlite3
import os

DB_PATH = "assets/db/devo.sqlite"
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.executescript("""
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    tagline_ar TEXT
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name_ar TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    price REAL NOT NULL,
    old_price REAL,
    sizes TEXT NOT NULL,
    colors TEXT,
    color_images TEXT,
    brand TEXT NOT NULL DEFAULT 'DEVO',
    description_ar TEXT,
    image TEXT NOT NULL,
    rating REAL,
    reviews INTEGER,
    is_new INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 10,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT,
    address TEXT,
    notes TEXT,
    items_json TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'قيد المراجعة',
    created_at TEXT NOT NULL
);
""")

categories = [
    (1, "sneakers", "سنيكرز",        "ستايل الشارع كل يوم"),
    (2, "running",  "جري ورياضة",     "أداء وراحة لكل خطوة"),
    (3, "slides",   "شبشب رياضي",     "راحة سريعة بعد التمرين"),
    (4, "sandals",  "صنادل",          "تهوية وراحة في الصيف"),
    (5, "loafers",  "كاجوال",         "لُوك أنيق يناسب كل مكان"),
    (6, "boots",    "بوت",             "حماية وأناقة للشتاء"),
    (7, "kids",     "أطفال",            "راحة وحركة للصغار"),
    (8, "football", "كرة قدم",          "أداء ثابت في الملعب"),
]
cur.executemany("INSERT INTO categories (id, slug, name_ar, tagline_ar) VALUES (?,?,?,?)", categories)

# (image_index, category_id, name_ar, price, colors)
products_data = [
    (1, 1, "سنيكرز أسود كلاسيك", 1150, "أسود"),
    (2, 1, "سنيكرز أبيض رياضي خفيف", 1050, "أبيض"),
    (3, 1, "سنيكرز أسود وأبيض بربطة", 1250, "أسود، أبيض"),
    (4, 1, "سنيكرز أخضر شريط أبيض", 1180, "أخضر، أبيض"),
    (5, 1, "سنيكرز أبيض شريط أسود", 1120, "أبيض، أسود"),
    (6, 1, "سنيكرز رمادي وأسود شريط أبيض", 1220, "رمادي، أسود"),
    (7, 1, "سنيكرز أخضر غامق كلاسيك", 1290, "أخضر غامق"),
    (8, 1, "سنيكرز رمادي فاتح شريط أبيض", 1080, "رمادي فاتح"),
    (9, 1, "سنيكرز أسود وأبيض ستايل رياضي", 1340, "أسود، أبيض"),

    (10, 2, "حذاء تريل رمادي غامق", 1450, "رمادي غامق"),
    (11, 2, "حذاء تريل بقرص ربط دوار", 1650, "رمادي"),
    (12, 2, "حذاء تريل رمادي بلمسة صفراء", 1550, "رمادي، أصفر"),
    (13, 2, "حذاء جري كحلي غامق", 1380, "كحلي"),
    (14, 2, "حذاء تريل رمادي فاتح", 1420, "رمادي فاتح"),
    (15, 2, "حذاء جري رمادي بقرص ربط", 1600, "رمادي"),
    (16, 2, "حذاء تريل قوي للطرق الوعرة", 1720, "رمادي غامق"),
    (17, 2, "حذاء جري رمادي داكن مطاطي", 1390, "رمادي داكن"),

    (18, 2, "حذاء ركض أزرق فاتح بلمسة نيون", 1590, "أزرق فاتح، أخضر نيون"),
    (19, 2, "حذاء ركض رمادي بنعل أخضر نيون", 1490, "رمادي، أخضر نيون"),
    (20, 2, "حذاء ركض أبيض وأزرق خفيف", 1350, "أبيض، أزرق"),
    (21, 2, "حذاء ركض أبيض بتفاصيل نيون", 1310, "أبيض، أخضر نيون"),
    (22, 2, "حذاء ركض أزرق سماوي مريح", 1460, "أزرق سماوي"),
    (23, 2, "حذاء ركض أسود ونعل أبيض", 1280, "أسود، أبيض"),

    (24, 3, "شبشب رياضي أبيض بشعار أسود", 480, "أبيض، أسود"),
    (25, 3, "شبشب رياضي أسود كلاسيك", 420, "أسود"),
    (26, 3, "شبشب رياضي أسود بحزام مزدوج", 460, "أسود"),
    (27, 3, "شبشب رياضي أسود بلمسة حمراء", 440, "أسود، أحمر"),
    (28, 3, "شبشب رياضي أسود واسع", 400, "أسود"),
    (29, 3, "شبشب رياضي بني وبيچ", 470, "بني، بيچ"),

    (30, 4, "صندل بني وبيچ متعدد الأحزمة", 680, "بني، بيچ"),
    (31, 4, "صندل بيچ فاتح مريح", 620, "بيچ"),
    (32, 4, "صندل بني غامق كلاسيك", 650, "بني غامق"),
    (33, 4, "صندل أبيض صيفي", 590, "أبيض"),
    (34, 4, "صندل أسود وبني برباط مزدوج", 710, "أسود، بني"),
    (35, 4, "صندل بيچ وبني ناعم", 640, "بيچ، بني"),
    (36, 4, "صندل بني بحزام عريض", 670, "بني"),
    (37, 4, "صندل كحلي وبني برباط متقاطع", 700, "كحلي، بني"),
    (38, 4, "صندل رمادي برباط متقاطع", 660, "رمادي"),

    (39, 5, "حذاء لوفر أسود جلد لامع", 980, "أسود"),
    (40, 5, "حذاء لوفر سويدي كحلي", 1050, "كحلي"),
    (41, 5, "حذاء لوفر سويدي برتقالي", 1090, "برتقالي"),
    (42, 5, "حذاء لوفر سويدي أسود", 990, "أسود"),
    (43, 5, "حذاء لوفر سويدي بني", 1020, "بني"),
    (44, 5, "حذاء لوفر مخملي أسود", 1150, "أسود"),
    (45, 5, "حذاء لوفر مخملي عنابي", 1180, "عنابي"),
    (46, 5, "حذاء لوفر سويدي بيچ", 1010, "بيچ"),
]

# Curated catalogue using high-resolution Unsplash product photography.
# The database is recreated on every run, so the previous catalogue is removed.
products_data = [
    ("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85", 1, "DEVO One Runner - خمسة ألوان", 1890, "أحمر، أبيض، أسود، أزرق، أخضر"),
    ("https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=85", 1, "Court أبيض يومي", 1690, "أبيض"),
    ("https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85", 1, "Classic Canvas كاجوال", 1290, "أبيض، أسود"),
    ("https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=85", 2, "Air Run أزرق خفيف", 2190, "أزرق، أبيض"),
    ("https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85", 2, "Track Foam رمادي", 1990, "رمادي، أبيض"),
    ("https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=85", 2, "Sprint Knit أسود", 2290, "أسود"),
    ("https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=85", 3, "Flex Slides أسود", 590, "أسود"),
    ("https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1200&q=85", 3, "Cloud Slides أبيض", 650, "أبيض"),
    ("https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=85", 4, "Summer Strap بني", 890, "بني، بيچ"),
    ("https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=1200&q=85", 4, "Sandal Cross بيچ", 790, "بيچ"),
    ("https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=85", 4, "Urban Sandal أسود", 850, "أسود"),
    ("https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85", 5, "Loafer Classic بني", 1490, "بني"),
    ("https://images.unsplash.com/photo-1610398752800-146f269dfcc8?auto=format&fit=crop&w=1200&q=85", 5, "Loafer Penny أسود", 1590, "أسود"),
    ("https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=1200&q=85", 5, "Suede Casual كحلي", 1690, "كحلي"),
    ("https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1200&q=85", 1, "Street Low أبيض وأسود", 1790, "أبيض، أسود"),
    ("https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=85", 6, "Chelsea Boot جلد أسود", 2490, "أسود"),
    ("https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=85", 6, "Work Boot بني", 2290, "بني"),
    ("https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=85", 7, "Mini Court أطفال أبيض", 990, "أبيض، أزرق"),
    ("https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1200&q=85", 7, "Kids Active وردي", 890, "وردي، أبيض"),
    ("https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=85", 8, "Match Pro FG أسود", 1990, "أسود، أبيض"),
    ("https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=85", 8, "Control Turf أزرق", 1790, "أزرق، أبيض"),
]

descriptions_by_cat = {
    1: "سنيكرز يومي مريح بتصميم عصري يناسب الشارع والجامعة والخروجات، خامات متينة وتهوية ممتازة.",
    2: "حذاء رياضي مصمم للجري والتمارين، نعل ماص للصدمات ودعم قوي للقدم في كل خطوة.",
    3: "شبشب رياضي خفيف الوزن، مثالي للراحة بعد التمرين أو الاستخدام اليومي السريع.",
    4: "صندل صيفي مريح بخامات جلد وقماش عالية الجودة، تهوية ممتازة طوال اليوم.",
    5: "حذاء كاجوال أنيق يجمع بين الراحة والمظهر الراقي، مناسب للعمل والمناسبات.",
    6: "بوت عملي بخامة متينة ونعل ثابت، مناسب للأجواء الباردة والاستخدام اليومي.",
    7: "حذاء أطفال خفيف ومريح، مصمم للحركة اليومية وسهل الارتداء.",
    8: "حذاء كرة قدم بثبات جيد وتحكم مريح، مناسب للتدريب والمباريات.",
}

rows = []
# لكل لون صورة قابلة للعرض. الصور الموجودة هي صور المنتجات المتاحة حاليًا؛
# يستطيع المدير لاحقًا استبدال كل مسار بصورة اللون المطابق لنفس الموديل.
color_sources = {}
for image_path, _cat_id, _name, _price, product_colors in products_data:
    for color in product_colors.replace("،", ",").split(","):
        color_sources.setdefault(color.strip(), image_path)

for product_index, (image, cat_id, name, price, colors) in enumerate(products_data, start=1):
    old_price = round(price * 1.2, -1) if product_index in {1, 4, 7, 10, 13} else None
    is_new = 1 if product_index in {1, 6, 11, 15} else 0
    is_featured = 1 if product_index in {1, 2, 4, 5, 9, 12, 15} else 0
    rating = {1: 4.8, 2: 4.7, 3: 4.9, 4: 4.6, 5: 4.8, 6: 4.7, 7: 4.8, 8: 4.6}[cat_id]
    reviews = 24 + (product_index * 7 % 96)
    stock = 8 + (product_index * 3 % 25)
    sizes = "38,39,40,41,42,43,44,45" if cat_id in (1, 2, 5) else "38,39,40,41,42,43,44"
    image = image
    product_colors = [color.strip() for color in colors.replace("،", ",").split(",")]
    color_images = "|".join(f"{color}={color_sources.get(color, image)}" for color in product_colors)
    if product_index == 1:
        color_images = "|".join([
            f"أحمر={image}",
            "أبيض=https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=85",
            "أسود=https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=85",
            "أزرق=https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=85",
            "أخضر=https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85",
        ])
    rows.append((name, cat_id, price, old_price, sizes, colors, color_images, "DEVO", descriptions_by_cat[cat_id],
                 image, rating, reviews, is_new, is_featured, stock))

cur.executemany("""
    INSERT INTO products (name_ar, category_id, price, old_price, sizes, colors, color_images, brand, description_ar,
                           image, rating, reviews, is_new, is_featured, stock)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
""", rows)

conn.commit()

cur.execute("SELECT COUNT(*) FROM products")
print("products:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM categories")
print("categories:", cur.fetchone()[0])

conn.close()
print("DB built at", DB_PATH)
