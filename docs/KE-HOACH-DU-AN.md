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

| Giai đoạn | Trạng thái |
|---|---|
| 0 — Trang tĩnh | ✅ Xong |
| 0.5 — Git + GitHub Private | ✅ Xong (đang đổi nơi deploy sang Vercel) |
| 1 — Backend FastAPI + SQLite (local) | ✅ Xong về logic, sẽ deploy lại trên hạ tầng mới |
| 1.5 — Hạ tầng Vercel + Supabase | ⏳ Chưa làm (mới) |
| 2 — Đăng nhập bảo mật | 🔄 Đang làm lại (đổi bcrypt trực tiếp, chỉ dùng VS Code Terminal) |
| 3 trở đi | ⏳ Chưa bắt đầu |

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

### Giai đoạn 7 — Gamification, domain riêng, tối ưu, định hướng mobile
Thử thách cặp đôi, mua domain, responsive, chuẩn bị backend cho app Flutter nếu cần sau này.

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
| 7 | Domain + SSL, Responsive design, (định hướng) Flutter |

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

## 9. Bước tiếp theo

Khi ra lệnh "làm", bắt đầu từ Giai đoạn 1.5 (hạ tầng Vercel + Supabase) trước, vì Giai đoạn 2 (đăng nhập) nên chạy thẳng trên hạ tầng mới luôn, tránh làm 2 lần.
