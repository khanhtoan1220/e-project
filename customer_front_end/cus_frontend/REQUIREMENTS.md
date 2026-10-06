# Customer Frontend - Requirement Checklist

## Khách hàng

- Xem menu: đã có menu, danh mục, lọc món, giá và thêm vào giỏ.
- Đặt bàn theo ngày, giờ và số người: đã có form đặt bàn.
- Quét QR tại bàn để gọi món: flow gọi món đã có; việc QR phải trỏ tới bàn/hóa đơn do backend tạo.
- Gọi món và thêm ghi chú từng món: đã có ghi chú riêng từng món.
- Xem món đã gọi và trạng thái: cần endpoint Customer tương ứng của backend để nối chính xác, không giả lập.
- Gọi nhân viên với lý do cụ thể: đã có trang hỗ trợ với các lý do thêm nước, thêm dụng cụ, gọi nhân viên, thanh toán và khác.
- Yêu cầu hủy món: cần endpoint backend tương ứng để nối chính xác.
- Xem hóa đơn và yêu cầu thanh toán: cần endpoint Customer tương ứng để nối chính xác.

## Nhân viên phục vụ

Các chức năng sau thuộc Admin/nhân viên, không trộn vào Customer frontend:
- Sơ đồ bàn trống/đang dùng/đã đặt.
- Xác nhận đặt bàn, nhận khách và mở lượt phục vụ.
- Kiểm tra đơn mới, chuyển ghi chú cho bếp, mang món đã làm xong.
- Xử lý yêu cầu hỗ trợ và yêu cầu hủy.
- Xác nhận thanh toán và kết thúc lượt phục vụ.

Những phần chưa có endpoint Customer trong backend không được tự tạo API giả.
