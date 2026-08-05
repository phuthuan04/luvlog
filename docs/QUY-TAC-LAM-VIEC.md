# luvlog — Quy tắc làm việc

Áp dụng cho toàn bộ quá trình phát triển dự án luvlog, bổ sung cho quy tắc chung.

## 1. Nhịp độ & giải thích
- Đi từng bước nhỏ, có mục tiêu rõ, có cách kiểm tra rõ. Chỉ qua bước tiếp theo sau khi bước hiện tại đã test xong.
- Chỉ giới thiệu khái niệm **thực sự mới**, hoặc khi được hỏi lại. Khái niệm đã giới thiệu trong dự án này thì không lặp lại — đi thẳng vào hướng dẫn.
- Ưu tiên tiết kiệm token ở các bước setup đơn giản (cài đặt, tạo thư mục, lệnh PowerShell quen thuộc).

## 2. Mức độ chi tiết của code theo giai đoạn
- **Giai đoạn nền tảng** (0 → 1.5, lúc hạ tầng còn đang dựng): cung cấp **toàn bộ nội dung file** cần tạo/sửa.
- **Giai đoạn phức tạp hơn** (từ lúc nền tảng ổn định, khoảng Giai đoạn 2 trở đi): chỉ đưa **đoạn code cần thêm/sửa**, chỉ rõ vị trí chèn (tên file, đứng sau/trước dòng nào), kèm hướng dẫn deploy & test — không đưa lại toàn bộ file trừ khi được yêu cầu.

## 3. Terminal
- Chỉ dùng **Terminal tích hợp trong VS Code**, không mở PowerShell rời. Bản chất vẫn là PowerShell chạy bên trong VS Code.

## 4. Debug
Khi có lỗi, theo đúng thứ tự: tái hiện lỗi → lấy traceback đầy đủ → đọc toàn bộ → xác định nguyên nhân gốc → cô lập → sửa từng vấn đề một → chạy lại xác nhận → giải thích vì sao lỗi xảy ra → cách tránh lần sau. Không đoán, không đưa nhiều hướng sửa cùng lúc khi chưa rõ nguyên nhân.

## 5. Bảo mật
- Không hard-code secrets. Luôn `.env` (local) + Environment Variables trên nền tảng deploy (Vercel, Supabase).
- Cảnh báo ngay nếu phát hiện rủi ro lộ thông tin (kể cả khi nó xuất hiện trong log/terminal đã dán vào chat).

## 6. Git
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`...).
+ feat: Thêm tính năng mới (feature).fix: Sửa lỗi (bug fix).
+ docs: Thay đổi tài liệu, hướng dẫn (documentation).
+ style: Định dạng code, sửa khoảng trắng, thiếu dấu chấm phẩy (không ảnh hưởng logic).
+ refactor: Tái cấu trúc code (không sửa lỗi, không thêm tính năng).
+ test: Thêm hoặc sửa các bài kiểm thử (unit test).
+ chore: Cấu hình, thay đổi công cụ build, file phụ trợ.
- Từ Giai đoạn 1 trở đi, mỗi tính năng làm trên nhánh riêng `feature/ten-tinh-nang`, merge vào `main` khi xong & test ổn.

## 7. Documentation
- Mỗi khi đổi/thêm tính năng: tự động cập nhật `Documentations.md`, `README.md`, và `docs/KE-HOACH-DU-AN.md`, không cần nhắc.
- Changelog ghi trong `Documentations.md` mục 8, theo định dạng: `### vX.Y — Tên thay đổi (DD/MM/YYYY)`.

## 8. Hạ tầng (từ Giai đoạn 1.5)
- Backend: FastAPI trên Vercel Serverless Functions (entrypoint `main.py`).
- Database: Supabase PostgreSQL, dùng Connection Pooler (cổng 6543) vì môi trường serverless mở nhiều kết nối ngắn.
- Storage: Supabase Storage cho ảnh/media — không ghi file vào ổ đĩa cục bộ của backend.
- Cron: Vercel Cron Jobs, mọi endpoint cron phải kiểm tra `CRON_SECRET` trong header trước khi chạy.
