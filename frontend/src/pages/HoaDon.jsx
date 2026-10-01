import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Row,
  Col,
  Card
} from "react-bootstrap";
import apiClient from "../utils/api";
import URL from "../constants/URL";

export default function HoaDon() {
  const [list, setList] = useState([]);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc
  const [trangThaiFilter, setTrangThaiFilter] = useState("");
  const [banFilter, setBanFilter] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");

  // State Modal Chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Tạo params cho API lọc hóa đơn
      const params = { all: "true" };
      if (trangThaiFilter) params.trangThai = trangThaiFilter;
      if (banFilter) params.banId = banFilter;
      if (tuNgay) params.tuNgay = tuNgay;
      if (denNgay) params.denNgay = denNgay;

      const [resHoaDon, resBan] = await Promise.all([
        apiClient.get("/quan-tri/hoa-don", { params }),
        apiClient.get(URL.BAN_AN)
      ]);

      setList(resHoaDon.data || []);
      setBanList(resBan.data || []);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [trangThaiFilter, banFilter]); // Tự reload khi đổi trạng thái hoặc bàn ăn

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleShowDetail = async (id) => {
    try {
      setShowDetailModal(true);
      setDetailLoading(true);
      
      const res = await apiClient.get(`/quan-tri/hoa-don/${id}`);
      setSelectedInvoice(res.data);
    } catch (err) {
      alert("Không thể lấy thông tin chi tiết hóa đơn!");
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelInvoice = async (id, maHD) => {
    if (window.confirm(`Bạn có chắc chắn muốn HỦY hóa đơn mã "${maHD}"?\nHành động này không thể hoàn tác!`)) {
      try {
        setError("");
        setMsg("");
        await apiClient.patch(`/quan-tri/hoa-don/${id}/huy`);
        setMsg(`Hủy hóa đơn "${maHD}" thành công! Bàn ăn đã được dọn sạch.`);
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  const renderInvoiceStatus = (status) => {
    switch (status) {
      case "daThanhToan":
        return <Badge bg="success">🟢 Đã thanh toán</Badge>;
      case "chuaThanhToan":
        return <Badge bg="warning" text="dark">🟡 Chưa thanh toán</Badge>;
      case "daHuy":
        return <Badge bg="danger">🔴 Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Style CSS ẩn các phần không cần thiết khi in hóa đơn */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .modal-footer, .btn, .close-button, .btn-close {
            display: none !important;
          }
        }
      `}} />

      {/* Tiêu đề */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">🧾 Quản Lý Hóa Đơn & Doanh Thu</h2>
          <p className="text-secondary mb-0">Theo dõi toàn bộ lịch sử bán hàng và hóa đơn thanh toán của nhà hàng</p>
        </div>
      </div>

      {/* Thông báo */}
      {msg && <div className="alert alert-success alert-dismissible fade show py-2 px-3 small" role="alert">{msg}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show py-2 px-3 small" role="alert">{error}</div>}

      {/* Bộ lọc */}
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Label className="small fw-bold text-secondary">Trạng thái</Form.Label>
                <Form.Select
                  value={trangThaiFilter}
                  onChange={(e) => setTrangThaiFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="daThanhToan">Đã thanh toán</option>
                  <option value="chuaThanhToan">Chưa thanh toán</option>
                  <option value="daHuy">Đã hủy</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label className="small fw-bold text-secondary">Chọn Bàn</Form.Label>
                <Form.Select
                  value={banFilter}
                  onChange={(e) => setBanFilter(e.target.value)}
                >
                  <option value="">Tất cả bàn</option>
                  {banList.map(ban => (
                    <option key={ban._id} value={ban._id}>{ban.ten} ({ban.khuVuc})</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={2.5}>
                <Form.Label className="small fw-bold text-secondary">Từ ngày</Form.Label>
                <Form.Control 
                  type="date" 
                  value={tuNgay} 
                  onChange={(e) => setTuNgay(e.target.value)} 
                />
              </Col>

              <Col md={2.5}>
                <Form.Label className="small fw-bold text-secondary">Đến ngày</Form.Label>
                <Form.Control 
                  type="date" 
                  value={denNgay} 
                  onChange={(e) => setDenNgay(e.target.value)} 
                />
              </Col>

              <Col md={2} className="d-flex gap-2">
                <Button variant="primary" type="submit" className="w-100 fw-bold">
                  Lọc ngày
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setTrangThaiFilter("");
                    setBanFilter("");
                    setTuNgay("");
                    setDenNgay("");
                    setTimeout(() => loadData(), 50);
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Danh sách hóa đơn */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2 mb-0">Đang tải danh sách hóa đơn...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              Không có hóa đơn nào khớp với bộ lọc.
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Mã Hóa Đơn</th>
                  <th className="py-3">Bàn Ăn</th>
                  <th className="py-3">Giờ Vào</th>
                  <th className="py-3">Giờ Ra</th>
                  <th className="py-3">Tổng Tiền</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="py-3 text-end px-4" style={{ width: "220px" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((hd) => (
                  <tr key={hd._id}>
                    <td className="px-4 py-3 fw-bold text-secondary" style={{ fontSize: "0.85rem" }}>
                      {hd._id.substring(12).toUpperCase()}... {/* Rút gọn mã */}
                    </td>
                    <td className="py-3 fw-bold text-dark">{hd.banId?.ten || "Bàn đã xóa"}</td>
                    <td className="py-3 text-secondary" style={{ fontSize: "0.85rem" }}>
                      {new Date(hd.createdAt).toLocaleTimeString("vi-VN")} {new Date(hd.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 text-secondary" style={{ fontSize: "0.85rem" }}>
                      {hd.trangThai === "daThanhToan" ? (
                        <>
                          {new Date(hd.updatedAt).toLocaleTimeString("vi-VN")} {new Date(hd.updatedAt).toLocaleDateString("vi-VN")}
                        </>
                      ) : "-"}
                    </td>
                    <td className="py-3 fw-bold text-primary">
                      {Number(hd.tongTien).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="py-3">{renderInvoiceStatus(hd.trangThai)}</td>
                    <td className="py-3 text-end px-4">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2 fw-semibold"
                        onClick={() => handleShowDetail(hd._id)}
                      >
                        👁️ Chi tiết
                      </Button>
                      {hd.trangThai === "chuaThanhToan" && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className="fw-semibold"
                          onClick={() => handleCancelInvoice(hd._id, hd._id.substring(12).toUpperCase())}
                        >
                          ❌ Hủy đơn
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal Chi tiết Hóa Đơn */}
      <Modal show={showDetailModal} onHide={() => { setShowDetailModal(false); setSelectedInvoice(null); }} size="lg" backdrop="static">
        <Modal.Header closeButton className="close-button">
          <Modal.Title className="fw-bold text-dark">🧾 Chi Tiết Hóa Đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body id="print-area">
          {detailLoading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : !selectedInvoice ? (
            <div className="text-center py-5 text-secondary">Không tải được dữ liệu hóa đơn.</div>
          ) : (
            <div>
              {/* Khung Hóa Đơn Thanh Toán (Dùng cho in ấn) */}
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-1">NHÀ HÀNG CHÚNG TÔI</h3>
                <p className="text-secondary mb-0">Địa chỉ: 123 Đường ABC, Quận Cầu Giấy, Hà Nội</p>
                <p className="text-secondary mb-0">SĐT: 0912.345.678</p>
                <h4 className="fw-bold mt-4 text-uppercase">HÓA ĐƠN THANH TOÁN</h4>
                <small className="text-secondary">Mã HD: {selectedInvoice._id.toUpperCase()}</small>
              </div>

              <Row className="mb-3">
                <Col xs={6}>
                  <p className="mb-1">Bàn: <strong>{selectedInvoice.banId?.ten || "Bàn đã xóa"} ({selectedInvoice.banId?.khuVuc || "-"})</strong></p>
                  <p className="mb-1 text-secondary">Trạng thái: {renderInvoiceStatus(selectedInvoice.trangThai)}</p>
                </Col>
                <Col xs={6} className="text-end">
                  <p className="mb-1 text-secondary">Giờ vào: {new Date(selectedInvoice.createdAt).toLocaleString("vi-VN")}</p>
                  <p className="mb-1 text-secondary">Giờ in: {new Date().toLocaleString("vi-VN")}</p>
                </Col>
              </Row>

              <Table striped bordered responsive className="align-middle my-4">
                <thead className="table-dark">
                  <tr>
                    <th>Tên Món Ăn</th>
                    <th className="text-center" style={{ width: "100px" }}>Số Lượng</th>
                    <th className="text-end" style={{ width: "150px" }}>Đơn Giá</th>
                    <th className="text-end" style={{ width: "150px" }}>Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.danhSachMon?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{item.ten || item.menuId?.ten || "Món đã xóa"}</td>
                      <td className="text-center fw-bold">{item.soLuong}</td>
                      <td className="text-end">{Number(item.gia).toLocaleString("vi-VN")}đ</td>
                      <td className="text-end fw-bold text-primary">
                        {Number(item.gia * item.soLuong).toLocaleString("vi-VN")}đ
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" className="text-end fw-bold fs-5">TỔNG CỘNG:</td>
                    <td className="text-end fw-bold text-danger fs-5">
                      {Number(selectedInvoice.tongTien).toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                </tbody>
              </Table>

              <div className="text-center mt-5">
                <p className="fst-italic text-secondary">Cám ơn quý khách! Hẹn gặp lại quý khách lần sau!</p>
                <p className="text-secondary small">Powered by Restaurant Admin</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="close-button">
          <Button variant="secondary" onClick={() => { setShowDetailModal(false); setSelectedInvoice(null); }}>Đóng</Button>
          <Button variant="primary" onClick={handlePrint} className="fw-bold">
            🖨️ In Hóa Đơn (PDF)
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}