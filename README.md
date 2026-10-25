# Verity – Đọc theo cách của bạn

Website đánh giá và gợi ý sách, dự án học tập lớp 11.2.

## Cách cài đặt và chạy

### Yêu cầu

- [Node.js](https://nodejs.org/) phiên bản 18 trở lên

### Bước 1: Cài Node.js (nếu chưa có)

Tải về tại: https://nodejs.org/

### Bước 2: Cài các gói phụ thuộc

Mở terminal trong thư mục này và chạy:

```
npm install
```

### Bước 3: Chạy server phát triển

```
npm run dev
```

Sau đó mở trình duyệt tại: http://localhost:5173

### Bước 4 (tuỳ chọn): Build bản xuất bản

```
npm run build
npm run preview
```

---

## Cấu trúc thư mục

```
src/
  components/       Thành phần dùng chung (Header, Footer, BookCover, BookCard...)
  data/             Dữ liệu mẫu (books.ts) và lớp localStorage (storage.ts)
  pages/            5 trang chính
  store/            Context (Auth, Shelf, Modal)
  utils/            Hàm tiện ích (tìm kiếm không dấu)
```

## Tính năng

- 5 trang: Trang chủ, Khám phá, Gợi ý cho bạn, Tủ sách, Chi tiết sách
- Đăng ký/Đăng nhập (mô phỏng, lưu localStorage)
- Khảo sát 3 câu → Nhận gợi ý sách cá nhân hoá
- Tủ sách cá nhân (Đã đọc / Đang đọc / Muốn đọc)
- Thử thách đọc sách theo năm + Chuỗi theo tuần
- Đánh giá và nhận xét sách
- Tìm kiếm không dấu tiếng Việt
- Lọc theo thể loại, sắp xếp
- Responsive: điện thoại, máy tính bảng, máy tính

## Lưu ý

Đây là dự án học tập. Dữ liệu lưu trong localStorage của trình duyệt, không có bảo mật thực sự.
Tài khoản demo: nhấn "Dùng tài khoản demo (An Nguyễn)" trong hộp thoại đăng nhập.
