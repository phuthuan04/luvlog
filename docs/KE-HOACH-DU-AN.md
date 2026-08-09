# luvlog — Kế hoạch Dự án Website Kỷ Niệm Cặp Đôi

> Cập nhật: chuyển hạ tầng sang Vercel (Serverless) + Supabase (PostgreSQL + Storage), bổ sung Media Hub (phim/sách/nhạc) với cron tự động.
> Đích đến cuối cùng không đổi so với SRS gốc — chỉ khác cách đi và nền tảng hạ tầng.

---

## 1. Ý tưởng & Mục tiêu

Website riêng tư cho hai người, gồm: đồng hồ đếm ngày yêu + lời nhắn hằng ngày, Nhật ký/Timeline, Album ảnh, Quỹ chung & hoạt động, Media Hub (phim/sách/nhạc + gợi ý tự động), thông báo Telegram/Discord, gamification, định hướng mobile sau này.

**Đối tượng dùng:** chỉ 2 người.

---

## 2. Nguyên tắc làm việc (chi tiết đầy đủ ở file `QUY-TAC-LAM-VIEC.md`)

Tóm tắt: từng bước nhỏ, test xong mới qua bước tiếp; không lặp lại khái niệm đã giới thiệu; không hard-code secrets; cập nhật docs mỗi khi đổi tính năng.

---

## 3. Trạng thái hiện tại

> Làm lại toàn bộ từ đầu theo cấu trúc thư mục và hạ tầng mới (Vercel + Supabase) — coi như chưa làm bước nào.

| Giai đoạn | Trạng thái |
|---|---|
| 0 — Trang tĩnh | ✅ Xong |
| 0.5 — Git + GitHub Private | ✅ Xong |
| 1 — Backend FastAPI (local) | ✅ Xong |
| 1.5 — Hạ tầng Vercel + Supabase | ✅ Xong |
| 2 — Đăng nhập bảo mật | ✅ Xong |
| 3 — Nhật ký & Timeline | ✅ Xong |
| 4 — Album ảnh | ✅ Xong |
| 5 — Quỹ chung & hoạt động đôi | ✅ Xong |
| 6 — Kiến trúc 3 tầng + Media Hub + Cron | 🔄 Đang làm (6.1–6.4 xong; 6.5 Webhook còn lại; JWT: bỏ qua) |
| 7 — Nâng cấp UI/UX | 🔄 Đang làm (7.1, 7.2, 7.2.5 xong; 7.3.1 Media Hub gợi ý xem trước đang làm) |
| 8 — Gamification, domain, mobile | ⏳ Chưa bắt đầu |

---

## 4. Kiến trúc tổng thể (mục tiêu)

```
[Frontend tĩnh - Vercel Static]
            |
       REST API (fetch, credentials: include)
            |
[Backend FastAPI - Vercel Serverless Functions]
   |-- Auth: session cookie ký (itsdangerous) — không đổi khi lên serverless
   |-- Database: Supabase PostgreSQL, qua Connection Pooler (cổng 6543)
   |-- Storage: Supabase Storage — ảnh/media, không ghi ổ cứng cục bộ
   |-- External APIs: TMDB (phim), Google Books (sách), YouTube Data (nhạc)
   |-- Cron: Vercel Cron Jobs (00:00 UTC/đêm) — bảo vệ bằng header CRON_SECRET
```

**Lưu ý kỹ thuật quan trọng:** Vercel serverless có ổ đĩa tạm/ephemeral giống Render — SQLite file sẽ mất dữ liệu liên tục. Vì vậy **DB phải chuyển sang Supabase Postgres ngay ở Giai đoạn 1.5**, sớm hơn kế hoạch cũ (trước đây định để tới Giai đoạn 6), thay vì tiếp tục dùng SQLite khi deploy thật.

Vercel Hobby (free) giới hạn ~10 giây xử lý/request — ảnh hưởng tới thiết kế cron crawl (giữ đúng giới hạn 5–10 mục/đêm như đã tính).

---

## 5. Lộ trình theo giai đoạn

### Giai đoạn 0 — Trang tĩnh ✅
Trang HTML/CSS/JS đếm ngày yêu nhau. (Xong)

### Giai đoạn 0.5 — Git + GitHub Private ✅
(Xong — deploy tĩnh sẽ chuyển sang Vercel ở bước 1.5)

### Giai đoạn 1 — Backend cơ bản (local) ✅
FastAPI 1 file + SQLite local + API lời nhắn hôm nay, frontend gọi API thật. (Xong)

### Giai đoạn 1.5 — Hạ tầng Vercel + Supabase (MỚI)
- Tạo project Supabase, lấy connection string Postgres (pooler cổng 6543)
- Đổi `database.py` từ SQLite sang Postgres
- Deploy backend lên Vercel (Serverless Functions)
- Deploy frontend lên Vercel (Static)
- **Đầu ra:** Cùng chức năng như cũ (lời nhắn hôm nay) nhưng chạy trên hạ tầng mới, không còn lag 40s.

### Giai đoạn 2 — Đăng nhập bảo mật 🔄
Session cookie + bcrypt trực tiếp, 2 tài khoản định sẵn. (Đang làm lại)

### Giai đoạn 3 — Nhật ký & Timeline
Bảng Journal, form nhập bài viết, hiển thị theo thời gian giảm dần.

### Giai đoạn 4 — Album ảnh
Upload lên Supabase Storage (đã có sẵn từ 1.5), tổ chức theo album.

### Giai đoạn 5 — Quỹ chung & hoạt động đôi
Thu/chi quỹ chung, thanh tiến độ mục tiêu, danh sách địa điểm đã đi.

### Giai đoạn 6 — Kiến trúc 3 tầng + Media Hub + Tự động hoá
- Tách backend: `routers/` / `services/` / `repositories/`
- Media Hub: phim (TMDB), sách (Google Books), nhạc (YouTube Data API trước, Spotify để sau do cần xin quyền OAuth phức tạp hơn)
- Vercel Cron Job chạy đêm, endpoint `/api/v1/cron/auto-crawl`, bảo vệ bằng `CRON_SECRET`
- Webhook Telegram/Discord báo cập nhật mới
- (Tuỳ chọn) đổi session sang JWT

### Giai đoạn 7 — Nâng cấp UI/UX (cập nhật 07/08/2026 sau khi đối chiếu ảnh mockup)
> Bố cục/kiểu trình bày lấy cảm hứng từ ảnh mockup do người dùng cung cấp — **bảng màu và mô hình quỹ chung giữ nguyên như đã xây** (không đổi sang hồng-tím/icon nhiều màu, không đổi sang mô hình chia tiền ai nợ ai). Chi tiết đầy đủ ở mục 10 — Design System.

- **7.1** ✅ Cơ chế card thu gọn/mở rộng dùng chung
- **7.2** ✅ Đồng hồ: tổng số ngày + năm/tháng/ngày + "Quen nhau từ...–nay" + đồng hồ giờ thật
- **7.2.5** ✅ Điều hướng: sidebar cố định (desktop) + thanh dưới (mobile)
- **7.3** 🔄 Media Hub:
  - 7.3.1 ✅ Gợi ý dạng xem trước (bảng `suggestions` riêng), nút Thêm/Bỏ qua, nút làm mới gợi ý
  - 7.3.2 ✅ Tích hợp OMDb (IMDb + Tomatometer, tra theo mã IMDb chính xác thay vì tên), click mở rộng xem tóm tắt, hiện nguồn gợi ý ("Dựa trên: ...")
  - 7.3.3 — Carousel: chỉ hiện 2-3 thẻ/lượt (gợi ý, muốn xem, đã xem), cuộn/kéo xem thêm
  - 7.3.4 — Sort "đã xem" theo ngày đánh dấu (asc/desc)
  - 7.3.5 (mới, từ mockup) — Hợp nhất giao diện: 1 dropdown chọn loại (Phim/Sách/Nhạc) + 1 ô tìm kiếm chung, thay vì 3 khung tách riêng như hiện tại; khung gợi ý dạng danh sách hàng ngang có sao đánh giá; lưới poster tỉ lệ dọc 2:3 kèm badge trạng thái ("Đã xem xong"/"Dự định")
- **7.4** ✅ Album: bảng `albums` riêng, nhóm hiển thị theo tên album kèm số lượng, tạo/sort qua UI
  - 7.4.1 + 7.4.2 ✅ Upload nhiều ảnh 1 lượt (tối đa 30), nhớ album đã chọn lần trước, tự bỏ qua ảnh trùng (hash SHA-256)
  - 7.4.3 (đang làm) — Xem ảnh toàn màn hình, duyệt ảnh, xem/sửa chi tiết (tên file, ngày, người tải, dung lượng, ghi chú)
  - 7.4.4 — Kéo thả sắp xếp lại vị trí ảnh trong album
- **7.5** — Lời nhắn: tách card hiển thị/viết, lịch sử, đậm/mờ khi cuộn, bình luận/trả lời qua lại
- **7.6** — Nhật ký: timeline dọc có đường nối + icon tròn theo mốc thời gian, thẻ nội dung kèm tên tác giả + nút sửa/xoá (thay cho pattern feed đơn giản đã định trước đó)
- **7.7** — Trang Settings (3 khối): (1) Thông tin đôi — sửa ngày bắt đầu + tên gọi 2 người qua UI; (2) Thông báo — cấu hình Telegram/Discord webhook URL + nút Lưu/Gửi thử; (3) Lời nhắn hằng ngày — danh sách quản lý, hiện ngẫu nhiên 1 câu/ngày ở trang chủ. Không phân quyền admin/member (giữ đơn giản, 2 người cùng sửa được)
- **7.8** — Trang chủ dashboard: thêm avatar viết tắt tên 2 người nối bằng ❤️ vào khối đồng hồ (lấy tên từ Settings 7.7); khối "Xem gần đây" 2 cột cuối trang (ví dụ: nhật ký gần đây | hoạt động gần đây) kiểu "Xem tất cả →"

**Cân nhắc thêm/bớt so với mockup:**
- **Lưới 6 nút truy cập nhanh ở trang chủ:** không cần thiết — sidebar đã liệt kê đủ 9 mục thường trực, thêm lưới sẽ trùng chức năng. Bỏ qua.
- **Wishlist (trang riêng biệt):** vẫn để dành, chưa thêm vào giai đoạn nào.
- **Quỹ chung mô hình chia tiền ai nợ ai:** đã xác nhận **không đổi**, giữ nguyên quỹ chung + mục tiêu hiện tại.

### Giai đoạn 8 — Gamification, domain riêng, tối ưu, định hướng mobile
Thẻ gamification ở trang chủ (tham khảo mockup): cấp độ hiện tại + điểm số, thanh tiến độ lên cấp tiếp theo, hàng huy hiệu cuộn ngang (đã mở khoá tô màu, chưa mở khoá viền xám nhạt). Ý tưởng huy hiệu: Khởi đầu, Nhà văn, Nhiếp ảnh gia, Quản gia, Du hành gia, 100 ngày, Một năm... Ngoài ra: mua domain riêng (giải quyết lỗi cookie Safari), responsive, chuẩn bị backend cho app Flutter.

### Giai đoạn 9 (mới) — Tích hợp nâng cao
Google Calendar auto-sync (Activities/Wishlist → Calendar, cần OAuth), Discord slash command nhập liệu nhanh (`/nhatky`, `/quy`, `/hoatdong` — cần dựng Discord Bot riêng, phức tạp hơn Webhook thông báo ở 6.5).

---

## 6. Bảng công nghệ theo giai đoạn

| Giai đoạn | Công nghệ mới thêm vào |
|---|---|
| 0 | HTML, CSS, JS thuần |
| 0.5 | Git, GitHub Private repo |
| 1 | Python, FastAPI, SQLite (local), `.env` |
| 1.5 | Supabase (PostgreSQL + Connection Pooler), Vercel (Serverless + Static) |
| 2 | Session cookie, bcrypt |
| 3 | Không có công nghệ mới lớn |
| 4 | Supabase Storage |
| 5 | Không có công nghệ mới lớn |
| 6 | Kiến trúc 3 tầng, TMDB API, Google Books API, YouTube Data API, Vercel Cron Jobs, Webhook, (tuỳ chọn) JWT |
| 7 | OMDb API (IMDb + Tomatometer), không có hạ tầng lớn mới khác |
| 8 | Domain + SSL, Responsive design, (định hướng) Flutter |

---

## 7. Cấu trúc thư mục

```
luvlog/
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── backend/
│   ├── main.py              # entrypoint Vercel nhận diện tự động
│   ├── database.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── KE-HOACH-DU-AN.md
│   ├── QUY-TAC-LAM-VIEC.md
│   └── CHANGELOG.md
├── .gitignore
└── README.md
```

Triển khai: **2 project Vercel riêng** (1 cho `frontend/`, 1 cho `backend/`) — giống mô hình 2 service tách biệt đã dùng với Render trước đây, tránh cấu hình routing phức tạp trong 1 project.

Từ Giai đoạn 6, `backend/` tách thêm `routers/`, `services/`, `repositories/`, `models/`.

`.gitignore` tối thiểu: `.env`, `venv/`, `__pycache__/`, `*.db`, `.vercel/`.

---

## 8. Quản lý nhánh Git

`main` = bản chạy ổn định để deploy. `feature/ten-tinh-nang` = nhánh riêng cho mỗi tính năng, merge vào `main` khi xong & test ổn. Dùng branch từ Giai đoạn 1 trở đi.

---

## 10. Design System (xác nhận qua ảnh mockup 07/08/2026)

> Bố cục/pattern lấy từ ảnh mockup người dùng cung cấp. **Bảng màu và mô hình dữ liệu giữ nguyên như đã xây trước đó** — ảnh chỉ dùng để tham khảo cách trình bày, không phải để đổi màu hay đổi mô hình quỹ chung.

**Không đổi (đã chốt):**
- Bảng màu: tông giấy ấm hiện tại (`--ink`, `--plum`, `--berry`, `--paper`, `--card`) — **không** dùng gradient hồng-tím, **không** icon nhiều màu theo từng mục
- Quỹ chung: giữ mô hình quỹ chung + mục tiêu tiết kiệm — **không** đổi sang mô hình chia tiền "ai nợ ai"

**Áp dụng bố cục từ mockup (giữ màu hiện tại):**
- Sidebar: mục đang chọn có nền nổi bo tròn (đã có), logo + tagline ở đầu (đã có), khối "Made with love" ở chân sidebar
- Trang chủ: khối đồng hồ có avatar viết tắt tên 2 người nối bằng ❤️ (7.8); khối preview "xem gần đây" 2 cột cuối trang (7.8)
- Nhật ký: timeline dọc có đường nối + icon theo mốc (7.6)
- Album: nhóm theo tên album kèm số lượng, lưới ảnh vuông bo góc (7.4)
- Hoạt động: pill lọc theo category kèm số đếm (bổ sung cho 7.3 pattern, áp dụng tương tự nếu cần)
- Media Hub: 1 dropdown chọn loại + 1 ô tìm kiếm chung, khung gợi ý dạng danh sách hàng ngang, lưới poster dọc 2:3 kèm badge trạng thái (7.3.5)
- Settings (trang mới): 3 khối — Thông tin đôi / Thông báo webhook / Lời nhắn hằng ngày (7.7)
- Gamification (Giai đoạn 8): thẻ cấp độ + điểm + thanh tiến độ + hàng huy hiệu cuộn ngang

**Không áp dụng / để dành:**
- Lưới 6 nút truy cập nhanh ở trang chủ — trùng chức năng với sidebar, bỏ qua
- Wishlist trang riêng biệt — để dành, chưa quyết
- Mô hình quỹ chung chia tiền ai nợ ai — đã từ chối, giữ nguyên hiện tại

---

## 11. Bước tiếp theo

Đang ở Giai đoạn 7 — 7.1, 7.2, 7.2.5, 7.3.1 đã xong. Tiếp theo: **7.3.2** (tích hợp OMDb — IMDb + Tomatometer, click mở rộng xem tóm tắt).