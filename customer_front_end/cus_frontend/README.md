# Customer Frontend - e-project

Đây là frontend Customer. Cài và chạy:

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## Flow hiện có

1. Xem menu và danh mục.
2. Đặt bàn theo thời gian và số người.
3. Thêm món vào giỏ.
4. Ghi chú riêng từng món.
5. Gọi món khi có `hoaDonId`.
6. Gọi nhân viên/hỗ trợ với lý do cụ thể.

Các chức năng xem trạng thái món đã gọi, hủy món, xem hóa đơn và thanh toán chỉ được nối khi backend có endpoint Customer tương ứng; không giả lập API.
