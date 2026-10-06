import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Spinner } from "react-bootstrap";
import {
  get_danhsach_hotro_service,
  xac_nhan_hotro_service,
} from "../services/staff_service";

const tenLoaiYeuCau = {
  goiNhanVien: "Gọi nhân viên",
  themDungCu: "Thêm dụng cụ",
  themNuoc: "Thêm nước",
  thanhToan: "Yêu cầu thanh toán",
  khac: "Yêu cầu khác",
};

export default function YeuCauHoTro() {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangXuLyId, setDangXuLyId] = useState("");
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");

  const taiDanhSach = useCallback(async (hienThiLoading = false) => {
    try {
      if (hienThiLoading) setDangTai(true);
      setLoi("");
      setDanhSach(await get_danhsach_hotro_service());
    } catch (error) {
      setLoi(String(error));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    taiDanhSach(true);
    const intervalId = window.setInterval(() => taiDanhSach(), 5000);
    return () => window.clearInterval(intervalId);
  }, [taiDanhSach]);

  const hoanTatYeuCau = async (id) => {
    try {
      setDangXuLyId(id);
      setLoi("");
      await xac_nhan_hotro_service(id);
      setDanhSach((hienTai) => hienTai.filter((item) => item._id !== id));
      setThongBao("Đã đánh dấu yêu cầu là xử lý xong.");
    } catch (error) {
      setLoi(String(error));
    } finally {
      setDangXuLyId("");
    }
  };

  return (
    <section className="staff-page">
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Yêu cầu hỗ trợ</h1>
          <div className="text-muted small">
            Yêu cầu khách gửi từ mã QR sẽ xuất hiện tại đây. Danh sách tự cập nhật mỗi 5 giây.
          </div>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => taiDanhSach(true)}>
          Tải lại
        </Button>
      </div>

      {thongBao && <Alert variant="success" dismissible onClose={() => setThongBao("")}>{thongBao}</Alert>}
      {loi && <Alert variant="danger" dismissible onClose={() => setLoi("")}>{loi}</Alert>}

      {dangTai ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" />
          <p className="text-secondary mt-2">Đang tải yêu cầu...</p>
        </div>
      ) : danhSach.length === 0 ? (
        <div className="empty-state">Hiện không có yêu cầu hỗ trợ nào đang chờ.</div>
      ) : (
        <div className="d-grid gap-3">
          {danhSach.map((item) => (
            <Card key={item._id} className="border-0 shadow-sm">
              <Card.Body className="d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h2 className="h5 mb-0">Bàn {item.banId?.ten || "không rõ"}</h2>
                    <Badge bg="warning" text="dark">Đang chờ</Badge>
                    <Badge bg="light" text="dark" className="border">
                      {tenLoaiYeuCau[item.loaiYeuCau] || item.loaiYeuCau}
                    </Badge>
                  </div>
                  {item.noiDung && <p className="mb-2">{item.noiDung}</p>}
                  <div className="small text-secondary">
                    Gửi lúc: {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "Không rõ"}
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <Button
                    variant="success"
                    disabled={dangXuLyId === item._id}
                    onClick={() => hoanTatYeuCau(item._id)}
                  >
                    {dangXuLyId === item._id ? "Đang cập nhật..." : "Đánh dấu đã xử lý"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
