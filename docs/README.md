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
- Đồng hồ đếm thời gian yêu nhau (năm/tháng/ngày/giờ/phút/giây)
- Lời nhắn hằng ngày, đồng bộ giữa hai người
- Đăng nhập bảo mật (session cookie + mật khẩu băm bcrypt)
- Album ảnh với upload nhiều ảnh, nhóm theo album và lightbox xem ảnh
- Media Hub với gợi ý phim/sách, OMDb detail, refresh suggestions
- Quỹ chung & hoạt động đôi

## Kiến trúc

```text
Frontend tĩnh (Vercel) <--REST API--> Backend FastAPI (Vercel Serverless) <--> Supabase PostgreSQL
```

Tài liệu chính cho kế hoạch: [`docs/KE-HOACH-DU-AN.md`](docs/KE-HOACH-DU-AN.md)

Tài liệu API: [`docs/Documentations.md`](docs/Documentations.md)

Quy tắc làm việc: [`docs/QUY-TAC-LAM-VIEC.md`](docs/QUY-TAC-LAM-VIEC.md)

Lịch sử thay đổi: [`docs/CHANGELOG.md`](docs/CHANGELOG.md)

## Trạng thái hiện tại

Giai đoạn 7 đang được triển khai. Các phần đã có cơ bản: media detail với OMDb, album lightbox, upload nhiều ảnh, suggestions, auth và CRUD chính. Các mục tiếp theo ưu tiên là Media Hub mockup nâng cao, album reorder, lời nhắn, nhật ký timeline, settings và dashboard mới.

## Cấu trúc thư mục

```text
luvlog/
├── frontend/       # HTML/CSS/JS tĩnh
├── backend/        # FastAPI (Vercel Serverless Functions)
├── docs/           # Tài liệu dự án
├── .gitignore
└── README.md
```

## Chạy local

### Backend
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Tạo file `backend/.env` theo mẫu `backend/.env.example`, điền giá trị thật (không commit file `.env`).

### Frontend
```powershell
start frontend/index.html
```

## Deploy

| Phần | Nền tảng | Link |
|---|---|---|
| Frontend | Vercel Static | https://luvlog-frontend.vercel.app |
| Backend | Vercel Serverless | https://luvlog.vercel.app |
| Database | Supabase PostgreSQL | — |

## Công nghệ

Python, FastAPI, SQLAlchemy, bcrypt, Vercel (Serverless + Static), Supabase (PostgreSQL + Storage).
