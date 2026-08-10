# Changelog

## v0.9 — Production auth config fix + docs sync (10/08/2026)
- Xác nhận production frontend đang chạy UI Next.js mới từ branch `main`.
- Sửa lỗi login production bằng cách cấu hình đủ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, và `SUPABASE_ALLOWED_USER_IDS` trên project Vercel `luvlog-frontend`.
- Cập nhật docs để phản ánh đúng mô hình 2 project Vercel (`luvlog-frontend` và `luvlog_backend`) cùng trạng thái migrate hiện tại.
- Bổ sung ghi chú troubleshooting cho Supabase Auth/middleware allowlist để tránh lặp lại redirect loop sau này.

## v0.8 — Phase 7 UI/UX progress (09/08/2026)
- Hoàn thiện cơ chế card thu gọn/mở rộng dùng chung.
- Hoàn thiện đồng hồ và điều hướng sidebar/bottom nav.
- Hoàn thiện Media Hub: suggestions, OMDb detail, refresh suggestions, sort đã xem.
- Hoàn thiện album: nhóm theo album, upload nhiều ảnh, lightbox xem ảnh và ghi chú.
- Cập nhật docs để phản ánh tiến độ hiện tại.
- Ghi rõ các mục tiếp theo trong giai đoạn 7: Media Hub unified UI, album reorder, lời nhắn, nhật ký timeline, settings, dashboard mới.
- Thêm thanh tìm kiếm Media Hub dùng chung cho phim/sách, giúp giảm số khung tìm riêng trong giao diện.

## v0.7 — Refactor kiến trúc + Media Hub (06/08/2026)
- Tách backend thành routers/services/repositories/models.
- Thêm Media Hub cơ bản với phim/sách/nhạc và suggestions.
- Tích hợp cron tự động cho suggestions.
