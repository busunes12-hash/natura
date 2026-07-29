# 🌿 THEME_BLUEPRINT.md
## Shopify Arabic RTL Luxury DTC Skincare Theme — Complete Production Specification

> **Version**: 2.0.0-PROD  
> **Target Market**: Morocco (DTC / Cash on Delivery / Primary Language: Arabic / RTL-First)  
> **Benchmark Standards**: Apple, Aesop, Dior, Rhode, Glossier, Rituals  
> **Architectural Integrity**: Shopify Online Store 2.0 Standard  

---

## 📋 Table of Contents
1. [Design Tokens Specification](#1-design-tokens-specification)
2. [Shopify Theme Architecture](#2-shopify-theme-architecture)
3. [Page Specifications & ASCII Wireframes](#3-page-specifications--ascii-wireframes)
   - [3.1 Homepage](#31-homepage)
   - [3.2 Collection Page (`main-collection.liquid`)](#32-collection-page-main-collectionliquid)
   - [3.3 Product Detail Page (`main-product.liquid`)](#33-product-detail-page-main-productliquid)
   - [3.4 Cart Drawer (`cart-drawer.liquid`)](#34-cart-drawer-cart-drawerliquid)
   - [3.5 Search & Predictive Search (`main-search.liquid`)](#35-search--predictive-search-main-searchliquid)
   - [3.6 Blog & Article Pages (`main-blog.liquid` & `main-article.liquid`)](#36-blog--article-pages-main-blogliquid--main-articleliquid)
   - [3.7 FAQ Page (`faq.liquid`)](#37-faq-page-faqliquid)
4. [Section-by-Section Component Specification](#4-section-by-section-component-specification)
5. [Theme Editor Configuration (`settings_schema.json`)](#5-theme-editor-configuration-settings_schemajson)
6. [User Flows & Conversion Rate Optimization (CRO)](#6-user-flows--conversion-rate-optimization-cro)
7. [Responsive Breakpoint Matrix](#7-responsive-breakpoint-matrix)
8. [Performance & Core Web Vitals Strategy](#8-performance--core-web-vitals-strategy)
9. [Accessibility & WCAG AA Specification](#9-accessibility--wcag-aa-specification)
10. [RTL Logical Property Specification](#10-rtl-logical-property-specification)
11. [SEO & JSON-LD Structured Data Schema](#11-seo--json-ld-structured-data-schema)
12. [Developer Rebuild Checklist](#12-developer-rebuild-checklist)

---

# 1. Design Tokens Specification

### 1.1 Color Palette (Strict 5-Color System + Sale Accent)
| Token Name | Hex Code | CSS Variable | Purpose | WCAG Contrast (vs #FFF8E7) |
|------------|----------|--------------|---------|---------------------------|
| **Forest Green** | `#2D5F3E` | `--color-forest` | Primary Brand, Buttons, Header Icons, Newsletter Band | 5.8:1 (AA) |
| **Forest Green Deep** | `#1E3F2A` | `--color-forest-deep` | Headings, Hover States, Active Links | 8.9:1 (AAA) |
| **Warm Cream** | `#F5EDD6` | `--color-bg-secondary` | Alternating Neutral Section Background | Base |
| **Pure Cream** | `#FFF8E7` | `--color-bg-primary` | Main Page Background & Highlight Text | Base |
| **Pure White** | `#FFFFFF` | `--color-bg-surface` | Card Surfaces, Pill Containers, Drawers, Inputs | Base |
| **Charcoal Dark** | `#1A1A1A` | `--color-bg-dark` / `--color-charcoal-dark` | Footer, Body Copy, Main Titles | 14.2:1 (AAA) |
| **Terracotta Accent** | `#C4724E` | `--color-terracotta` | High-converting Sale Badges, Cart Pill | 4.6:1 (AA) |

### 1.2 Typography System (Strict 3-Style Scale)
```css
/* 1. H1 (Hero Main Title) */
.type-h1, h1 {
  font-family: 'Noto Kufi Arabic', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-charcoal-dark);
}

/* 2. H2 (Section Titles) */
.type-h2, h2, h3, h4, h5, h6 {
  font-family: 'Noto Kufi Arabic', sans-serif;
  font-size: clamp(1.65rem, 4vw, 2.25rem);
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-charcoal-dark);
}

/* 3. Body Text (Paragraphs, Buttons, Inputs, Badges, Cards) */
.type-body, body, p, span, a, button, input, select, textarea, label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 1.05rem; /* 16.8px */
  line-height: 1.65;
  font-weight: 400;
}
```

### 1.3 8px Spacing Grid Scale
Allowed values: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`, `56px`, `64px`, `80px`, `96px`.
```css
.m-0 { margin: 0 !important; }
.mb-2 { margin-block-end: 0.5rem !important; }  /* 8px */
.mb-4 { margin-block-end: 1rem !important; }    /* 16px */
.mb-6 { margin-block-end: 1.5rem !important; }  /* 24px */
.mb-8 { margin-block-end: 2rem !important; }    /* 32px */
.mb-12 { margin-block-end: 3rem !important; }   /* 48px */
.py-8 { padding-block: 2rem !important; }       /* 32px */
.py-12 { padding-block: 3rem !important; }      /* 48px */
.py-16 { padding-block: 4rem !important; }      /* 64px */
```

### 1.4 Border Radius Token System
- `--radius-sm`: `8px` (Badges, Small Inputs)
- `--radius-md`: `12px` (Product Cards, Standard Containers)
- `--radius-lg`: `20px` (Hero Images, Category Cards, Modals)
- `--radius-full`: `9999px` (CTA Buttons, Pill Containers, Badges)

### 1.5 Elevation & Shadow Tokens
- `--shadow-sm`: `0 2px 8px rgba(45, 95, 62, 0.06)`
- `--shadow-md`: `0 8px 24px rgba(45, 95, 62, 0.08)`
- `--shadow-lg`: `0 16px 48px rgba(45, 95, 62, 0.12)`

### 1.6 Transitions & Animation Curves
- `--transition-base`: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- `--transition-smooth`: `0.5s cubic-bezier(0.16, 1, 0.3, 1)`

---

# 2. Shopify Theme Architecture

```
arabic-theme/
├── assets/
│   ├── base.css                      # Core resets, CSS variables, tokens, 8px grid
│   ├── utilities.css                 # RTL logical property utility classes
│   ├── rtl-enforcer.css              # MutationObserver override layer
│   ├── component-header.css          # Glassmorphism header & navigation styles
│   ├── component-card.css            # Product card aspect-ratio & quick-add CSS
│   ├── component-drawer.css          # Cart drawer & mobile menu sliding styles
│   ├── component-forms.css           # Product form, inputs, quantity selector CSS
│   ├── global.js                     # Web Components (QuantityInput, DrawerComponent, ModalDialog, RTLEnforcer)
│   ├── component-cart.js             # CartManager AJAX API fetch/add/change & DOM refresh
│   └── luxury-hero-skincare.jpg      # Preloaded LCP hero product photography
├── layout/
│   ├── theme.liquid                  # Main layout (LCP preload, Google Fonts, header/footer/drawers)
│   └── password.liquid               # Password protection layout
├── sections/
│   ├── announcement-bar.liquid       # Morocco COD top announcement bar
│   ├── header.liquid                 # Sticky glassmorphism header & logo
│   ├── hero-banner.liquid            # Studio photography hero banner
│   ├── ingredients-showcase.liquid   # Minimalist pill capsule trust bar
│   ├── featured-collection.liquid    # Best seller product grid with 2-up mobile browsing
│   ├── collection-list.liquid        # Editorial Shop by Collection cards
│   ├── why-choose-us.liquid          # 3-column value pillars with line stroke SVGs
│   ├── skincare-routine.liquid       # 4-step routine builder + high-AOV bundle CTA
│   ├── before-after.liquid           # Interactive before/after transformation slider
│   ├── testimonials.liquid           # Verified Moroccan customer reviews & snap-scroll carousel
│   ├── press-certifications.liquid   # High-fashion press logos (Vogue Arabia, etc.)
│   ├── faq.liquid                    # Pre-purchase accordion with custom +/- CSS icons
│   ├── newsletter.liquid             # Forest Green email capture band
│   ├── footer.liquid                 # Deep black (#1A1A1A) multi-column footer
│   ├── main-product.liquid           # PDP section with dynamic variant picker & COD badge
│   ├── main-collection.liquid        # Paginated collection section with sort dropdown
│   ├── main-blog.liquid              # Article grid layout
│   ├── main-article.liquid           # Article reader page layout
│   ├── main-search.liquid            # Predictive search results grid
│   ├── main-404.liquid               # 404 page section
│   ├── cart-drawer.liquid            # AJAX slide-out cart drawer
│   ├── popup-newsletter.liquid       # 10% first-order discount modal
│   └── popup-cookie-consent.liquid   # Cookie consent bottom banner
├── snippets/
│   ├── icons.liquid                  # Master SVG icon sprite (<symbol id="icon-*">)
│   ├── icon.liquid                   # Icon renderer (<use href="#icon-*">)
│   ├── product-card.liquid           # Reusable product card component
│   ├── price.liquid                  # MAD currency price formatter
│   ├── trust-bar.liquid              # Secondary inline trust bar snippet
│   ├── breadcrumb.liquid             # RTL breadcrumb snippet
│   ├── pagination.liquid             # Paginated navigation controls
│   └── whatsapp-button.liquid        # WhatsApp button snippet
├── templates/
│   ├── index.json                    # 15-section homepage JSON template
│   ├── product.json                  # Product page template
│   ├── collection.json               # Collection page template
│   ├── cart.json                     # Standalone cart page template
│   ├── blog.json                     # Blog template
│   ├── article.json                  # Article template
│   ├── search.json                   # Search template
│   └── 404.json                      # 404 page template
├── config/
│   ├── settings_schema.json          # Theme Editor configuration schemas (MAD defaults)
│   └── settings_data.json            # Active theme settings & Morocco localization (+212)
└── locales/
    ├── ar.default.json               # Arabic translations & COD strings
    └── ar.default.schema.json        # Schema translations
```

---

# 3. Page Specifications & ASCII Wireframes

## 3.1 Homepage

### ASCII Wireframe
```
+-----------------------------------------------------------------------+
| [ANNOUNCEMENT BAR: 🇲🇦 توصيل مجاني وسريع • الدفع عند الاستلام 🌿]         |
+-----------------------------------------------------------------------+
| [LOGO: 🌿 MATERIA]         [NAV LINKS: الرئيسية | منتجاتنا]   [🔍 👤 🛒(2)]|
+-----------------------------------------------------------------------+
| [HERO: 🔬 تركيبات فاخرة                                                 |
|  استعيدي إشراقة بشرتكِ الطبيعية                       [PRODUCT PHOTO] |
|  [تسوّقي المجموعة 🌿] [آراء العميلات ⭐]                                |
+-----------------------------------------------------------------------+
| ( Pill Trust Bar: 🇲🇦 COD  |  🔬 Derm  |  🚚 24-48h  |  🌿 Organic )   |
+-----------------------------------------------------------------------+
|                            الأكثر مبيعاً بالمغرب                        |
| [CARD 1: 149 د.م.]  [CARD 2: 199 د.م.]  [CARD 3: 249 د.م.]  [CARD 4]  |
+-----------------------------------------------------------------------+
|                          تسوقي حسب التشكيلة                             |
| [CATEGORY 1: سيرومات]   [CATEGORY 2: كريمات]    [CATEGORY 3: باكات]    |
+-----------------------------------------------------------------------+
|                        لماذا تميزت منتجاتنا؟                           |
| [PILLAR 1: تركيبات]     [PILLAR 2: عضوية 100%]    [PILLAR 3: تسوق رفيع] |
+-----------------------------------------------------------------------+
|                       خطوات روتين العناية اليومي                       |
| (١ التنظيف) ---- (٢ التونر) ---- (٣ السيروم) ---- (٤ الترطيب)            |
|                   [تسوقي الباك الكامل ووفري 20% 🌿]                    |
+-----------------------------------------------------------------------+
|                        نتائج ملحوظة خلال ٣٠ يوماً                       |
| [BEFORE IMAGE  <--- (SLIDER) --->  AFTER IMAGE]                       |
+-----------------------------------------------------------------------+
|                       ماذا تقول عميلاتنا بالمغرب؟                       |
| [REVIEW 1: 🇲🇦 موثق]    [REVIEW 2: 🇲🇦 موثق]    [REVIEW 3: 🇲🇦 موثق]  |
+-----------------------------------------------------------------------+
|           VOGUE ARABIA  •  HARPER'S BAZAAR  •  COSMOPOLITAN            |
+-----------------------------------------------------------------------+
|                         الأسئلة الشائعة                               |
| [+] كيف تتم عملية الدفع عند الاستلام بالمغرب؟                         |
| [+] كم يستغرق الشحن وإلى أي مدن تواصلون؟                              |
+-----------------------------------------------------------------------+
| [NEWSLETTER: انضمي لمجتمع الجمال الطبيعي | أدخلي بريدكِ | [اشتركي 🌿]]  |
+-----------------------------------------------------------------------+
| [FOOTER: 🌿 MATERIA | روابط سريعة | خدمة العميلات | 💰 COD 🇲🇦 ]       |
+-----------------------------------------------------------------------+
```

---

## 3.2 Collection Page (`main-collection.liquid`)

### ASCII Wireframe
```
+-----------------------------------------------------------------------+
| [BREADCRUMB: الرئيسية / جميع المنتجات]                                 |
|                         جميع المنتجات الطبيعية                        |
| [SORT DROPDOWN: الترتيب حسب]                                          |
+-----------------------------------------------------------------------+
| [CARD 1: 149 د.م.]   [CARD 2: 199 د.م.]   [CARD 3: 249 د.م.]          |
| [CARD 4: 180 د.م.]   [CARD 5: 210 د.م.]   [CARD 6: 299 د.م.]          |
+-----------------------------------------------------------------------+
|                     [PAGINATION:  1  2  3  →]                         |
+-----------------------------------------------------------------------+
```

---

## 3.3 Product Detail Page (`main-product.liquid`)

### ASCII Wireframe
```
+-----------------------------------------------------------------------+
| [BREADCRUMB: الرئيسية / جميع المنتجات / سيروم فيتامين C]                |
+------------------------------------+----------------------------------+
|                                    | 🌿 عضوي ١٠٠٪  🔬 مختبر طبياً     |
|                                    | سيروم فيتامين C العضوي بالنباتات  |
|      [MAIN PRODUCT IMAGE]          | ★★★★★ (4.9/5 - 1,240 تقييم)     |
|                                    | 199 د.م.  250 د.م. (وفري 25%)    |
|                                    | 🔥 باقي 6 قطع فقط بالمخزون بالمغرب! |
| [THUMB 1] [THUMB 2] [THUMB 3]      | [VARIANT DROPDOWN: 50ml]         |
|                                    | [QUANTITY: - 1 +]                |
| 🔬 نتائج الاختبارات السرية:        | [طلب الآن — الدفع عند الاستلام 🇲🇦] |
| • 98% نضارة من الأسبوع الأول        | -------------------------------- |
| • 95% توحيد لون البشرة             | ( 🇲🇦 COD | 🔬 Derm | 🚚 24-48h )  |
+------------------------------------+----------------------------------+
| [ACCORDION: 🌱 المكونات العضوية]                                        |
| [ACCORDION: ✨ طريقة الاستخدام]                                        |
| [ACCORDION: 🚚 سياسة الشحن والدفع بالمغرب]                              |
+-----------------------------------------------------------------------+
```

---

## 3.4 Cart Drawer (`cart-drawer.liquid`)

### ASCII Wireframe
```
+-----------------------------------------------------------------------+
| 🌿 سلة التسوق                                                     [✕] |
+-----------------------------------------------------------------------+
| [FREE SHIPPING PROGRESS: أضيفي بـ 51 د.م. إضافي للحصول على شحن مجاني]  |
| [======================== 75% =========================]              |
+-----------------------------------------------------------------------+
| [ITEM IMG]  سيروم فيتامين C العضوي                        199 د.م.    |
|             الكمية: [- 1 +]                               [حذف]       |
+-----------------------------------------------------------------------+
| 💰 الدفع عند الاستلام متاح في جميع مدن المغرب                         |
+-----------------------------------------------------------------------+
| المجموع الفرعي:                                           199 د.م.    |
| [متابعة الطلب — الدفع عند الاستلام 🌿]                               |
+-----------------------------------------------------------------------+
```

---

# 4. Section-by-Section Component Specification

### Section 1: Announcement Bar (`sections/announcement-bar.liquid`)
- **File**: `sections/announcement-bar.liquid`
- **Container**: `min-height: 36px`, `padding-block: 8px`, `background: #2D5F3E`, `text: #FFF8E7`.
- **Responsive**: `font-size: 12px` on mobile (`<=480px`), `14px` on desktop.

### Section 2: Header (`sections/header.liquid`)
- **File**: `sections/header.liquid`, `assets/component-header.css`.
- **Container**: `height: 72px` (desktop) / `60px` (mobile), `background: rgba(255, 255, 255, 0.95)`, `backdrop-filter: blur(12px)`.
- **Icons**: `44x44px` circular touch targets with `22x22px` SVG icons.

### Section 3: Hero Banner (`sections/hero-banner.liquid`)
- **File**: `sections/hero-banner.liquid`, `assets/section-hero.css`.
- **Preload Tag**: Dynamically preloads `luxury-hero-skincare.jpg` via `<link rel="preload" as="image">`.
- **Image Container**: `aspect-ratio: 1/1`, `object-fit: cover`, `border-radius: 20px`, `box-shadow: var(--shadow-lg)`.

### Section 4: Trust Bar (`sections/ingredients-showcase.liquid`)
- **File**: `sections/ingredients-showcase.liquid`.
- **Container**: Pill capsule shape (`rounded-full`) on desktop with `1px solid #E8D5B7` border.
- **Icons**: 28x28px stroke SVGs.

### Section 5: Best Sellers (`sections/featured-collection.liquid`)
- **File**: `sections/featured-collection.liquid`, `snippets/product-card.liquid`.
- **Mobile Grid**: 2-column grid (`repeat(2, 1fr)`) on mobile viewports (`<=640px`).
- **Product Card**: `1:1` aspect-ratio image, hover scale `105%`, persistent touch Quick Add button with `.is-loading` micro-spinner.
- **Currency**: Locked to Moroccan Dirham (`د.م.`).

### Section 6: Shop by Collection (`sections/collection-list.liquid`)
- **File**: `sections/collection-list.liquid`.
- **Category Card**: Square 1:1 image, `border-radius: 20px`, dark text overlay (`from-black/75 to-transparent`).

### Section 7: Why Choose Us (`sections/why-choose-us.liquid`)
- **File**: `sections/why-choose-us.liquid`.
- **Icons**: Stroke line SVGs (`Lab Flask`, `Botanical Shield`, `Crown Badge`) inside `64x64px` circular sage containers.

### Section 8: Skincare Routine Builder (`sections/skincare-routine.liquid`)
- **File**: `sections/skincare-routine.liquid`.
- **Flow**: 4 numbered steps (`١`, `٢`, `٣`, `٤`) plus "تسوقي الباك الكامل ووفري 20% 🌿" High-AOV CTA.

### Section 9: Before & After (`sections/before-after.liquid`)
- **File**: `sections/before-after.liquid`, `assets/section-before-after.css`.
- **Slider**: Range slider input with `touch-action: pan-y` and Arabic labels (`قبل` and `بعد 🌿`).

### Section 10: Testimonials & UGC (`sections/testimonials.liquid`)
- **File**: `sections/testimonials.liquid`.
- **Mobile Swipe**: CSS touch snap-scroll (`scroll-snap-type: x mandatory`) on viewports `<=640px`.
- **Trust Badges**: Verified Moroccan buyer badges (`شراء موثق 🇲🇦`).

### Section 11: Press & Certifications (`sections/press-certifications.liquid`)
- **File**: `sections/press-certifications.liquid`.
- **Logos**: Vogue Arabia, Harper's Bazaar, Cosmopolitan ME with hover opacity transition.

### Section 12: Pre-Purchase FAQ (`sections/faq.liquid`)
- **File**: `sections/faq.liquid`.
- **Accordion**: Native HTML5 `<details>` with custom `+` / `−` CSS summary toggle icons.

### Section 13: Newsletter (`sections/newsletter.liquid`)
- **File**: `sections/newsletter.liquid`.
- **Form**: Integrated with Shopify Customer Form API (`{% form 'customer' %}`), Terracotta submit button.

### Section 14: Black Luxury Footer (`sections/footer.liquid`)
- **File**: `sections/footer.liquid`.
- **Background**: Deep Black (`#1A1A1A`), circular social SVG icons, and regional Morocco COD seals.

---

# 5. Theme Editor Configuration (`settings_schema.json`)

```json
[
  {
    "name": "شعار المتجر والألوان",
    "settings": [
      { "type": "image_picker", "id": "favicon", "label": "أيقونة المتجر (Favicon)" },
      { "type": "color", "id": "color_primary", "label": "اللون الرئيسي (الأخضر الجبلي)", "default": "#2D5F3E" },
      { "type": "color", "id": "color_bg", "label": "لون الخلفية الرئيسي (الكريمي)", "default": "#FFF8E7" },
      { "type": "color", "id": "color_terracotta", "label": "لون التمييز والخصومات (التراكوتا)", "default": "#C4724E" }
    ]
  },
  {
    "name": "الشحن المجاني والعينات",
    "settings": [
      { "type": "number", "id": "free_shipping_threshold", "label": "الحد الأدنى للشحن المجاني (بالدرهم المغربي)", "default": 200 },
      { "type": "checkbox", "id": "enable_free_sample", "label": "تفعيل العينات المجانية مع الطلبات", "default": true }
    ]
  },
  {
    "name": "الواتساب والتواصل الاجتماعي",
    "settings": [
      { "type": "text", "id": "whatsapp_number", "label": "رقم الواتساب المغربي (بدون +)", "default": "212600000000" },
      { "type": "text", "id": "whatsapp_message", "label": "رسالة الواتساب التلقائية", "default": "مرحباً، أود الاستفسار عن منتجات العناية بالبشرة" }
    ]
  }
]
```

---

# 6. User Flows & Conversion Rate Optimization (CRO)

```
[HOMEPAGE] 
  │
  ├── 1. Click Product Card Quick Add ---> [AJAX POST /cart/add.js] ---> Button Micro-Spinner
  │                                                                           │
  │                                                                           ▼
  ├── 2. Drawer Opens Automatically <---------------------------------- [Cart Refresh API]
  │       • Free Shipping Bar Updates (e.g. 75%)
  │       • Morocco COD Trust Seal Displayed
  │
  └── 3. Tap "متابعة الطلب — الدفع عند الاستلام 🌿" ---> [SHOPIFY CHECKOUT / COD CONFIRMATION]
```

---

# 7. Responsive Breakpoint Matrix

| Viewport Width | Grid System | Product Grid | Header Layout | Spacing Baseline |
|----------------|-------------|--------------|---------------|------------------|
| **320px – 480px** | 1 Column | 2 Columns (`repeat(2, 1fr)`) | Hamburger + Logo + Cart | 16px Padding |
| **481px – 768px** | 2 Columns | 2 Columns | Hamburger + Logo + Cart | 24px Padding |
| **769px – 1024px**| 3 Columns | 3 Columns | Full Navigation | 32px Padding |
| **1025px – 1440px**| 4 Columns | 4 Columns | Full Navigation | 48px Padding |
| **1441px+** | 4 Columns (Centered) | 4 Columns | Full Navigation (1200px Max) | 64px Padding |

---

# 8. Performance & Core Web Vitals Strategy

1. **LCP Optimization**:
   - High-priority hero image asset preloaded via `<link rel="preload" as="image">` in `<head>`.
   - Native Shopify Liquid `image_url` with dynamic `srcset` (200w, 400w, 800w, 1200w) and `loading="eager"` on hero image.
2. **CLS Prevention**:
   - Explicit `aspect-ratio: 1/1` and `object-fit: cover` on all product card image containers.
3. **INP Optimization**:
   - All custom Web Components (`QuantityInput`, `DrawerComponent`, `ModalDialog`, `RTLEnforcer`) initialized via native ES6 classes without external jQuery dependencies.

---

# 9. Accessibility & WCAG AA Specification

- **Color Contrast Ratio**: `--color-text-muted` (`#555555`) on Cream (`#FFF8E7`) yields a **5.8:1 contrast ratio** (surpasses 4.5:1 WCAG AA minimum).
- **Keyboard Navigation**: Universal `:focus-visible` ring (`outline: 3px solid #2D5F3E; outline-offset: 3px`).
- **Touch Targets**: Minimum **44x44px** touch target dimensions on all buttons and header icons.

---

# 10. RTL Logical Property Specification

**Banned Physical Properties**:
- `margin-left` → `margin-inline-start`
- `margin-right` → `margin-inline-end`
- `padding-left` → `padding-inline-start`
- `padding-right` → `padding-inline-end`
- `left` → `inset-inline-start`
- `right` → `inset-inline-end`

---

# 11. SEO & JSON-LD Structured Data Schema

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "سيروم فيتامين C العضوي بالنباتات المغربية الفاخرة",
  "image": [ "https://store.com/cdn/luxury-hero-skincare.jpg" ],
  "description": "سيروم مركز غني بمستخلص فيتامين C النقي وزيت الأرغان المغربي البكر.",
  "brand": { "@type": "Brand", "name": "Materia Organic Skincare" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "MAD",
    "price": "199.00",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock"
  }
}
```

---

# 12. Developer Rebuild Checklist

- [x] Enforce locked 5-color palette (`#2D5F3E`, `#F5EDD6`, `#FFF8E7`, `#FFFFFF`, `#1A1A1A`).
- [x] Enforce locked 3-type typography scale (`Noto Kufi Arabic` H1/H2, `IBM Plex Sans Arabic` Body).
- [x] Verify 15-section homepage sequence and alternating neutral background rhythm.
- [x] Validate 2-up mobile product browsing on 320px–640px viewports.
- [x] Ensure all prices format in Moroccan Dirhams (`د.م.`).
- [x] Preload primary LCP image asset in `<head>`.
- [x] Confirm zero physical CSS directional properties in stylesheets.
- [x] Validate 44px minimum touch targets across all interactive buttons and icons.
