# luvlog — Kế hoạch Dự án Website Kỷ Niệm Cặp Đôi

> Cập nhật: 10/08/2026. Dự án đang migrate sang Next.js App Router + TypeScript + Tailwind + Supabase Auth/Route Handlers theo spec mới. Production frontend hiện chạy từ `main` trên project Vercel `luvlog-frontend`.

---

## 1. Mục tiêu

Website riêng tư cho hai người, gồm: đồng hồ đếm ngày yêu, lời nhắn hằng ngày, nhật ký/timeline, album ảnh, quỹ chung & hoạt động, media hub, và các tích hợp sau này.

---

## 2. Nguyên tắc

- Đi từng bước nhỏ
- Test xong mới qua bước tiếp
- Không hard-code secrets
- Cập nhật docs mỗi khi đổi tính năng

---

## 3. Trạng thái hiện tại

### 3.1 Tóm tắt nhanh
- Phase 1 của spec mới đã đủ nền để chạy production
- Đã có App Router shell, middleware allowlist UUID, route handlers core, build pass, và login production đã xác nhận hoạt động sau khi bổ sung env
- Còn thiếu: hoàn thiện UI cho các module placeholder, tiếp tục migrate Drive/media flows, Spotify, Calendar, Discord, RBAC settings

### 3.2 Giai đoạn
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
- Production frontend dùng repo `luvlog`, branch `main`, project `luvlog-frontend`
- Lỗi login production ngày 10/08/2026 đã được xử lý bằng cách thêm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, và `SUPABASE_ALLOWED_USER_IDS` trên Vercel rồi redeploy

---

## 4. Kiến trúc tổng thể

```text
Next.js App Router
  ├─ middleware auth
  ├─ route handlers
  └─ UI shell
        |
Supabase Auth + PostgreSQL
```

---

## 5. Lộ trình

### Phase 1 — Architecture, routing & auth foundation
- App Router
- login page
- middleware allowlist UUID
- route handlers core

### Phase 2 — Storage infrastructure & core modules
- Google Drive upload pipeline
- media metadata / drive_file_id
- `/api/photos` nhận multipart form-data và lưu ảnh lên Drive

### Phase 3 — External integrations
- Spotify
- Google Calendar
- Discord webhook/bot

### Phase 4 — UI/UX redesign
- Tailwind design system
- responsive navigation
- dashboard shell / login / album test UI đã có trên production
- migrate dần các màn hình placeholder (`/media`, `/settings`, ...) sang UI hoàn chỉnh

---

## 6. Việc tiếp theo

1. Hoàn thiện các route UI còn placeholder trên App Router (`/media`, `/settings`, `/activities`, ...)
2. Tiếp tục Google Drive storage pipeline và các luồng upload/media còn thiếu
3. Spotify / Google Calendar / Discord
4. RBAC settings nếu spec vẫn giữ
