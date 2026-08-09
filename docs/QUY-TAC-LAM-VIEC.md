# luvlog — Quy tắc làm việc

Áp dụng cho toàn bộ quá trình phát triển dự án luvlog, bổ sung cho quy tắc chung.

## 1. Nhịp độ & giải thích
- Đi từng bước nhỏ, có mục tiêu rõ, có cách kiểm tra rõ. Chỉ qua bước tiếp theo sau khi bước hiện tại đã test xong.
- Chỉ giới thiệu khái niệm thực sự mới, hoặc khi được hỏi lại.
- Ưu tiên tiết kiệm token ở các bước setup đơn giản.

## 2. Mức độ chi tiết của code theo giai đoạn
- Giai đoạn nền tảng: cung cấp toàn bộ nội dung file cần tạo/sửa.
- Từ Giai đoạn 2 trở đi: chỉ đưa đoạn code cần thêm/sửa, rõ vị trí chèn.

## 3. Documentation
- Mỗi khi đổi/thêm tính năng: tự động cập nhật `docs/KE-HOACH-DU-AN.md`, `docs/Documentations.md` và `docs/CHANGELOG.md`.
- Khi làm việc ở giai đoạn 7, ưu tiên theo đúng mục trong `docs/KE-HOACH-DU-AN.md` để tránh drift giữa kế hoạch và code.

## 4. Hạ tầng (từ Giai đoạn 1.5)
- Backend: FastAPI trên Vercel Serverless Functions (entrypoint `main.py`).
- Database: Supabase PostgreSQL, dùng Connection Pooler (cổng 6543).
- Storage: Supabase Storage cho ảnh/media.
- Cron: Vercel Cron Jobs, mọi endpoint cron phải kiểm tra `CRON_SECRET` trước khi chạy.
