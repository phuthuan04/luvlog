# luvlog — Documentations

Tài liệu kỹ thuật chính thức của dự án. Cập nhật song song với mọi thay đổi code. Bản này phản ánh production hiện tại trên `main` (10/08/2026).

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
```

- Auth: Supabase SSR + HTTP-only cookies
- Guard: middleware allowlist theo `SUPABASE_ALLOWED_USER_IDS`
- Data access: route handlers trong `src/app/api/*`
- Deploy production dùng 2 project Vercel riêng: `luvlog-frontend` cho app và `luvlog_backend` cho legacy backend còn giữ lại trong repo
- Legacy code `frontend/` và `backend/` vẫn còn trong repo để migrate dần

---

## 2. API reference

### Auth
- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Modules
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

### Media/search
- `GET /api/search/movies`
- `GET /api/search/books`
- `GET /api/suggestions/{media_type}`
- `POST /api/suggestions/{suggestion_id}/accept`
- `DELETE /api/suggestions/{suggestion_id}`
- `POST /api/movies/refresh-suggestions`
- `POST /api/books/refresh-suggestions`
- `GET /api/movies/detail`
- `GET /api/v1/cron/auto-crawl`

---

## 3. Biến môi trường

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ALLOWED_USER_IDS`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_DRIVE_FOLDER_ID`

### Ghi chú vận hành production

- Nếu thiếu `NEXT_PUBLIC_SUPABASE_URL` hoặc `NEXT_PUBLIC_SUPABASE_ANON_KEY`, form ở `src/app/login/page.tsx` sẽ báo thiếu cấu hình Supabase public env và không thể sign in.
- Nếu thiếu `SUPABASE_ALLOWED_USER_IDS`, hoặc danh sách không chứa UUID thật của user trong Supabase Auth, middleware ở `src/middleware.ts` sẽ coi user là không hợp lệ và redirect về `/login`.
- Production đã được xác nhận sửa xong lỗi login bằng cách khai báo đủ 3 biến trên trong project `luvlog-frontend` rồi redeploy.

### Photos upload
- `POST /api/photos` chấp nhận multipart form-data với `album_id`, `file`, và optional `caption`
- Ảnh được upload lên Google Drive, lưu `drive_file_id`, và public URL theo format `https://lh3.googleusercontent.com/d/{drive_file_id}`
- Trang `/album` hiện có UI để tạo album và upload ảnh trực tiếp từ trình duyệt

---

## 4. Trạng thái hiện tại

- Next.js build đã pass
- Middleware allowlist UUID đã bật
- CRUD route handlers core đã migrate xong
- Production frontend đang link repo `luvlog`, branch `main`
- Trang đăng nhập production đã hoạt động trở lại sau khi bổ sung env Supabase public + allowlist UUID
- Phase tiếp theo: hoàn thiện UI/UX cho các module còn placeholder, tiếp tục migrate logic cũ sang App Router
