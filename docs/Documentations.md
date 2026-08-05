# luvlog — Documentations

Tài liệu kỹ thuật chính thức của dự án. Cập nhật song song với mọi thay đổi code.

---

## 1. Kiến trúc

```
[Frontend — Vercel Static]
  https://luvlog-frontend.vercel.app
            |
       fetch (credentials: include)
            |
[Backend — Vercel Serverless]
  https://luvlog.vercel.app
            |
[Supabase PostgreSQL — Connection Pooler :6543]
```

- **2 project Vercel riêng:** 1 cho `frontend/`, 1 cho `backend/`
- **Auth:** session cookie ký bằng `itsdangerous` (Starlette SessionMiddleware)
- **Cross-origin cookie:** `SameSite=None; Secure` (frontend và backend khác subdomain)

---

## 2. API Reference

Base URL: `https://luvlog.vercel.app`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/health` | Không | Health check |
| GET | `/api/me` | Không | Trả về `{ "user": "..." \| null }` |
| POST | `/api/login` | Không | Body: `{ username, password }` → session cookie |
| POST | `/api/logout` | Không | Xóa session |
| GET | `/api/message` | Có | Lấy lời nhắn mới nhất |
| POST | `/api/message` | Có | Body: `{ content }` → lưu lời nhắn mới |
| GET | `/api/journal` | Có | Danh sách nhật ký (mới nhất trước) |
| POST | `/api/journal` | Có | Body: `{ title, content }` → tạo bài viết |
| POST | `/api/photos` | Có | Form-data: `album`, `file` → upload ảnh, lưu URL |
| GET | `/api/photos` | Có | Danh sách ảnh (mới nhất trước) |
| GET | `/api/fund` | Có | Số dư tổng + danh sách mục tiêu (kèm tiến độ) + giao dịch |
| POST | `/api/fund/transactions` | Có | Body: `{ amount, description, goal_id? }` |
| DELETE | `/api/fund/transactions/{id}` | Có | Xoá 1 giao dịch |
| POST | `/api/fund/goals` | Có | Body: `{ name, target_amount }` |
| DELETE | `/api/fund/goals/{id}` | Có | Xoá 1 mục tiêu |
| GET | `/api/activities` | Có | Danh sách hoạt động (mới nhất trước) |
| POST | `/api/activities` | Có | Body: `{ place_name, category, visited_at, note? }` |
| DELETE | `/api/activities/{id}` | Có | Xoá 1 hoạt động |


### Ví dụ

```javascript
// Đăng nhập
await fetch("https://luvlog.vercel.app/api/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "...", password: "..." }),
});

// Gọi API cần auth
await fetch("https://luvlog.vercel.app/api/message", {
  credentials: "include",
});
```

---

## 3. Biến môi trường (Backend)

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | Có | Supabase Postgres pooler, cổng **6543** |
| `SESSION_SECRET` | Có | Key ký session cookie |
| `ADMIN1_USER` | Có | Tên đăng nhập tài khoản 1 |
| `ADMIN1_PASS_HASH` | Có | Bcrypt hash mật khẩu tài khoản 1 |
| `ADMIN2_USER` | Có | Tên đăng nhập tài khoản 2 |
| `ADMIN2_PASS_HASH` | Có | Bcrypt hash mật khẩu tài khoản 2 |
| `SUPABASE_URL` | Có | URL project Supabase (dùng cho Storage) |
| `SUPABASE_SECRET_KEY` | Có | Service role key — toàn quyền, không đưa vào frontend |

Mẫu: `backend/.env.example`

### Tạo bcrypt hash

```powershell
python -c "import bcrypt; print(bcrypt.hashpw(b'mat-khau-cua-ban', bcrypt.gensalt()).decode())"
```

Set trên Vercel: Project backend → Settings → Environment Variables.

---

## 4. Database

**Bảng `messages`**

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `content` | String | Nội dung lời nhắn |
| `updated_at` | DateTime | Thời điểm tạo (UTC) |

Schema tự tạo qua `Base.metadata.create_all()` trong `database.py` lúc khởi động.

**Bảng `journals`**

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `title` | String | Tiêu đề bài viết |
| `content` | String | Nội dung |
| `author` | String | Tên user đăng nhập |
| `created_at` | DateTime | Thời điểm tạo (UTC) |

**Bảng `photos`**

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `album` | String | Tên album |
| `url` | String | Public URL ảnh trên Supabase Storage |
| `uploaded_by` | String | Tên user upload |
| `created_at` | DateTime | Thời điểm tạo (UTC) |

**Bảng `fund_goals`**

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | |
| `name` | String | Tên mục tiêu |
| `target_amount` | Integer | Số tiền mục tiêu (VNĐ) |
| `created_at` | DateTime | |

**Bảng `fund_transactions`**

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | |
| `amount` | Integer | Dương = thu, âm = chi |
| `description` | String | |
| `goal_id` | Integer FK (nullable) | Thuộc mục tiêu nào, trống = quỹ chung |
| `created_by` | String | |
| `created_at` | DateTime | |

**Bảng `activities`**

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | |
| `place_name` | String | |
| `category` | String | `an_uong` / `vui_choi` / `khac` |
| `note` | String | |
| `visited_at` | DateTime | |
| `created_by` | String | |

---

## 5. Frontend

| File | Vai trò |
|---|---|
| `index.html` | Layout: form login + app (counter + lời nhắn + nhật ký) |
| `js/counter.js` | Đồng hồ đếm ngày yêu (client-side) |
| `js/message.js` | Auth flow + gọi API lời nhắn |
| `js/journal.js` | Form nhập + timeline nhật ký |
| `css/style.css` | Giao diện |
| `js/photos.js` | Form upload + hiển thị lưới ảnh theo album |
| `js/fund.js` | Quỹ chung: mục tiêu (theo dõi riêng) + giao dịch thu/chi |
| `js/activities.js` | Form + danh sách hoạt động đôi, đếm trùng địa điểm |

**Luồng auth frontend:**
1. Load trang → gọi `/api/me`
2. Có user → hiện app; không → hiện form login
3. Submit login → `/api/login` → hiện app
4. Mọi request API dùng `credentials: "include"`

---

## 6. Deploy

### Backend (Vercel)
- Root directory: `backend/`
- Entrypoint: `main.py` (Vercel tự nhận FastAPI)
- Env vars: xem mục 3

### Frontend (Vercel)
- Root directory: `frontend/`
- Static deploy, không cần build step
- `API_BASE` trong `js/message.js` và `js/journal.js` trỏ tới URL backend

### CORS
Backend chỉ cho phép origin `https://luvlog-frontend.vercel.app`. Thêm origin mới khi dev local hoặc đổi domain.

---

## 7. Lộ trình

| Giai đoạn | Trạng thái |
|---|---|
| 0 — Trang tĩnh | ✅ |
| 0.5 — Git + GitHub | ✅ |
| 1 — Backend local | ✅ |
| 1.5 — Vercel + Supabase | ✅ |
| 2 — Đăng nhập bảo mật | ✅ |
| 3 — Nhật ký & Timeline | ✅ |
| 4 — Album ảnh | ⏳ |
| 5 — Quỹ chung | ⏳ |
| 6 — Media Hub + Cron | ⏳ |
| 7 — Gamification + Mobile | ⏳ |

## 7.5. Known Issues (chưa sửa, để sau)

- **Lag khi load lời nhắn lúc refresh trang:** `loadMessage()` gọi `/api/message` mất một khoảng chờ trước khi hiện nội dung, gây cảm giác giật. Ghi nhận từ 04/08/2026, chưa ảnh hưởng chức năng, sẽ tối ưu sau khi các tính năng chính hoàn thiện (khả năng do cold start Vercel Serverless — sẽ xác nhận và sửa ở giai đoạn polish cuối).

Chi tiết: [docs/KE-HOACH-DU-AN.md](./docs/KE-HOACH-DU-AN.md)

---

## 8. Changelog

### v0.6 — Quỹ chung & Hoạt động đôi (05/08/2026)
- Bảng `fund_goals`, `fund_transactions` (có `goal_id`, mỗi mục tiêu theo dõi tiến độ riêng), `activities`
- Backend: CRUD đầy đủ cho cả 3 (thêm + xoá)
- Frontend: form quỹ (chọn mục tiêu khi góp/chi), form hoạt động (phân loại, đếm trùng địa điểm tự động)
- Fix: thiếu `from datetime import datetime` trong `main.py` gây lỗi 500 ở `/api/activities` (hiển thị nhầm thành lỗi CORS)

### v0.5 — Album ảnh (05/08/2026)
- Bucket `photos` trên Supabase Storage (public)
- Backend: `POST/GET /api/photos`, dùng Service Role Key để upload (bỏ qua RLS)
- Frontend: form upload + lưới hiển thị ảnh theo album

### v0.4 — Nhật ký & Timeline (04/08/2026)
- Bảng `journals` trên Supabase PostgreSQL
- API `GET/POST /api/journal`
- Form nhập tiêu đề + nội dung, timeline hiển thị mới nhất trước

### v0.3 — Đăng nhập frontend (04/08/2026)
- Form login/logout trên frontend
- `credentials: 'include'` cho mọi API call
- Session cookie cross-origin (`SameSite=None`)
- Tạo `README.md`, `Documentations.md`, `backend/.env.example`

### v0.2 — Hạ tầng Vercel + Supabase (trước 04/08/2026)
- Deploy backend FastAPI lên Vercel
- Deploy frontend lên Vercel
- Chuyển database sang Supabase PostgreSQL
- Backend auth: session + bcrypt

### v0.1 — Backend cơ bản (trước 04/08/2026)
- Trang tĩnh đếm ngày yêu
- API lời nhắn hôm nay
- FastAPI + SQLite local

---

## 9. Quy ước cập nhật docs

Mỗi khi thêm/sửa tính năng, cập nhật **cùng lúc**:

1. `Documentations.md` — API, env, changelog (mục 8)
2. `README.md` — trạng thái hiện tại, cấu trúc nếu đổi
3. `docs/KE-HOACH-DU-AN.md` — bảng trạng thái giai đoạn
