CLAUDE BRIEFING — Detailed production handoff (Aug 10 2026)

Mục đích
- Ghi lại chính xác tình trạng production, cấu hình deploy, lỗi login vừa xử lý, và ranh giới giữa codebase Next.js trên `main` với các worktree migration cũ.

A. Production topology
- Vercel project 1: `luvlog-frontend`
  - linked repo: `phuthuan04/luvlog`
  - production branch: `main`
  - app đang chạy: Next.js App Router trong root repo
- Vercel project 2: `luvlog_backend`
  - dùng cho backend/legacy API riêng
- Database/Auth:
  - Supabase Auth
  - Supabase PostgreSQL

B. Điều đã được xác nhận trong repo
- `main` hiện chứa app Next.js mới, gồm:
  - `src/app/layout.tsx`
  - `src/app/login/page.tsx`
  - `src/components/login-form.tsx`
  - `src/middleware.ts`
  - các route handlers trong `src/app/api/*`
- `frontend/` và `backend/` legacy vẫn còn trong repo để migrate dần, nhưng không phải UI production hiện tại.

C. Sự cố production ngày 10/08/2026
1. Triệu chứng ban đầu
- Truy cập `https://luvlog-frontend.vercel.app/login`
- Màn hình báo: "Dùng Supabase Auth theo spec mới." và thiếu Supabase public env

2. Sau khi thêm public env
- User nhập tài khoản
- App loading
- Trình duyệt báo trang không hoạt động

3. Phân tích nguyên nhân
- `src/components/login-form.tsx` yêu cầu:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/middleware.ts` đọc:
  - `SUPABASE_ALLOWED_USER_IDS`
- Nếu 2 biến public thiếu:
  - login form chặn trước và báo lỗi cấu hình
- Nếu login sign-in thành công nhưng allowlist trống hoặc sai:
  - middleware coi user không hợp lệ
  - route protected redirect về `/login`
  - `/login` lại thấy đã có session nên redirect về `/`
  - tạo redirect loop

4. Cách fix production đã xác nhận
- Thêm các env vào Vercel project `luvlog-frontend`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_ALLOWED_USER_IDS`
- Giá trị `SUPABASE_ALLOWED_USER_IDS` phải là UUID thật trong Supabase Auth, ngăn cách bằng dấu phẩy nếu có nhiều user
- Redeploy project frontend
- Kết quả: login đã hoạt động trở lại

D. Tài liệu đã cập nhật trong lần này
1. `docs/README.md`
- Làm rõ production đang chạy UI Next.js mới từ `main`
- Bổ sung checklist env auth tối thiểu
- Ghi rõ mô hình 2 project Vercel

2. `docs/Documentations.md`
- Đồng bộ kiến trúc production hiện tại
- Bổ sung ghi chú vận hành cho auth env + allowlist
- Ghi nhận production frontend link `main`

3. `docs/KE-HOACH-DU-AN.md`
- Cập nhật Phase 1 đã đủ nền production
- Chuyển trọng tâm next steps sang hoàn thiện route UI còn placeholder
- Ghi nhận lỗi login production đã được fix bằng env/redeploy

4. `docs/CHANGELOG.md`
- Thêm mục v0.9 cho auth config fix + docs sync

5. `docs/CLAUDE_BRIEFING.md`
- Bản tóm tắt ngắn để đọc nhanh trước khi làm tiếp

E. Các file code đáng chú ý cho Claude
1. `src/components/login-form.tsx`
- kiểm tra 2 biến `NEXT_PUBLIC_*`
- tạo browser Supabase client bằng `@supabase/ssr`
- sign in bằng `signInWithPassword`

2. `src/middleware.ts`
- protected paths gồm `/`, `/diary`, `/album`, `/budget`, `/activities`, `/media`, `/settings`, và `/api*`
- allowlist lấy từ `SUPABASE_ALLOWED_USER_IDS`
- nếu env Supabase public thiếu thì middleware hiện tại bỏ qua auth guard thay vì làm app crash

3. `src/app/(dashboard)/album/page.tsx`
- trang album đã có UI test thực sự qua `AlbumManager`

4. `src/app/(dashboard)/media/page.tsx`
5. `src/app/(dashboard)/settings/page.tsx`
- hiện còn là placeholder/section page

F. Cảnh báo branch/worktree
- Có worktree cũ: `agents/upgrade-plan-and-confirmation-questions`
- Worktree đó chứa nhiều thay đổi local cho frontend tĩnh + FastAPI legacy, chưa push
- Không đẩy nguyên xi các thay đổi từ worktree đó vào `main`, vì sẽ có nguy cơ ghi đè hoặc làm lệch codebase Next.js production
- Mọi feature mới cho production nên bắt đầu từ `main`

G. Hướng tiếp theo hợp lý
1. Hoàn thiện UI thật cho các trang còn placeholder:
- `/media`
- `/settings`
- `/activities` nếu còn ở mức cơ bản

2. Tiếp tục migrate logic cũ cần giữ:
- media hub behavior
- settings management
- dashboard preview modules

3. Giữ checklist deploy/auth:
- thêm env trước khi test login
- verify allowlist UUID
- redeploy sau khi đổi env

H. Git guidance
- Nhánh production chuẩn: `main`
- Nếu thấy một worktree cũ có nhiều thay đổi lớn nhưng không cùng kiến trúc với `main`, hãy cherry-pick từng ý tưởng hợp lệ thay vì merge thẳng
- Với cập nhật docs/vận hành, commit riêng để dễ truy vết deploy incidents
