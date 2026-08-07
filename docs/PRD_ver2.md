# 🚀 LUVLOG VERSION 2 — PRD & TECHNICAL SPECIFICATION
> **Document Purpose:** Complete UI/UX Redesign, Security Enhancement & External Integrations Specification for LuvLog v2.
> **Target AI:** Claude / Vibecode AI Coder.

---

## 📌 CONTEXT & ARCHITECTURE OVERVIEW

* **Project Name:** `luvlog` (Version 2.0 Update)
* **Current Tech Stack:**
  * **Frontend & Backend Framework:** Next.js (App Router) hosted on **Vercel**.
  * **Database & Authentication:** **Supabase** (PostgreSQL, Supabase Auth, Storage, Realtime).
  * **Styling:** Tailwind CSS, Lucide Icons, Framer Motion.
* **Refactoring Objective:**
  1. Refactor and upgrade the entire UI/UX to a **Soft Romantic Minimalist Design System**.
  2. Implement strict **Role-Based Access Control (RBAC)** for exactly 2 users (Admin vs Member).
  3. Keep the existing Supabase database schema intact, adding only necessary tables/columns for external integrations.
  4. Integrate **Google Calendar API** (Auto-sync events) and **Discord Bot / Webhook** (Quick data entry via chat).

---

## I. SYSTEM DESIGN & DESIGN SYSTEM V2

### 1. Visual Style & Layout Principles
* **Layout Structure:**
  * **Desktop:** Fixed Left Sidebar Navigation (`w-64`) + Main Content Scrollable Area.
  * **Mobile / Small Screens:** Responsive layout automatically switching Left Sidebar to a **Fixed Bottom Navigation Bar**.
* **Visual Aesthetics:** Soft Minimalist / Modern Romantic.
  * **Border Radius:** Large rounding (`rounded-2xl` to `rounded-3xl` / `16px`–`24px`).
  * **Shadows:** Soft, diffused elevation (`shadow-sm`, `shadow-md` with low opacity).
* **Color Palette:**
  * **Primary Colors:** `#EC4899` (Pink), `#A855F7` (Purple), Gradient Backgrounds (`bg-gradient-to-r from-purple-500 to-pink-500`).
  * **Background Neutral:** Soft pastel tint (`#F9FAFB` or `#FFF5F7`).
  * **Card Surface:** Pure White (`#FFFFFF`).
  * **Accent Badges:** Mint Green (Budget/Savings), Warm Yellow/Orange (Wishlist/Badges), Soft Blue (Activities/Places).

### 2. Left Sidebar Navigation Component
* **Branding Header:**
  * App Icon (Gradient Heart) + Title **"LuvLog"** + Subtitle **"Không gian của hai đứa"**.
* **Navigation Menu Items (8 Active Routes):**
  1. 🏠 **Trang chủ** (`/`)
  2. 📖 **Nhật ký** (`/diary`)
  3. 🖼️ **Album** (`/album`)
  4. 👛 **Quỹ chung** (`/budget`)
  5. 📍 **Hoạt động** (`/activities`)
  6. 🎁 **Wishlist** (`/wishlist`)
  7. 🎬 **Media Hub** (`/media`)
  8. ⚙️ **Cài đặt** (`/settings`)
* **Sidebar Footer Widget:**
  * Soft pink badge with heart icon + Text: *"Made with love — Riêng tư, chỉ hai người"*.

---

## II. SECURITY & ACCESS CONTROL (AUTH GUARD)

### 1. Restricted Login Page (`/login`)
* **UI Design:** Centered glassmorphism/soft card over a romantic pastel gradient background. Heading: *"Dành riêng cho hai chúng mình"*.
* **Public Signup Ban:** Public registration is **completely disabled**. Only 2 pre-seeded accounts exist in Supabase Auth.
* **Route Middleware Guard:**
  * All internal routes (`/`, `/diary`, `/budget`, etc.) are wrapped in Next.js Middleware.
  * Unauthenticated requests are immediately redirected to `/login`.

### 2. Role-Based Access Control (RBAC)
* **Admin Role (Owner):**
  * Full CRUD access across all features.
  * Exclusive access to System Settings in `/settings` (changing credentials, API Keys, Google OAuth setup, Discord Webhooks, Database configurations).
* **Member Role (Partner):**
  * Full interaction with daily couple content (Create/Read/Update/Delete entries in Diary, Album, Budget, Activities, Wishlist, Media).
  * **Restricted:** Cannot access System/Dev settings, change login credentials, or modify API credentials.

---

## III. PAGE-BY-PAGE UI/UX SPECIFICATIONS

### 1. Dashboard / Home (`/`)
* **Hero Love Counter Banner:**
  * Large Gradient Card (Purple to Pink).
  * Bold Primary Metric: Total days together (e.g., `905 ngày`).
  * Subtitle: Start date (e.g., `Kể từ 14 tháng 2, 2024`).
  * Initials Avatar Badge: `B ❤️ N` (Bạn & Người ấy).
* **Daily Quote Card:** Soft-bordered card with sparkle icon, rendering a random daily love quote set from Settings.
* **Gamification Progress Card:**
  * Current Level display (e.g., `Cấp độ 2 • 30 điểm`).
  * Progress Bar to next level.
  * Horizontal scrollable badge collection: *Khởi đầu, Nhà văn, Nhiếp ảnh gia, Quản gia, Du hành gia, 100 ngày, Một năm...*
* **Quick Access Grid:** 6 rounded shortcut cards pointing to key modules.
* **Bottom Dual Preview Grid:**
  * **Left Column:** Recent Diary Entries snippet (`/diary`).
  * **Right Column:** Upcoming Wishlist Items snippet (`/wishlist`).

### 2. Diary Timeline (`/diary`)
* **Header:** Title + Primary Accent Action Button **"+ Thêm"**.
* **Vertical Timeline UI:**
  * Central vertical connecting line.
  * Event node icons (leaf, heart, star).
  * Diary Cards showing: Title, Date, Author Tag (`Bạn` / `Người ấy`), Text excerpt, and Action Icons (Edit/Delete).

### 3. Photo Gallery (`/album`)
* **Header:** Title + Total photo count + **"+ Thêm ảnh"** button.
* **Grouped Albums:** Categorized grid sections (e.g., `Hẹn hò · 2`, `Du lịch biển · 1`).
* **Image Card:** Square/4:3 ratio with `rounded-2xl`, smooth scale-up hover transition.

### 4. Shared Budget (`/budget`)
* **Header:** Title + Mint Green Button **"+ Thêm chi"**.
* **Metric Summary Cards (4 Cards):**
  1. *Total Spent* (Highlighted Mint Green Card).
  2. *You Spent* (Amount).
  3. *Partner Spent* (Amount).
  4. *Balance Status* (e.g., "Bạn nợ 300.000đ" in warm red/orange).
* **Category Spending Progress Bars:** Visual breakdown (Transportation, Dating, Dining...) with percentage bars.
* **Transaction List:** Category icon, transaction title, date, payer, amount, Edit/Delete controls.

### 5. Activity Planner (`/activities`)
* **Header:** Title + Primary Button **"+ Thêm"**.
* **Filter Pills:** `Tất cả (2)`, `Đi ăn`, `Du lịch (1)`, `Hẹn hò (1)`, `Giải trí`, `Thể thao`, `Sự kiện`, `Khác`.
* **Activity Card Grid:** Top pastel banner with centered icon, Category Tag, Activity Name, Location Tag, Description, Star Rating.

### 6. Wishlist (`/wishlist`)
* **Header:** Title + Warm Orange Button **"+ Thêm"**.
* **Overview Stats:** *Pending Items Count*, *Completed Items Count*, *Estimated Total Expense*.
* **Wishlist Grid Items:** Pastel icon badge, Item name, Category tags (Priority, Location, Gift...), Target Price, Action buttons (Check Complete, Edit, Delete).

### 7. Media Hub (`/media`)
* **Header:** Title + **"+ Thêm"** button.
* **Search & Filter Bar:** Media Type Dropdown (Movie/Book/Music) + Input Search Bar.
* **Recommendations Box:** Soft blue/purple card highlighting top recommendations based on combined ratings.
* **Media Poster Grid:** 2:3 vertical aspect ratio cards, Status tags (`Đã xem xong` / `Dự định`), Title, Author/Director, Star rating.

### 8. System Settings (`/settings`)
* **Couple Info Card:** DatePicker for anniversary date, Name/Nickname inputs.
* **Integrations Card (Admin Only):** Google Calendar API setup, Discord Webhook URLs, Test Notification buttons.
* **Daily Quotes Management:** List view with Add/Delete functionality for homepage random quotes.

---

## IV. EXTERNAL INTEGRATIONS (NEW)

### 1. Google Calendar Auto-Sync
* **OAuth Flow:** Google Calendar API authentication configured in `/settings`.
* **Sync Engine:** When an entry is created or updated in **Activities** (`/activities`) or **Wishlist** (`/wishlist`), trigger a API background job pushing the event directly to the shared Google Calendar (title, date/time, location, notes).

### 2. Discord Bot Chat Input
* **Backend Endpoint:** Next.js Route Handler / Supabase Edge Function to process Discord Webhooks and Slash Commands.
* **Supported Commands:**
  * `/nhatky [content]` ➔ Inserts a new row into Diary table.
  * `/quy [amount] [description] [category]` ➔ Inserts a new transaction into Budget table.
  * `/hoatdong [title] [date] [location]` ➔ Inserts a new activity record.
* **Response:** Discord Embed card confirming success and triggering Supabase Realtime update to the web app.

---

## V. IMPLEMENTATION CHECKLIST FOR CLAUDE

- [ ] **Refactor CSS System:** Apply `rounded-2xl`/`rounded-3xl`, soft shadows, pastel color variables.
- [ ] **Navigation Component:** Implement responsive Left Sidebar (Desktop) and Bottom Nav (Mobile).
- [ ] **Auth Middleware & RBAC:** Enforce Supabase auth guard on all routes; restrict `/settings` advanced controls to Admin.
- [ ] **UI Component Refactoring:** Overhaul all 8 modules (`/`, `/diary`, `/album`, `/budget`, `/activities`, `/wishlist`, `/media`, `/settings`) according to v2 specs.
- [ ] **Google Calendar Sync:** Implement Calendar API route on Activity/Wishlist mutation.
- [ ] **Discord Integration:** Build API endpoint handling Slash Commands and Webhooks.