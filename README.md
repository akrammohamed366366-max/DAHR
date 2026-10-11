# DAHR — Web Architecture Foundation

DAHR is a bilingual (English / Arabic, full bidirectional RTL) luxury fragrance brand e-commerce platform.

---

## 1. Architecture Choice & Rationale

**Framework & Tooling:** React 19 + TypeScript + Vite + Tailwind CSS

### Rationale:
1. **Componentized Modularity:** Highly composable component hierarchy with isolated layout shells, views, primitives, and state.
2. **First-Class Bidirectionality (RTL/LTR):** Seamless dynamic `dir` and `lang` attribute synchronisation at the root document level, preserving layout logic and typography flow without conflicting CSS overrides.
3. **No Heavy Opinionated UI Kits:** Avoids pre-styled UI libraries (such as MUI or Bootstrap) that fight bespoke quiet-luxury aesthetics. A custom tokenized architecture (`src/tokens/`) allows future design system integration with zero friction.
4. **Lightweight & High Performance:** Fast dev builds and clean bundle output suitable for production scaling.

---

## 2. Folder Structure

```
/
├── README.md               # Architecture, folder structure, and coding standards documentation
├── index.html              # Root HTML template with synchronized meta tags
├── metadata.json           # Application identity & permissions metadata
├── package.json            # Project dependencies and build scripts
├── tsconfig.json           # TypeScript configuration with path aliases
├── vite.config.ts          # Vite bundler configuration
└── src/
    ├── main.tsx            # Application entry point
    ├── App.tsx             # Root application orchestrator
    ├── index.css           # Global CSS baseline (Tailwind imports)
    ├── types/              # Global TypeScript types, interfaces, and enums
    │   └── index.ts
    ├── tokens/             # Foundation design tokens (spacing, typography scales, layout dimensions)
    │   └── index.ts
    ├── i18n/               # Internationalization & bilingual content dictionary system
    │   ├── config.ts       # Supported locales, direction mapping, and brand constants
    │   ├── context.tsx      # I18nProvider and useI18n hook with dynamic document dir/lang updates
    │   └── locales/
    │       ├── en.ts       # English key-based translation dictionary
    │       └── ar.ts       # Arabic key-based translation dictionary
    ├── layout/             # Application structural chrome
    │   ├── AppShell.tsx    # Master viewport container (Header, Main, Footer)
    │   ├── Header.tsx      # Top bar with Latin brand identity, navigation, and locale controls
    │   └── Footer.tsx      # Global footer container
    ├── routes/             # Page route views and view outlets
    │   └── ShellView.tsx   # Foundation shell route view outlet
    ├── components/         # Reusable UI component primitives
    │   └── ui/
    │       └── LocaleSwitcher.tsx # Accessible bilingual locale switcher
    └── utils/              # Helper utilities
        └── cn.ts           # Classnames utility
```

---

## 3. Brand & Coding Standards

### Brand Identity Rule
- The brand name **must always render strictly as "DAHR"** in Latin characters across all locales and contexts.
- Never translate, transliterate (e.g. no Arabic spelling), or restyle the brand name.

### Internationalization & Directionality (i18n & RTL)
- **Zero Hardcoded Copy:** All user-facing text must be stored in `src/i18n/locales/` and retrieved via the `useI18n().t(key)` helper.
- **Direction Handling:** Switching between `en` and `ar` dynamically updates `document.documentElement.dir` (`ltr` / `rtl`) and `document.documentElement.lang`.
- **Logical Properties:** When styling layouts, prefer logical properties (such as `start`/`end` instead of hardcoded `left`/`right`) to ensure seamless RTL symmetry.

### Code Quality & Composition
- **Component Composition:** Build focused, single-responsibility components and compose them into higher-order views.
- **No Inline Styles:** Use Tailwind classes and design tokens (`src/tokens/`) for all styling.
- **Strict Typing:** All props, dictionaries, and route states must adhere to TypeScript definitions in `src/types/`.

---

## تشغيل المشروع محليًا ورفعه

### 1. تثبيت الحزم والاعتماديات
افتح الطرفية (Terminal) في مجلد المشروع ونفّذ الأمر التالي:
```bash
npm install
```

### 2. إعداد المتغيرات البيئية (Firebase Environment Variables)
انسخ ملف النماذج `.env.example` وأنشئ ملفًا جديدًا باسم `.env`:
```bash
cp .env.example .env
```
ثم افتح ملف `.env` واملأ قيم Firebase الحقيقية الخاصة بمشروعك (تجدها في: **Firebase Console > Project settings > General > Your apps**):
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APPCHECK_SITE_KEY=
VITE_ADMIN_EMAIL=your_admin_email@example.com
```

### 3. تشغيل المشروع محليًا للتجربة
لتشغيل بيئة التطوير المحلية:
```bash
npm run dev
```
سيعمل المشروع على الرابط: `http://localhost:3000`

### 4. بناء ملفات الإنتاج للاستضافة (Build)
لإنتاج الملفات الجاهزة للاستضافة والرفع:
```bash
npm run build
```
سيقوم هذا الأمر بإنشاء مجلد `dist` يحتوي على كامل الملفات الثابتة المحسّنة (HTML / JS / CSS / Assets).

### 5. الرفع والنشر على منصات الاستضافة الخارجية (Deployment)
عند النشر على أي منصة استضافة ثابتة (مثل Netlify أو Vercel أو GitHub Pages أو Firebase Hosting أو Cloudflare Pages):
- **مجلد النشر (Publish/Output Directory):** حدد مجلد `dist`
- **أمر البناء (Build Command):** `npm run build`
- **المتغيرات البيئية (Environment Variables):** نظرًا لأن ملف `.env` الحقيقي مستبعد بواسطة `.gitignore` ولن يُرفع إطلاقًا إلى مستودع GitHub لحماية مفاتيحك وأمان مشروعك، **يجب إدخال نفس المتغيرات البيئية بنفس الأسماء تمامًا (بنفس بادئة `VITE_`) داخل لوحة تحكم المنصة (Host Dashboard / Settings > Environment Variables)** حتى تتمكن المنصة من قراءتها وتضمينها أثناء عملية البناء.

