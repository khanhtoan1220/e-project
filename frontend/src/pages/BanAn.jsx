import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Table
} from "react-bootstrap";
import apiClient from "../utils/api";
import URL from "../constants/URL";

export default function BanAn() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc khu vực
  const [khuVucFilter, setKhuVucFilter] = useState("");

  // State Modal Thêm Bàn
  const [showAddModal, setShowAddModal] = useState(false);
  const [ten, setTen] = useState("");
  const [khuVuc, setKhuVuc] = useState("Tầng 1");

  // State Modal xem Hóa đơn / Gọi món nhanh của Bàn ăn
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBan, setSelectedBan] = useState(null);
  const [selectedHoaDon, setSelectedHoaDon] = useState(null);
  const [billLoading, setBillLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // 1. Gọi API Sơ đồ bàn ăn chuẩn (GET /phuc-vu/so-do-ban)
      const res = await apiClient.get("/phuc-vu/so-do-ban");
      setList(res.data || []);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uniqueKhuVucs = [...new Set(list.map(item => item.khuVuc))];
  const filteredList = khuVucFilter ? list.filter(item => item.khuVuc === khuVucFilter) : list;

  // Thêm bàn mới (Quyền Admin)
  const handleCreateBan = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMsg("");
      await apiClient.post("/quan-tri/ban-an", { ten, khuVuc });
      setMsg(`Đã tạo "${ten}" tại khu vực ${khuVuc} thành công!`);
      setShowAddModal(false);
      setTen("");
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  // Xóa bàn ăn (Quyền Admin)
  const handleDeleteBan = async (id, tenBan, trangThai) => {
    if (trangThai !== "trong") {
      alert(`Bàn "${tenBan}" đang có khách hoặc chờ dọn dẹp, không được xóa!`);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa bàn "${tenBan}"?`)) {
      try {
        setError("");
        setMsg("");
        await apiClient.delete(`/quan-tri/ban-an/${id}`);
        setMsg(`Xóa bàn "${tenBan}" thành công!`);
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  // Mở bàn ăn trống (Tạo hóa đơn chưa thanh toán mới)
  const handleMoBan = async (banId, tenBan) => {
    if (window.confirm(`Xác nhận MỞ BÀN cho khách ngồi tại bàn "${tenBan}"?`)) {
      try {
        setError("");
        setMsg("");
        await apiClient.post("/phuc-vu/mo-ban", { banId });
        setMsg(`Mở bàn "${tenBan}" thành công!`);
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  // Dọn bàn ăn xong (Đưa bàn chờ dọn về trạng thái trống)
  const handleDonBan = async (banId, tenBan) => {
    try {
      setError("");
      setMsg("");
      await apiClient.patch(`/phuc-vu/don-ban/${banId}`);
      setMsg(`Đã dọn dẹp sạch sẽ "${tenBan}". Sẵn sàng phục vụ khách mới!`);
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  // Nhấp vào bàn đang có khách để hiển thị hóa đơn
  const handleOpenBillDetails = async (ban) => {
    setSelectedBan(ban);
    setShowBillModal(true);
    setBillLoading(true);
    try {
      // Gọi API GET /phuc-vu/hoa-don-ban/:id
      const res = await apiClient.get(`/phuc-vu/hoa-don-ban/${ban._id}`);
      setSelectedHoaDon(res.data);
    } catch (err) {
      setSelectedHoaDon(null);
    } finally {
      setBillLoading(false);
    }
  };

  // Thực hiện Thanh toán hóa đơn bàn ăn trực tiếp
  const handleThanhToanBill = async (hoaDonId, tenBan) => {
    if (window.confirm(`Xác nhận THANH TOÁN cho bàn "${tenBan}" và in hóa đơn?`)) {
      try {
        setBillLoading(true);
        await apiClient.post("/phuc-vu/thanh-toan", { hoaDonId });
        alert("Thanh toán thành công! Đang dọn dẹp bàn.");
        setShowBillModal(false);
        loadData();
      } catch (err) {
        alert(err.toString());
      } finally {
        setBillLoading(false);
      }
    }
  };

  const getStatusInfo = (trangThai) => {
    switch (trangThai) {
      case "trong":
        return {
          bg: "bg-success bg-opacity-10 border-success text-success",
          badgeBg: "success",
          label: "Bàn Trống"
        };
      case "dangSuDung":
        return {
          bg: "bg-danger bg-opacity-10 border-danger text-danger cursor-pointer",
          badgeBg: "danger",
          label: "Đang Sử Dụng"
        };
      case "choDonDep":
        return {
          bg: "bg-warning bg-opacity-10 border-warning text-warning-emphasis",
          badgeBg: "warning",
          label: "Chờ Dọn Dẹp"
        };
      case "daDatTruoc":
        return {
          bg: "bg-primary bg-opacity-10 border-primary text-primary",
          badgeBg: "primary",
          label: "Đã Đặt Trước"
        };
      default:
        return {
          bg: "bg-secondary bg-opacity-10 border-secondary text-secondary",
          badgeBg: "secondary",
          label: trangThai
        };
    }
  };

  return (
    <div>
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">🪑 Quản Lý Sơ Đồ & Phục Vụ Bàn</h2>
          <p className="text-secondary mb-0">Theo dõi trực quan bàn ăn, tạo phiên gọi món, thanh toán hóa đơn và dọn dẹp bàn</p>
        </div>
        <Button variant="primary" className="fw-bold" onClick={() => setShowAddModal(true)}>
          + Thêm Bàn Mới
        </Button>
      </div>

      {/* Thông báo */}
      {msg && <div className="alert alert-success alert-dismissible fade show py-2 px-3 small" role="alert">{msg}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show py-2 px-3 small" role="alert">{error}</div>}

      {/* Thanh lọc khu vực */}
      <div className="d-flex gap-2 mb-4 bg-white p-3 rounded shadow-sm align-items-center">
        <span className="fw-bold text-secondary me-2"><i className="bi bi-funnel-fill"></i> Khu vực:</span>
        <Button 
          variant={khuVucFilter === "" ? "primary" : "outline-secondary"}
          size="sm"
          onClick={() => setKhuVucFilter("")}
        >
          Tất Cả Khu Vực
        </Button>
        {uniqueKhuVucs.map(kv => (
          <Button
            key={kv}
            variant={khuVucFilter === kv ? "primary" : "outline-secondary"}
            size="sm"
            onClick={() => setKhuVucFilter(kv)}
          >
            {kv}
          </Button>
        ))}
      </div>

      {/* Lưới hiển thị các Card bàn ăn */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary mt-2 mb-0">Đang nạp trạng thái bàn ăn...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-5 text-secondary bg-white rounded-3 shadow-sm">
          Chưa có bàn ăn nào được thêm.
        </div>
      ) : (
        <Row className="g-4">
          {filteredList.map((ban) => {
            const status = getStatusInfo(ban.trangThai);
            return (
              <Col key={ban._id} xs={6} sm={4} md={3} lg={2.4}>
                <Card 
                  className={`h-100 border-2 rounded-4 shadow-sm text-center ${status.bg}`} 
                  style={{ transition: "transform 0.2s", cursor: ban.trangThai === "dangSuDung" ? "pointer" : "default" }}
                  onClick={() => ban.trangThai === "dangSuDung" && handleOpenBillDetails(ban)}
                >
                  <Card.Body className="p-3 d-flex flex-column justify-content-between" style={{ minHeight: "160px" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge bg="secondary" className="small-text">{ban.khuVuc}</Badge>
                      <Button 
                        variant="link"
                        className="text-danger p-0 border-0 lh-1"
                        title="Xóa bàn"
                        disabled={ban.trangThai !== "trong"}
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện Click Card mở bill
                          handleDeleteBan(ban._id, ban.ten, ban.trangThai);
                        }}
                      >
                        <i className="bi bi-trash3-fill fs-5"></i>
                      </Button>
                    </div>
                    
                    <div className="my-2">
                      <h4 className="fw-bold text-dark mb-1">{ban.ten}</h4>
                      <Badge bg={status.badgeBg} className="fw-semibold mt-1 px-3 py-1.5 rounded-pill">
                        {status.label}
                      </Badge>
                    </div>

                    {/* Nút hành động nhanh dựa trên trạng thái của Bàn */}
                    <div className="mt-2 pt-2 border-top border-black-10">
                      {ban.trangThai === "trong" && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="w-100 fw-bold py-1" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoBan(ban._id, ban.ten);
                          }}
                        >
                          🔓 Mở Bàn
                        </Button>
                      )}
                      {ban.trangThai === "choDonDep" && (
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="w-100 fw-bold py-1 text-dark" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDonBan(ban._id, ban.ten);
                          }}
                        >
                          🧹 Dọn Bàn
                        </Button>
                      )}
                      {ban.trangThai === "dangSuDung" && (
                        <small className="text-danger fw-bold d-block py-1">👉 Xem Hóa Đơn</small>
                      )}
                      {ban.trangThai === "daDatTruoc" && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-100 fw-bold py-1" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoBan(ban._id, ban.ten);
                          }}
                        >
                          🔓 Khách Đến
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal Thêm Bàn Ăn */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static">
        <Form onSubmit={handleCreateBan}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-dark">🪑 Thêm Bàn Ăn Mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Tên bàn ăn</Form.Label>
              <Form.Control
                required
                placeholder="VD: Bàn số 1, Bàn số 2, Bàn VIP 01..."
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Khu vực / Tầng</Form.Label>
              <Form.Select
                value={khuVuc}
                onChange={(e) => setKhuVuc(e.target.value)}
              >
                <option value="Tầng 1">Tầng 1</option>
                <option value="Tầng 2">Tầng 2</option>
                <option value="Tầng 3">Tầng 3</option>
                <option value="Khu vực sân vườn">Khu vực sân vườn</option>
                <option value="Phòng VIP">Khu phòng VIP</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" className="fw-bold">+ Lưu Bàn</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Xem nhanh Hóa Đơn khi click vào Bàn Đang Sử Dụng */}
      <Modal show={showBillModal} onHide={() => { setShowBillModal(false); setSelectedBan(null); setSelectedHoaDon(null); }} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark">
            🧾 Hóa Đơn Hiện Tại - {selectedBan?.ten} ({selectedBan?.khuVuc})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {billLoading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : !selectedHoaDon ? (
            <div className="text-center py-4 text-secondary">
              Bàn này chưa có món ăn nào được gọi.
            </div>
          ) : (
            <div>
              <p className="text-secondary mb-3">
                Mở bàn lúc: <strong>{new Date(selectedHoaDon.createdAt).toLocaleString("vi-VN")}</strong>
              </p>
              
              <Table striped bordered hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Tên Món Ăn</th>
                    <th className="text-center" style={{ width: "100px" }}>Số Lượng</th>
                    <th className="text-end" style={{ width: "130px" }}>Đơn Giá</th>
                    <th className="text-end" style={{ width: "150px" }}>Thành Tiền</th>
                    <th className="text-center">Trạng Thái Món</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedHoaDon.danhSachMon?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{item.ten}</td>
                      <td className="text-center fw-bold">{item.soLuong}</td>
                      <td className="text-end">{Number(item.gia).toLocaleString("vi-VN")}đ</td>
                      <td className="text-end fw-bold text-primary">
                        {Number(item.gia * item.soLuong).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="text-center">
                        {item.trangThaiMon === "choXacNhan" && <Badge bg="warning" text="dark">⏳ Chờ duyệt</Badge>}
                        {item.trangThaiMon === "dangCheBien" && <Badge bg="info" text="dark">🍳 Đang làm</Badge>}
                        {item.trangThaiMon === "daXong" && <Badge bg="success">✔️ Đã xong</Badge>}
                        {item.trangThaiMon === "daHuy" && <Badge bg="danger">❌ Đã hủy</Badge>}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" className="text-end fw-bold fs-5">TỔNG THANH TOÁN:</td>
                    <td className="text-end fw-bold text-danger fs-5">
                      {Number(selectedHoaDon.tongTien || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowBillModal(false); setSelectedBan(null); setSelectedHoaDon(null); }}>Đóng</Button>
          {selectedHoaDon && (
            <Button 
              variant="danger" 
              className="fw-bold" 
              onClick={() => handleThanhToanBill(selectedHoaDon._id, selectedBan?.ten)}
            >
              💵 Thanh Toán & Đóng Bàn
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}