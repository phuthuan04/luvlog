# luvlog

Website riêng tư cho hai người — đồng hồ đếm ngày yêu, lời nhắn hằng ngày, và các tính năng sẽ mở rộng dần.

## Live

| Thành phần | URL |
|---|---|
| Frontend | https://luvlog-frontend.vercel.app |
| Backend API | https://luvlog.vercel.app |

## Trạng thái hiện tại

- ✅ Trang tĩnh (đồng hồ đếm ngày)
- ✅ Backend FastAPI trên Vercel + Supabase PostgreSQL
- ✅ Đăng nhập session cookie + bcrypt (2 tài khoản)
- ✅ Lời nhắn hôm nay (yêu cầu đăng nhập)
- ✅ Nhật ký & Timeline (form nhập + hiển thị theo thời gian)
- ✅ Album ảnh (upload + xem theo album, lưu trên Supabase Storage)
- ✅ Quỹ chung (nhiều mục tiêu song song, mỗi mục tiêu theo dõi tiến độ riêng)
- ✅ Hoạt động đôi (địa điểm đã đi, phân loại, đếm số lần trùng)
- ✅ Kiến trúc backend 3 tầng (routers/services/repositories)
- ✅ Media Hub: phim/sách (tìm kiếm qua TMDB + Google Books, watchlist + đánh giá) và nhạc (nhập tay)
- ✅ Cron tự động gợi ý phim/sách mỗi đêm (dựa trên đánh giá ≥ 4 sao), hiện riêng khung "Gợi ý cho hôm nay"

## Cấu trúc

```
luvlog/
├── frontend/          # HTML/CSS/JS tĩnh — deploy Vercel Static
├── backend/           # FastAPI — deploy Vercel Serverless
├── docs/              # Kế hoạch & quy tắc làm việc nội bộ
├── README.md          # Tổng quan nhanh (file này)
└── Documentations.md  # Tài liệu kỹ thuật đầy đủ
```

## Chạy local

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # điền giá trị thật
uvicorn main:app --reload
```

### Frontend

Mở `frontend/index.html` bằng Live Server, hoặc serve tĩnh. Khi dev local, cần thêm origin frontend vào CORS trong `backend/main.py`.

## Tài liệu

- [Documentations.md](./Documentations.md) — API, biến môi trường, kiến trúc, changelog
- [docs/KE-HOACH-DU-AN.md](./docs/KE-HOACH-DU-AN.md) — lộ trình đầy đủ
- [docs/QUY-TAC-LAM-VIEC.md](./docs/QUY-TAC-LAM-VIEC.md) — quy tắc phát triển

> **Quy ước:** Mỗi khi thêm/sửa tính năng, cập nhật song song `README.md`, `Documentations.md`, và `docs/KE-HOACH-DU-AN.md`.
