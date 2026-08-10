# luvlog — Documentations

Tài liệu kỹ thuật chính thức của dự án. Cập nhật song song với mọi thay đổi code. Bản này phản ánh trạng thái repo trên `main` ngày 10/08/2026, gồm cả production Next.js hiện tại và phần legacy Phase 7 vẫn được giữ trong repo để migrate dần.

---

## 1. Kiến trúc

```text
[Vercel project: luvlog-frontend]
        |
 [Next.js App Router]
        |
   route handlers + middleware
        |
[Supabase Auth + PostgreSQL]
        |
[Google Drive upload pipeline]

[Vercel project: luvlog_backend]
        |
 [Legacy FastAPI backend trong backend/]

[Legacy static frontend trong frontend/]
        |
 chỉ giữ trong repo để tham chiếu/migrate dần
```

- Production hiện tại chạy UI Next.js trên `main`.
- Auth production: Supabase SSR + HTTP-only cookies.
- Guard production: middleware allowlist theo `SUPABASE_ALLOWED_USER_IDS`.
- Repo vẫn giữ `frontend/` và `backend/` legacy để migrate hoặc tái sử dụng logic theo từng phần.

---

## 2. API reference

### 2.1 Production Next.js auth
- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### 2.2 Production/Next.js module handlers hiện có
- `GET/POST/DELETE /api/journal`
- `GET/POST/DELETE /api/albums`
- `GET/POST/PATCH/DELETE /api/photos`
- `POST /api/photos/reorder`
- `GET /api/fund`
- `POST/DELETE /api/fund/goals`
- `POST/DELETE /api/fund/transactions`
- `GET/POST/DELETE /api/activities`
- `GET/POST/PATCH/DELETE /api/messages`
- `GET/POST/DELETE /api/messages/{messageId}/comments`
- `GET/POST/PATCH/DELETE /api/movies`
- `GET/POST/PATCH/DELETE /api/books`
- `GET/POST/PATCH/DELETE /api/songs`
- `GET/POST /api/settings`
- `GET /api/quotes/random`
- `GET /api/search/movies`
- `GET /api/search/books`
- `GET /api/suggestions/{media_type}`
- `POST /api/suggestions/{suggestion_id}/accept`
- `DELETE /api/suggestions/{suggestion_id}`
- `POST /api/movies/refresh-suggestions`
- `POST /api/books/refresh-suggestions`
- `GET /api/movies/detail`
- `GET /api/v1/cron/auto-crawl`

### 2.3 Legacy FastAPI/static surface còn giữ trong repo

Base URL legacy backend: `https://luvlog.vercel.app`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/health` | Không | Health check |
| GET | `/api/me` | Không | Trả về `{ "user": "..." \| null }` |
| POST | `/api/login` | Không | Body: `{ username, password }` -> session cookie |
| POST | `/api/logout` | Không | Xóa session |
| GET | `/api/message` | Có | Lấy lời nhắn mới nhất |
| POST | `/api/message` | Có | Body: `{ content }` |
| GET | `/api/messages` | Có | Danh sách lịch sử lời nhắn, kèm `comment_count` |
| GET | `/api/messages/{message_id}/comments` | Có | Bình luận của một lời nhắn |
| POST | `/api/messages/{message_id}/comments` | Có | Body: `{ content }` |
| GET | `/api/settings` | Có | Lấy cấu hình đôi + webhook URLs |
| POST | `/api/settings` | Có | Lưu settings theo partial fields |
| POST | `/api/settings/notifications/test` | Có | Body: `{ provider: "telegram" \| "discord" }` |
| GET | `/api/quotes` | Có | Danh sách lời nhắn hằng ngày |
| GET | `/api/journal` | Có | Danh sách nhật ký |
| POST | `/api/journal` | Có | Body: `{ title, content }` |
| GET | `/api/albums` | Có | Danh sách album |
| POST | `/api/albums` | Có | Body: `{ name }` |
| DELETE | `/api/albums/{album_id}` | Có | Xóa album nếu không còn ảnh |
| GET | `/api/photos` | Có | Danh sách ảnh, kèm `sort_order`, `caption_author`, `caption_updated_at` |
| POST | `/api/photos` | Có | Multipart: `album_id`, `file`, `file_hash` |
| PATCH | `/api/photos/{photo_id}` | Có | Body: `{ caption }` |
| POST | `/api/photos/reorder` | Có | Body: `{ album_id, ordered_photo_ids[] }` |
| GET | `/api/fund` | Có | Số dư tổng + mục tiêu + giao dịch |
| POST | `/api/fund/transactions` | Có | Body: `{ amount, description, goal_id? }` |
| DELETE | `/api/fund/transactions/{id}` | Có | Xóa giao dịch |
| POST | `/api/fund/goals` | Có | Body: `{ name, target_amount }` |
| DELETE | `/api/fund/goals/{id}` | Có | Xóa mục tiêu |
| GET | `/api/activities` | Có | Danh sách hoạt động |
| POST | `/api/activities` | Có | Body: `{ place_name, category, visited_at, note? }` |
| DELETE | `/api/activities/{id}` | Có | Xóa hoạt động |
| GET | `/api/movies` | Có | Danh sách phim |
| POST | `/api/movies` | Có | Body: `{ title, cover_url?, status, external_id?, category? }` |
| PATCH | `/api/movies/{id}` | Có | Body: `{ status, rating?, review?, experienced_at? }` |
| DELETE | `/api/movies/{id}` | Có | Xóa phim |
| GET | `/api/books` | Có | Danh sách sách |
| POST | `/api/books` | Có | Body: `{ title, cover_url?, status, external_id?, category? }` |
| PATCH | `/api/books/{id}` | Có | Body: `{ status, rating?, review?, experienced_at? }` |
| DELETE | `/api/books/{id}` | Có | Xóa sách |
| GET | `/api/songs` | Có | Danh sách nhạc |
| POST | `/api/songs` | Có | Body: `{ title, cover_url?, status }` |
| PATCH | `/api/songs/{id}` | Có | Body: `{ status, rating?, review?, experienced_at? }` |
| DELETE | `/api/songs/{id}` | Có | Xóa nhạc |
| GET | `/api/search/movies?q=` | Có | Tìm phim qua TMDB |
| GET | `/api/search/books?q=` | Có | Tìm sách qua Google Books |
| GET | `/api/suggestions/{media_type}` | Có | Danh sách gợi ý phim/sách |
| POST | `/api/suggestions/{suggestion_id}/accept` | Có | Chấp nhận gợi ý |
| DELETE | `/api/suggestions/{suggestion_id}` | Có | Bỏ qua gợi ý |
| POST | `/api/movies/refresh-suggestions` | Có | Làm mới gợi ý phim |
| POST | `/api/books/refresh-suggestions` | Có | Làm mới gợi ý sách |
| GET | `/api/movies/detail?external_id=...&title=...` | Có | Lấy tóm tắt + IMDb/Tomatometer |
| GET | `/api/v1/cron/auto-crawl` | Cron secret | Tự động thêm suggestions |

---

## 3. Biến môi trường

### 3.1 Production Next.js
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ALLOWED_USER_IDS`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_DRIVE_FOLDER_ID`

### 3.2 Ghi chú vận hành production
- Nếu thiếu `NEXT_PUBLIC_SUPABASE_URL` hoặc `NEXT_PUBLIC_SUPABASE_ANON_KEY`, form ở `src/app/login/page.tsx` sẽ báo thiếu cấu hình Supabase public env.
- Nếu thiếu `SUPABASE_ALLOWED_USER_IDS`, hoặc danh sách không chứa UUID thật của user trong Supabase Auth, middleware ở `src/middleware.ts` sẽ redirect user về `/login`.
- Production login đã được xác nhận hoạt động trở lại sau khi khai báo đủ 3 biến trên trong project `luvlog-frontend` rồi redeploy.

### 3.3 Legacy backend
- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN1_USER`
- `ADMIN1_PASS_HASH`
- `ADMIN2_USER`
- `ADMIN2_PASS_HASH`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `TMDB_API_KEY`
- `GOOGLE_BOOKS_API_KEY`
- `OMDB_API_KEY`
- `CRON_SECRET`

---

## 4. Database và dữ liệu legacy nổi bật

### Bảng `photos`
- `caption_author`: người cập nhật ghi chú gần nhất
- `caption_updated_at`: thời điểm cập nhật ghi chú gần nhất
- `sort_order`: thứ tự ảnh trong album
- `file_hash`: chống upload trùng

### Bảng `messages`
- lịch sử tin nhắn có `comment_count` trong payload list

### Settings legacy
- hỗ trợ lưu partial fields
- hỗ trợ `telegram_webhook_url` và `discord_webhook_url`
- có endpoint test webhook

---

## 5. Frontend legacy Phase 7 trong repo

| File | Vai trò |
|---|---|
| `frontend/index.html` | Layout chính: login + các section card |
| `frontend/js/message.js` | Lời nhắn: spotlight, lịch sử, phản hồi |
| `frontend/js/journal.js` | Nhật ký timeline + chỉnh sửa tại chỗ |
| `frontend/js/photos.js` | Album + upload + lightbox + swipe/reorder/note metadata |
| `frontend/js/media.js` | Media Hub hợp nhất: search, suggestions, poster grid, OMDb detail |
| `frontend/js/settings.js` | Cài đặt: thông tin đôi, webhook, lời nhắn hằng ngày |
| `frontend/js/activities.js` | Hoạt động + preview dashboard |
| `frontend/css/style.css` | Giao diện Phase 7 |

---

## 6. Trạng thái hiện tại

- Next.js build đã pass trên `main`.
- Production frontend đang link repo `luvlog`, branch `main`.
- Login production đã hoạt động sau khi bổ sung env Supabase public + allowlist UUID.
- Repo hiện đồng thời chứa:
  - code production Next.js
  - legacy static/FastAPI đã được nâng cấp mạnh ở Phase 7
- Khi tiếp tục phát triển production, ưu tiên port logic từ legacy sang App Router thay vì quay lại deploy frontend tĩnh.
