# luvlog — Kế hoạch Dự án Website Kỷ Niệm Cặp Đôi

> Cập nhật: 10/08/2026. Repo hiện có 2 luồng song song: production Next.js App Router trên `main`, và bộ nâng cấp Phase 7 của stack legacy/static-FastAPI vẫn được giữ trong repo để migrate dần.

---

## 1. Mục tiêu

Website riêng tư cho hai người, gồm: đồng hồ đếm ngày yêu, lời nhắn hằng ngày, nhật ký/timeline, album ảnh, quỹ chung, hoạt động đôi, media hub, và các tích hợp như webhook/Spotify/Calendar trong các giai đoạn sau.

---

## 2. Nguyên tắc

- Đi từng bước nhỏ
- Test xong mới qua bước tiếp
- Không hard-code secrets
- Cập nhật docs mỗi khi đổi tính năng hoặc thay đổi deploy/auth flow

---

## 3. Trạng thái hiện tại

### 3.1 Tóm tắt nhanh
- Production frontend đang chạy UI Next.js mới từ repo `luvlog`, branch `main`, project Vercel `luvlog-frontend`.
- Login production đã được sửa bằng cách thêm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, và `SUPABASE_ALLOWED_USER_IDS` rồi redeploy.
- Repo vẫn giữ bộ Phase 7 legacy/static đã nâng cấp sâu về UI/UX và backend để tiếp tục migrate từng phần sang codebase Next.js hiện tại.

### 3.2 Giai đoạn theo production mới
| Giai đoạn | Trạng thái |
|---|---|
| Phase 1 — Architecture, routing & auth foundation | ✅ Nền production đã chạy |
| Phase 2 — Storage infrastructure & core modules | 🔄 Đang làm |
| Phase 3 — External integrations | ⏳ Chưa bắt đầu |
| Phase 4 — UI/UX redesign | 🔄 Shell và một phần route đã lên UI mới |

### 3.3 Trạng thái code
- Next.js App Router đã có
- Middleware auth allowlist theo `SUPABASE_ALLOWED_USER_IDS`
- CRUD route handlers cho journal, album, photos, fund, activities, messages, media, settings, quotes
- Trang Album đã có form tạo album + upload ảnh để test trực tiếp
- Build Next.js pass
- Legacy `frontend/` + `backend/` vẫn còn trong repo và nay đã chứa thêm một đợt nâng cấp Phase 7 hoàn chỉnh hơn

---

## 4. Kiến trúc hiện tại

```text
Production:
Next.js App Router
  ├─ middleware auth
  ├─ route handlers
  └─ UI shell
        |
Supabase Auth + PostgreSQL

Song song trong repo:
frontend/ (static legacy)
backend/  (FastAPI legacy)
```

---

## 5. Phase 7 legacy đã được đẩy lên repo

> Đây là bộ nâng cấp UI/UX trên stack legacy được người dùng yêu cầu giữ lại trong `main` để tham chiếu/migrate tiếp, dù production hiện không deploy trực tiếp từ `frontend/`.

- **7.1** ✅ Cơ chế card thu gọn/mở rộng dùng chung
- **7.2** ✅ Đồng hồ: tổng số ngày + năm/tháng/ngày + "Quen nhau từ...-nay" + đồng hồ giờ thật
- **7.2.5** ✅ Điều hướng: sidebar cố định (desktop) + thanh dưới (mobile)
- **7.3** ✅ Media Hub:
  - suggestions preview + thêm/bỏ qua
  - OMDb detail
  - sort đã xem
  - giao diện hợp nhất 1 dropdown + 1 ô tìm kiếm
- **7.4** ✅ Album:
  - upload nhiều ảnh
  - tránh ảnh trùng bằng hash
  - lightbox xem/sửa metadata
  - swipe trái/phải trên mobile
  - kéo thả reorder ảnh
- **7.5** ✅ Lời nhắn:
  - spotlight
  - lịch sử rõ hơn
  - bình luận qua lại
- **7.6** ✅ Nhật ký:
  - timeline dọc
  - sửa/xóa tại chỗ
- **7.7** ✅ Settings:
  - thông tin đôi
  - webhook Telegram/Discord + test
  - quản lý lời nhắn hằng ngày
- **7.8** ✅ Dashboard:
  - avatar cặp đôi
  - khối xem gần đây

---

## 6. Việc tiếp theo

### 6.1 Trên production Next.js
1. Hoàn thiện các route UI còn placeholder trên App Router (`/media`, `/settings`, `/activities`, ...)
2. Tiếp tục Google Drive storage pipeline và các luồng upload/media còn thiếu
3. Spotify / Google Calendar / Discord
4. RBAC settings nếu spec vẫn giữ

### 6.2 Từ bộ legacy vừa đẩy lên repo
1. Chọn các hành vi đã hoàn thiện để port sang Next.js:
   - media hub hợp nhất
   - album lightbox + reorder
   - settings 3 khối
   - message/journal redesign
2. Tránh merge mù các file docs/code legacy vào production route handlers mà không đối chiếu lại với App Router

---

## 7. Ghi chú vận hành

- `main` vẫn là nhánh production chuẩn.
- Sau mốc này, mọi feature production mới nên branch từ `main`.
- Bộ code legacy Phase 7 vừa được giữ trong `main` chủ yếu để làm nguồn migrate, không phải tín hiệu rằng nên quay lại deploy frontend tĩnh.
