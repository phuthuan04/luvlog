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

## Kiến trúc

```
Frontend tĩnh (Vercel) <--REST API--> Backend FastAPI (Vercel Serverless) <--> Supabase PostgreSQL
```

Chi tiết đầy đủ và lộ trình các giai đoạn tiếp theo: [`docs/KE-HOACH-DU-AN.md`](docs/KE-HOACH-DU-AN.md)
Quy tắc làm việc của dự án: [`docs/QUY-TAC-LAM-VIEC.md`](docs/QUY-TAC-LAM-VIEC.md)
Lịch sử thay đổi: [`docs/CHANGELOG.md`](docs/CHANGELOG.md)

## Cấu trúc thư mục

```
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