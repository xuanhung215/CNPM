# Hệ thống Quản lý Điểm Rèn Luyện

## Yêu cầu tiên quyết
- Node.js (phiên bản 18 trở lên)
- npm hoặc yarn
- PostgreSQL (hoặc sử dụng cơ sở dữ liệu online như Neon đã được cấu hình sẵn)

## Cài đặt và chạy dự án

### 1. Cài đặt thư viện cho Backend
Mở terminal, di chuyển vào thư mục `backend ` và chạy lệnh:
```bash
cd backend
npm install
```

### 2. Cài đặt thư viện cho Frontend
Mở terminal mới, di chuyển vào thư mục `frontend` và chạy lệnh:
```bash
cd frontend
npm install
```

### 3. Chạy Backend
Trong thư mục `backend `, chạy lệnh:
```bash
npm run start:dev
```
Backend sẽ chạy trên http://localhost:3000

### 4. Chạy Frontend
Trong thư mục `frontend`, chạy lệnh:
```bash
npm run dev
```
Frontend sẽ chạy trên http://localhost:5173 (hoặc port khác nếu 5173 đã được sử dụng)

## Thông tin cấu hình
- Cơ sở dữ liệu đã được cấu hình sẵn trong file `backend /.env` sử dụng Neon PostgreSQL
- Backend sử dụng NestJS framework
- Frontend sử dụng React + Vite + TypeScript
- Hệ thống sử dụng Socket.IO để gửi thông báo real-time

## Chức năng chính
- Quản lý người dùng (Admin)
- Quản lý danh mục (Khoa, Chương trình đào tạo, Lớp)
- Quản lý kỳ đánh giá
- Nộp phiếu tự đánh giá (Sinh viên)
- Xét duyệt phiếu (Ban cán sự, Cố vấn học tập)
- Khiếu nại điểm
- Thông báo real-time (Chuông thông báo trên header)
