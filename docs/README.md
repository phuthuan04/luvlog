# luvlog

Website riêng tư ghi lại kỷ niệm của hai người.

> 💌 luvlog được làm dành cho Khánh Đan, người yêu của anh.
>
> Mong rằng nơi này sẽ lưu giữ được thật nhiều kỷ niệm đẹp của hai đứa mình.
>
> Anh yêu em.
>
> — phuthuan04

---

## Tính năng hiện tại
- Đồng hồ đếm thời gian yêu nhau
- Lời nhắn hằng ngày
- Đăng nhập Supabase Auth + middleware allowlist UUID
- App Router + route handlers cho các module chính
- Album ảnh, quỹ chung, hoạt động đôi, nhật ký, media hub
- Ảnh hiện được upload lên Google Drive và lưu `drive_file_id` trong database
- Trang Album hiện đã có form tạo album + upload ảnh để test trực tiếp

## Kiến trúc hiện tại

```text
Next.js App Router + Route Handlers <--> Supabase Auth / PostgreSQL
                          |
                          +--> legacy FastAPI / static code still kept during migration
```

## Tài liệu
- [Kế hoạch dự án](./KE-HOACH-DU-AN.md)
- [Tài liệu kỹ thuật](./Documentations.md)
- [Quy tắc làm việc](./QUY-TAC-LAM-VIEC.md)
- [Lịch sử thay đổi](./CHANGELOG.md)

## Trạng thái

Đang migrate sang spec mới:
- Phase 1: architecture, routing, auth foundation
- Phase 2: Google Drive storage & core module migration
- Phase 3: integrations
- Phase 4: UI/UX redesign

## Chạy local

```powershell
npm install
npm run dev
```

Tạo file `.env.local` theo mẫu `.env.example`.
Nhớ khai báo đủ biến Supabase/Google Drive thì middleware và upload mới chạy đầy đủ.

## Deploy

| Phần | Nền tảng |
|---|---|
| App | Vercel |
| Database | Supabase PostgreSQL |

## Công nghệ

Next.js, TypeScript, Tailwind CSS, Supabase Auth, Supabase PostgreSQL, Vercel.
