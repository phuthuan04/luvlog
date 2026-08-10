# luvlog — Kế hoạch Dự án Website Kỷ Niệm Cặp Đôi

> Cập nhật: 10/08/2026. Dự án đang migrate sang Next.js App Router + TypeScript + Tailwind + Supabase Auth/Route Handlers theo spec mới.

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
- Phase 1 của spec mới đang triển khai
- Đã có App Router shell, middleware allowlist UUID, route handlers core, build pass
- Còn thiếu: Google Drive, Spotify, Calendar, Discord, RBAC settings, UI redesign

### 3.2 Giai đoạn
| Giai đoạn | Trạng thái |
|---|---|
| Phase 1 — Architecture, routing & auth foundation | 🔄 Đang làm |
| Phase 2 — Storage infrastructure & core modules | ⏳ Chưa bắt đầu |
| Phase 3 — External integrations | ⏳ Chưa bắt đầu |
| Phase 4 — UI/UX redesign | ⏳ Chưa bắt đầu |

### 3.3 Trạng thái code
- Next.js App Router đã có
- Middleware auth allowlist theo `SUPABASE_ALLOWED_USER_IDS`
- CRUD route handlers cho journal, album, photos, fund, activities, messages, media, settings, quotes
- Trang Album đã có form tạo album + upload ảnh để test trực tiếp
- Build Next.js pass
- Nếu thiếu env Supabase public trên Vercel, middleware sẽ bỏ qua auth thay vì làm site crash

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
- motion polish

---

## 6. Việc tiếp theo

1. Google Drive storage pipeline
2. Spotify / Google Calendar / Discord
3. RBAC settings
4. UI redesign final
