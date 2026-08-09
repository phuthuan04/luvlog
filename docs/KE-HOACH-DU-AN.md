# luvlog — Kế hoạch Dự án Website Kỷ Niệm Cặp Đôi

> Cập nhật: 09/08/2026. Hạ tầng hiện tại là frontend tĩnh + backend FastAPI trên Vercel + Supabase PostgreSQL/Storage. Tài liệu này là bản kế hoạch chính hiện hành cho giai đoạn 7 và các bước tiếp theo.

---

## 1. Ý tưởng & Mục tiêu

Website riêng tư cho hai người, gồm: đồng hồ đếm ngày yêu + lời nhắn hằng ngày, Nhật ký/Timeline, Album ảnh, Quỹ chung & hoạt động, Media Hub (phim/sách/nhạc + gợi ý tự động), thông báo Telegram/Discord, gamification, định hướng mobile sau này.

**Đối tượng dùng:** chỉ 2 người.

---

## 2. Nguyên tắc làm việc

Tóm tắt: từng bước nhỏ, test xong mới qua bước tiếp; không lặp lại khái niệm đã giới thiệu; không hard-code secrets; cập nhật docs mỗi khi đổi tính năng. Chi tiết đầy đủ ở file `QUY-TAC-LAM-VIEC.md`.

---

## 3. Trạng thái hiện tại

### 3.1 Tóm tắt nhanh
- Trạng thái tổng thể: Giai đoạn 6 đã core xong; Giai đoạn 7 đang chạy ở mức “đã có nền, đang hoàn thiện UI theo mockup”.
- Điểm đã có trong code: album, media detail, suggestions, auth, CRUD chính.
- Điểm còn thiếu để chốt gần mockup: Media Hub unified UI, album reorder, lời nhắn, nhật ký timeline, settings, dashboard mới.

### 3.2 Bảng giai đoạn
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
| 6 — Kiến trúc 3 tầng + Media Hub + Cron | ✅ Core xong; còn polish cho cron/webhook và điều chỉnh nhỏ theo thực tế deploy |
| 7 — Nâng cấp UI/UX | 🔄 Đang làm (7.3.3/7.3.5, 7.4.4, 7.5–7.8 là các mục còn lại) |
| 8 — Gamification, domain, mobile | ⏳ Chưa bắt đầu |

### 3.3 Trạng thái thực tế trong code (09/08/2026)
- Backend: có router cho message, journal, albums/photos, fund, activities, media, suggestions và detail phim.
- Frontend: có card thu gọn/mở rộng, đồng hồ, sidebar/bottom nav, album nhóm theo album, lightbox xem ảnh, upload nhiều ảnh, media detail với IMDb/Tomatometer.
- Gap còn lại: Media Hub dùng chung 1 bộ lọc, drag/drop sắp xếp ảnh, redesign lời nhắn, redesign nhật ký timeline, settings, dashboard mới.

---

## 4. Kiến trúc tổng thể

```text
[Frontend tĩnh - Vercel Static]
           |
      REST API (fetch, credentials: include)
           |
[Backend FastAPI - Vercel Serverless Functions]
   |-- Auth: session cookie ký (itsdangerous)
   |-- Database: Supabase PostgreSQL via Connection Pooler (6543)
   |-- Storage: Supabase Storage cho ảnh/media
   |-- External APIs: TMDB, Google Books, OMDb
   |-- Cron: Vercel Cron Jobs, bảo vệ bằng CRON_SECRET
```

---

## 5. Lộ trình theo giai đoạn

### Giai đoạn 0 — Trang tĩnh ✅
Trang HTML/CSS/JS đếm ngày yêu nhau. (Xong)

### Giai đoạn 0.5 — Git + GitHub Private ✅
(Xong)

### Giai đoạn 1 — Backend cơ bản (local) ✅
FastAPI + SQLite local + API lời nhắn hôm nay. (Xong)

### Giai đoạn 1.5 — Hạ tầng Vercel + Supabase ✅
- Tạo project Supabase, dùng connection string Postgres (pooler cổng 6543)
- Đổi backend sang Postgres
- Deploy backend lên Vercel (Serverless Functions)
- Deploy frontend lên Vercel (Static)

### Giai đoạn 2 — Đăng nhập bảo mật ✅
Session cookie + bcrypt, 2 tài khoản định sẵn.

### Giai đoạn 3 — Nhật ký & Timeline ✅
Bảng journal, form nhập bài viết, hiển thị theo thời gian giảm dần.

### Giai đoạn 4 — Album ảnh ✅
Upload ảnh lên Supabase Storage, tổ chức theo album.

### Giai đoạn 5 — Quỹ chung & hoạt động đôi ✅
Thu/chi quỹ chung, mục tiêu, hoạt động đôi.

### Giai đoạn 6 — Kiến trúc 3 tầng + Media Hub + Tự động hoá ✅
- Tách backend thành `routers/`, `services/`, `repositories/`, `models/`
- Media Hub: phim/sách/nhạc, suggestions, refresh suggestions
- Cron tự động thêm suggestions, endpoint bảo vệ bằng `CRON_SECRET`
- Webhook Telegram/Discord còn là mục mở rộng ở giai đoạn sau nếu cần

### Giai đoạn 7 — Nâng cấp UI/UX (cập nhật 09/08/2026)
> Mục tiêu hiện tại là đưa giao diện gần với mockup hơn mà vẫn giữ bảng màu và mô hình dữ liệu hiện tại.

- **7.1** ✅ Cơ chế card thu gọn/mở rộng dùng chung
- **7.2** ✅ Đồng hồ: tổng số ngày + năm/tháng/ngày + "Quen nhau từ...–nay" + đồng hồ giờ thật
- **7.2.5** ✅ Điều hướng: sidebar cố định (desktop) + thanh dưới (mobile)
- **7.3** 🔄 Media Hub:
  - 7.3.1 ✅ Gợi ý dạng xem trước (bảng `suggestions` riêng), nút Thêm/Bỏ qua, nút làm mới gợi ý
  - 7.3.2 ✅ Tích hợp OMDb (IMDb + Tomatometer, tra theo mã IMDb chính xác thay vì tên), click mở rộng xem tóm tắt, hiện nguồn gợi ý ("Dựa trên: ...")
  - 7.3.3 — Carousel: chỉ hiện 2–3 thẻ/lượt, cuộn/kéo xem thêm
  - 7.3.4 ✅ Sort "đã xem" theo ngày đánh dấu (asc/desc)
  - 7.3.5 — Hợp nhất giao diện: 1 dropdown chọn loại + 1 ô tìm kiếm chung, thay vì 3 khung tách riêng; khung gợi ý dạng danh sách hàng ngang có sao đánh giá; lưới poster dọc 2:3 kèm badge trạng thái ("Đã xem xong" / "Dự định")
- **7.4** ✅ Album: bảng `albums` riêng, nhóm hiển thị theo tên album kèm số lượng, tạo/sort qua UI
  - 7.4.1 + 7.4.2 ✅ Upload nhiều ảnh 1 lượt (tối đa 30), nhớ album đã chọn lần trước, tự bỏ qua ảnh trùng (hash SHA-256)
  - 7.4.3 ✅ Xem ảnh toàn màn hình, duyệt ảnh, xem/sửa chi tiết (tên file, ngày, người tải, dung lượng, ghi chú)
  - 7.4.3d ✅ Lightbox: giữ tỉ lệ ảnh gốc, nút fullscreen, menu 3 chấm, nút tự ẩn/hiện sau 3s
  - 7.4.3e (mới, chưa làm) — Vuốt trái/phải để chuyển ảnh trên điện thoại (touch swipe)
  - 7.4.3f (mới, chưa làm) — Tách nút (i) riêng cạnh nút 3 chấm để xem ghi chú (cùng cơ chế ẩn/hiện 3s như các nút khác). Ghi chú mặc định hiển thị: nội dung + thời gian đăng ảnh + người đăng ảnh + người viết ghi chú (nếu có) — chỉ ở dạng xem. Sửa ghi chú chuyển vào menu 3 chấm ("Chỉnh sửa ghi chú"), tách khỏi khung xem
  - 7.4.4 — Kéo thả sắp xếp lại vị trí ảnh trong album
- **7.5** — Lời nhắn: tách card hiển thị/viết, lịch sử, đậm/mờ khi cuộn, bình luận/trả lời qua lại
- **7.6** ✅ Nhật ký: timeline dọc có đường nối + icon tâm trạng, sửa/xoá bài viết tại chỗ
- **7.7** — Trang Settings (3 khối): (1) Thông tin đôi — sửa ngày bắt đầu + tên gọi 2 người qua UI; (2) Thông báo — cấu hình Telegram/Discord webhook URL + nút Lưu/Gửi thử; (3) Lời nhắn hằng ngày — danh sách quản lý, hiện ngẫu nhiên 1 câu/ngày ở trang chủ. Không phân quyền admin/member (giữ đơn giản, 2 người cùng sửa được)
- **7.8** — Trang chủ dashboard: thêm avatar viết tắt tên 2 người nối bằng ❤️ vào khối đồng hồ (lấy tên từ Settings 7.7); khối "Xem gần đây" 2 cột cuối trang (ví dụ: nhật ký gần đây | hoạt động gần đây) kiểu "Xem tất cả →"

**Cân nhắc thêm/bớt so với mockup:**
- **Lưới 6 nút truy cập nhanh ở trang chủ:** bỏ qua.
- **Wishlist (trang riêng biệt):** để dành.
- **Quỹ chung mô hình chia tiền ai nợ ai:** giữ nguyên quỹ chung + mục tiêu tiết kiệm.

### Giai đoạn 8 — Gamification, domain riêng, tối ưu, định hướng mobile
Thẻ gamification ở trang chủ, domain riêng, responsive và chuẩn bị backend cho app Flutter.

### Giai đoạn 9 — Tích hợp nâng cao
Google Calendar auto-sync, Discord slash command nhập liệu nhanh.

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
| 6 | Kiến trúc 3 tầng, TMDB API, Google Books API, OMDb API, Vercel Cron Jobs |
| 7 | Không có hạ tầng mới lớn |
| 8 | Domain + SSL, Responsive design, (định hướng) Flutter |

---

## 7. Cấu trúc thư mục

```text
luvlog/
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── KE-HOACH-DU-AN.md
│   ├── Documentations.md
│   ├── PRD_ver2.md
│   ├── QUY-TAC-LAM-VIEC.md
│   └── README.md
├── .gitignore
└── README.md
```

---

## 8. Bước tiếp theo ưu tiên

1. Hoàn thiện Media Hub theo mockup: 7.3.3 + 7.3.5.
2. Hoàn thiện album reorder: 7.4.4.
3. Tinh chỉnh lời nhắn theo cấu trúc mới: 7.5.
4. Tinh chỉnh nhật ký timeline theo mockup: 7.6.
5. Thêm Settings: 7.7.
6. Thêm dashboard mới: 7.8.

> Ghi chú: `main` là nhánh bản chạy ổn định để deploy; mỗi feature nên làm trên nhánh riêng và merge lại sau khi test xong.

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

Còn lại trong Giai đoạn 7:
- **7.4.3e** — Vuốt trái/phải chuyển ảnh trên điện thoại (lightbox)
- **7.4.3f** — Tách nút (i) xem ghi chú riêng khỏi menu 3 chấm, ghi chú hiện dạng xem trước (nội dung + thời gian + người đăng ảnh + người viết), sửa chuyển vào menu 3 chấm
- **7.4.4** — Kéo thả sắp xếp lại vị trí ảnh trong album
- **7.3.5** — Hợp nhất giao diện Media Hub theo mockup (1 dropdown chọn loại + 1 ô tìm kiếm chung, thay 3 khung tách riêng)

Sau đó qua Giai đoạn 8 (gamification, domain, mobile) và Giai đoạn 9 (Google Calendar/Discord bot).
