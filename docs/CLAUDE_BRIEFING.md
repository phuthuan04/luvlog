CLAUDE BRIEFING — Production status sync (Aug 10 2026)

Mục đích: tóm tắt ngắn gọn trạng thái production hiện tại để Claude hoặc engineer tiếp theo không nhầm giữa codebase Next.js đang chạy trên `main` và các worktree cũ phục vụ migration/experiments.

1) Chốt trạng thái hiện tại
- Production frontend hiện là app Next.js trong `main`, deploy bởi Vercel project `luvlog-frontend`.
- Production backend/legacy API là project Vercel riêng `luvlog_backend`.
- Repo `luvlog` trên `main` là nguồn đúng của UI mới. Không quay lại frontend tĩnh cũ.

2) Sự cố production vừa xử lý
- Triệu chứng:
  - ban đầu trang login báo thiếu Supabase public env
  - sau khi thêm env public thì submit login bị loading rồi trình duyệt báo trang không hoạt động
- Nguyên nhân:
  - thiếu `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - sau đó thiếu hoặc sai `SUPABASE_ALLOWED_USER_IDS`, làm middleware redirect vòng giữa `/login` và route protected
- Cách fix đã xác nhận:
  - thêm đủ 3 env trên vào project `luvlog-frontend`
  - `SUPABASE_ALLOWED_USER_IDS` phải chứa UUID thật của user trong Supabase Auth
  - redeploy production

3) File cần nhớ
- `src/components/login-form.tsx` — form login dùng Supabase browser client và kiểm tra 2 biến `NEXT_PUBLIC_*`
- `src/middleware.ts` — guard allowlist theo `SUPABASE_ALLOWED_USER_IDS`
- `docs/README.md`, `docs/Documentations.md`, `docs/KE-HOACH-DU-AN.md`, `docs/CHANGELOG.md` — đã cập nhật theo production hiện tại

4) Cảnh báo quan trọng
- Có worktree/nhánh cũ chứa nhiều thay đổi cho frontend tĩnh + FastAPI legacy. Không merge/push thẳng các thay đổi đó vào `main` nếu chưa rà lại, vì có thể đè ngược UI Next.js mới.
- Khi cần tiếp tục feature trên production, luôn xuất phát từ `main`.

5) Next steps gợi ý
- Hoàn thiện các trang placeholder của App Router (`/media`, `/settings`, ...)
- Tiếp tục migrate logic cũ cần giữ sang codebase Next.js hiện tại
- Giữ docs sync mỗi lần đổi env/deploy/auth flow
