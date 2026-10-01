import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  Form,
  Spinner,
  Row,
  Col,
  InputGroup,
  Card
} from "react-bootstrap";
import apiClient from "../utils/api";
import URL from "../constants/URL";

export default function DatBan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc
  const [search, setSearch] = useState("");
  const [trangThaiFilter, setTrangThaiFilter] = useState("");
  const [ngayFilter, setNgayFilter] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { all: "true" };
      if (search) params.search = search;
      if (trangThaiFilter) params.trangThai = trangThaiFilter;
      if (ngayFilter) params.ngay = ngayFilter;

      const res = await apiClient.get(URL.DAT_BAN, { params });
      setList(res.data || []);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [trangThaiFilter, ngayFilter]); // Reload khi lọc Trạng Thái hoặc Ngày đặt bàn

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUpdateStatus = async (id, newStatus, tenKhach) => {
    const actionName = newStatus === "daXacNhan" ? "XÁC NHẬN DUYỆT" : "HỦY";
    if (window.confirm(`Bạn có chắc muốn ${actionName} lịch đặt bàn của khách "${tenKhach}"?`)) {
      try {
        setError("");
        setMsg("");
        
        // Gọi PATCH /api/quan-tri/dat-ban/:id để cập nhật trạng thái
        await apiClient.patch(`${URL.DAT_BAN}/${id}`, { trangThai: newStatus });
        
        setMsg(`Đã ${actionName.toLowerCase()} lịch đặt bàn thành công!`);
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "choXacNhan":
        return <Badge bg="warning" text="dark">⏳ Chờ xác nhận</Badge>;
      case "daXacNhan":
        return <Badge bg="success">🟢 Đã xác nhận</Badge>;
      case "daHuy":
        return <Badge bg="danger">🔴 Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div>
      {/* Tiêu đề */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">📅 Quản Lý Đặt Bàn Trước</h2>
          <p className="text-secondary mb-0">Kiểm soát lịch hẹn, duyệt bàn hoặc từ chối yêu cầu đặt trước của khách hàng</p>
        </div>
      </div>

      {/* Thông báo */}
      {msg && <div className="alert alert-success alert-dismissible fade show py-2 px-3 small" role="alert">{msg}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show py-2 px-3 small" role="alert">{error}</div>}

      {/* Bộ lọc lọc & tìm kiếm */}
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label className="small fw-bold text-secondary">Tìm kiếm</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="Tên khách hàng, số điện thoại..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="secondary" type="submit">
                    Tìm
                  </Button>
                </InputGroup>
              </Col>
              
              <Col md={3}>
                <Form.Label className="small fw-bold text-secondary">Trạng thái</Form.Label>
                <Form.Select
                  value={trangThaiFilter}
                  onChange={(e) => setTrangThaiFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="choXacNhan">Chờ xác nhận</option>
                  <option value="daXacNhan">Đã xác nhận</option>
                  <option value="daHuy">Đã hủy</option>
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-secondary">Chọn ngày hẹn</Form.Label>
                <Form.Control
                  type="date"
                  value={ngayFilter}
                  onChange={(e) => setNgayFilter(e.target.value)}
                />
              </Col>

              <Col md={2} className="text-md-end">
                <Button 
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearch("");
                    setTrangThaiFilter("");
                    setNgayFilter("");
                    setTimeout(() => loadData(), 50);
                  }}
                >
                  Đặt lại lọc
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Danh sách đặt bàn */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2 mb-0">Đang tải danh sách đặt bàn...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              Không tìm thấy yêu cầu đặt bàn nào.
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: "80px" }}>#</th>
                  <th className="py-3">Khách Hàng</th>
                  <th className="py-3">Số Điện Thoại</th>
                  <th className="py-3" style={{ width: "120px" }}>Số Người</th>
                  <th className="py-3">Thời Gian Hẹn</th>
                  <th className="py-3">Ghi Chú Đặc Biệt</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="py-3 text-end px-4" style={{ width: "250px" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((db, idx) => (
                  <tr key={db._id}>
                    <td className="px-4 py-3 text-secondary">{idx + 1}</td>
                    <td className="py-3 fw-bold text-dark">{db.tenKhach}</td>
                    <td className="py-3 fw-semibold">{db.soDienThoai}</td>
                    <td className="py-3 fw-bold text-primary text-center">{db.soNguoi}</td>
                    <td className="py-3 fw-semibold">
                      {new Date(db.thoiGianDat).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} -
                      {new Date(db.thoiGianDat).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 text-secondary text-truncate" style={{ maxWidth: "180px" }} title={db.ghiChu}>
                      {db.ghiChu || "-"}
                    </td>
                    <td className="py-3">{renderStatusBadge(db.trangThai)}</td>
                    <td className="py-3 text-end px-4">
                      {db.trangThai === "choXacNhan" ? (
                        <>
                          <Button 
                            variant="success" 
                            size="sm"
                            className="me-2 fw-semibold"
                            onClick={() => handleUpdateStatus(db._id, "daXacNhan", db.tenKhach)}
                          >
                            ✔️ Xác nhận
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="fw-semibold"
                            onClick={() => handleUpdateStatus(db._id, "daHuy", db.tenKhach)}
                          >
                            ❌ Hủy
                          </Button>
                        </>
                      ) : (
                        <span className="text-secondary small">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}