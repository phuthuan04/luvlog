# LUVLOG V2 UPGRADE PLAN

## Mục tiêu

Nâng cấp dự án theo spec mới: chuyển sang kiến trúc Next.js App Router + TypeScript + Tailwind, thiết lập auth bảo mật theo Supabase/Auth middleware, giữ dữ liệu hiện tại trên Supabase/PostgreSQL, và tích hợp các module nghiệp vụ theo lộ trình Phase 1–4.

## Spec mới (tóm tắt)

### Stack mục tiêu
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- Backend/Auth: Supabase Auth via @supabase/ssr, HTTP-only cookies, middleware guard
- Storage: Google Drive API v3 via service account
- Integrations: Spotify, Google Calendar, Discord webhook/bot

### Phased roadmap
1. Phase 1: Architecture, routing and auth foundation
2. Phase 2: Storage infrastructure and core modules migration
3. Phase 3: External integrations
4. Phase 4: UI/UX redesign

### Routing target
- /login
- / (dashboard)
- /diary
- /album
- /budget
- /activities
- /media
- /settings

### Guard logic target
- Only allow authenticated users whose IDs are in `SUPABASE_ALLOWED_USER_IDS`
- Redirect unauthenticated users and invalid users to /login
- Redirect authenticated users away from /login
- Admin/member RBAC for settings access

## Trạng thái hiện tại (khi tạo file)
- Repo đang migration sang Next.js App Router + Supabase Auth/Route Handlers
- Chưa có UI redesign cuối cùng

## Câu hỏi cần xác nhận trước khi triển khai
- Backend đã được bạn xác nhận sẽ chuyển hẳn sang Next.js Route Handlers/API routes.

## Trạng thái triển khai hiện tại
- Đã tạo bộ khung Next.js App Router tối thiểu: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Đã thêm nền tảng `src/app/`, `src/components/`, `src/lib/supabase/`
- Đã tạo middleware auth khởi đầu theo Supabase SSR
- Allowlist hiện tại:
  - `682a1d60-49a4-4d1c-91da-81c60a39f776`
  - `6f15766e-e0b5-45f5-8d6d-39574a68236c`
- Đã tạo các route API nền cho auth, journal, albums, photos, fund, activities, messages, settings, quotes, media
- Đã thêm CRUD routes cho movies/books/songs, messages/comments, và các DELETE route còn thiếu cho albums/fund/activities/quotes
- Đã chuyển `/api/photos` sang Google Drive upload pipeline qua service account và lưu `drive_file_id`
- Đã làm trang Album có form tạo album và upload ảnh thật để test ngay trên UI
- Đã tạo các page route cho login, dashboard, diary, album, budget, activities, media, settings
- Build Next.js đã chạy thành công sau khi fix lazy Supabase init ở login form
- Chưa hoàn thiện: Spotify, Calendar, Discord, RBAC theo user IDs, và UI redesign cuối cùng

## Vấn đề cần xác nhận tiếp
- Cần xác nhận có dùng Supabase Auth email/password ngay từ đầu hay cần thêm magic link/OTP
- Cần xác nhận có giữ nguyên tạm thời dữ liệu/endpoint FastAPI cũ để migrate dần, hay sẽ dừng dùng hẳn backend cũ ngay khi Next.js bản đầu tiên sẵn sàng

## Checklist triển khai sau khi xác nhận
- [x] Scaffold Next.js app và cấu trúc route
- [x] Thiết lập auth + middleware + env config
- [x] Tạo layout dashboard và các route chính
- [x] Adapter các module hiện tại sang API hoặc server actions
- [x] Bổ sung storage Google Drive và media pipeline
- [ ] Tích hợp Spotify/Calendar/Discord
- [ ] Redesign UI theo design system mới

## Ghi chú cập nhật
- File này sẽ được cập nhật sau mỗi bước triển khai để làm tài liệu tham chiếu cho Claude.
- Bản spec gốc và các thay đổi triển khai sẽ được giữ ở đây để Claude có thể cập nhật từng bước mà không cần tra lại toàn bộ lịch sử.
