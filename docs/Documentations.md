# luvlog — Documentations

Tài liệu kỹ thuật chính thức của dự án. Cập nhật song song với mọi thay đổi code. Tài liệu này phản ánh triển khai hiện tại của repo (10/08/2026).

---

## 1. Kiến trúc

```text
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
- **Backend chia 4 tầng:** `routers/` → `services/` → `repositories/` → `models.py`

---

## 2. API Reference

### 2.1 Mục tiêu sử dụng
- Dùng cho frontend hiện tại và bất kỳ client nào cần gọi API.
- Tất cả request cần auth dùng `credentials: "include"`.

### 2.2 Base URL
Base URL hiện tại: `https://luvlog.vercel.app`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/health` | Không | Health check |
| GET | `/api/me` | Không | Trả về `{ "user": "..." \| null }` |
| POST | `/api/login` | Không | Body: `{ username, password }` → session cookie |
| POST | `/api/logout` | Không | Xóa session |
| GET | `/api/message` | Có | Lấy lời nhắn mới nhất |
| POST | `/api/message` | Có | Body: `{ content }` → lưu lời nhắn mới |
| GET | `/api/messages` | Có | Danh sách lịch sử lời nhắn, kèm `comment_count` |
| GET | `/api/messages/{message_id}/comments` | Có | Bình luận của một lời nhắn |
| POST | `/api/messages/{message_id}/comments` | Có | Body: `{ content }` |
| GET | `/api/settings` | Có | Lấy cấu hình đôi + webhook URLs |
| POST | `/api/settings` | Có | Lưu từng phần settings (cho phép gửi partial fields) |
| POST | `/api/settings/notifications/test` | Có | Body: `{ provider: "telegram" \| "discord" }` → gửi test webhook |
| GET | `/api/quotes` | Có | Danh sách lời nhắn hằng ngày |
| GET | `/api/journal` | Có | Danh sách nhật ký (mới nhất trước) |
| POST | `/api/journal` | Có | Body: `{ title, content }` |
| GET | `/api/albums` | Có | Danh sách album |
| POST | `/api/albums` | Có | Body: `{ name }` |
| DELETE | `/api/albums/{album_id}` | Có | Xóa album nếu không còn ảnh |
| GET | `/api/photos` | Có | Danh sách ảnh, kèm `sort_order`, `caption_author`, `caption_updated_at` |
| POST | `/api/photos` | Có | Multipart: `album_id`, `file`, `file_hash` |
| PATCH | `/api/photos/{photo_id}` | Có | Body: `{ caption }` → cập nhật ghi chú + metadata người sửa/thời gian sửa |
| POST | `/api/photos/reorder` | Có | Body: `{ album_id, ordered_photo_ids[] }` |
| GET | `/api/fund` | Có | Số dư tổng + mục tiêu + giao dịch |
| POST | `/api/fund/transactions` | Có | Body: `{ amount, description, goal_id? }` |
| DELETE | `/api/fund/transactions/{id}` | Có | Xoá giao dịch |
| POST | `/api/fund/goals` | Có | Body: `{ name, target_amount }` |
| DELETE | `/api/fund/goals/{id}` | Có | Xoá mục tiêu |
| GET | `/api/activities` | Có | Danh sách hoạt động |
| POST | `/api/activities` | Có | Body: `{ place_name, category, visited_at, note? }` |
| DELETE | `/api/activities/{id}` | Có | Xoá hoạt động |
| GET | `/api/movies` | Có | Danh sách phim |
| POST | `/api/movies` | Có | Body: `{ title, cover_url?, status, external_id?, category? }` |
| PATCH | `/api/movies/{id}` | Có | Body: `{ status, rating?, review?, experienced_at? }` |
| DELETE | `/api/movies/{id}` | Có | Xoá phim |
| GET | `/api/books` | Có | Danh sách sách |
| POST | `/api/books` | Có | Body: `{ title, cover_url?, status, external_id?, category? }` |
| PATCH | `/api/books/{id}` | Có | Body: `{ status, rating?, review?, experienced_at? }` |
| DELETE | `/api/books/{id}` | Có | Xoá sách |
| GET | `/api/songs` | Có | Danh sách nhạc |
| POST | `/api/songs` | Có | Body: `{ title, cover_url?, status }` |
| PATCH | `/api/songs/{id}` | Có | Body: `{ status, rating?, review?, experienced_at? }` |
| DELETE | `/api/songs/{id}` | Có | Xoá nhạc |
| GET | `/api/search/movies?q=` | Có | Tìm phim qua TMDB |
| GET | `/api/search/books?q=` | Có | Tìm sách qua Google Books |
| GET | `/api/suggestions/{media_type}` | Có | Danh sách gợi ý phim/sách |
| POST | `/api/suggestions/{suggestion_id}/accept` | Có | Chấp nhận gợi ý |
| DELETE | `/api/suggestions/{suggestion_id}` | Có | Bỏ qua gợi ý |
| POST | `/api/movies/refresh-suggestions` | Có | Làm mới gợi ý phim |
| POST | `/api/books/refresh-suggestions` | Có | Làm mới gợi ý sách |
| GET | `/api/movies/detail?external_id=...&title=...` | Có | Lấy tóm tắt + IMDb/Tomatometer |
| GET | `/api/v1/cron/auto-crawl` | Cron secret | Tự động thêm suggestions từ dữ liệu đã đánh giá |

### Ví dụ

```javascript
await fetch("https://luvlog.vercel.app/api/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "...", password: "..." }),
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
| `TMDB_API_KEY` | Có | Key TMDB, dùng cho tìm kiếm phim |
| `GOOGLE_BOOKS_API_KEY` | Có | Key Google Books, dùng cho tìm kiếm sách |
| `OMDB_API_KEY` | Có | Key OMDb dùng cho IMDb/Tomatometer |
| `CRON_SECRET` | Có | Xác thực request từ Vercel Cron |

---

## 4. Database

### Bảng `messages`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `content` | String | Nội dung lời nhắn |
| `created_by` | String | Người tạo |
| `updated_at` | DateTime | Thời điểm cập nhật |

### Bảng `message_comments`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `message_id` | Integer FK | Thuộc lời nhắn nào |
| `content` | String | Nội dung bình luận |
| `created_by` | String | Người tạo |
| `created_at` | DateTime | Thời điểm tạo |

### Bảng `albums`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `name` | String | Tên album |
| `created_by` | String | Người tạo |
| `created_at` | DateTime | Thời điểm tạo |

### Bảng `photos`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `album_id` | Integer FK | Thuộc album nào |
| `url` | String | Public URL ảnh |
| `filename` | String | Tên file gốc |
| `file_size` | Integer | Dung lượng file |
| `caption` | String | Ghi chú |
| `caption_author` | String | Người cập nhật ghi chú gần nhất |
| `caption_updated_at` | DateTime | Thời điểm cập nhật ghi chú gần nhất |
| `file_hash` | String | SHA-256 để tránh trùng |
| `sort_order` | Integer | Thứ tự hiển thị ảnh trong album |
| `uploaded_by` | String | Người upload |
| `created_at` | DateTime | Thời điểm tạo |

### Bảng `suggestions`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | Integer PK | Auto increment |
| `media_type` | String | `movies` / `books` |
| `title` | String | Tên đề xuất |
| `cover_url` | String | Ảnh bìa |
| `external_id` | String | ID gốc bên ngoài |
| `category` | String | Thể loại |
| `based_on` | String | Gợi ý xuất phát từ mục nào |

### Bảng `fund_goals`, `fund_transactions`, `activities`, `movies`, `books`, `songs`

Các bảng này vẫn giữ cấu trúc như đã mô tả ở các giai đoạn trước, với các trường bổ sung cho media và photo metadata.

---

## 5. Frontend

| File | Vai trò |
|---|---|
| `index.html` | Layout chính: login + các section card |
| `js/counter.js` | Đồng hồ đếm ngày yêu |
| `js/message.js` | Lời nhắn: spotlight, lịch sử, phản hồi |
| `js/journal.js` | Nhật ký timeline + chỉnh sửa tại chỗ |
| `js/photos.js` | Album + upload + lightbox + swipe/reorder/note metadata |
| `js/fund.js` | Quỹ chung |
| `js/activities.js` | Hoạt động + preview cho dashboard |
| `js/media.js` | Media Hub hợp nhất: search, suggestions, poster grid, OMDb detail |
| `js/settings.js` | Cài đặt: thông tin đôi, webhook, lời nhắn hằng ngày |
| `css/style.css` | Giao diện chung |

---

## 6. Deploy

### Backend (Vercel)
- Root directory: `backend/`
- Entrypoint: `main.py`

### Frontend (Vercel)
- Root directory: `frontend/`
- Static hosting
