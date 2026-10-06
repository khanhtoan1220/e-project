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
  Card,
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
    if (
      window.confirm(
        `Bạn có chắc muốn ${actionName} lịch đặt bàn của khách "${tenKhach}"?`,
      )
    ) {
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
        return (
          <Badge
            bg="warning-subtle"
            text="warning"
            className="border border-warning rounded-1 px-2 py-1"
          >
            Chờ xác nhận
          </Badge>
        );
      case "daXacNhan":
        return (
          <Badge
            bg="success-subtle"
            text="success"
            className="border border-success rounded-1 px-2 py-1"
          >
            Đã xác nhận
          </Badge>
        );
      case "daHuy":
        return (
          <Badge
            bg="danger-subtle"
            text="danger"
            className="border border-danger rounded-1 px-2 py-1"
          >
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge
            bg="secondary-subtle"
            text="secondary"
            className="border rounded-1 px-2 py-1"
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="admin-page">
      {/* Tiêu đề */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Đặt bàn</h1>
          <div className="text-muted small">
            Quản lý danh sách đặt bàn, phê duyệt hoặc hủy yêu cầu đặt trước
          </div>
        </div>
      </div>

      {/* Thông báo */}
      {msg && (
        <div
          className="alert alert-success alert-dismissible fade show py-2 px-3 small"
          role="alert"
        >
          {msg}
        </div>
      )}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show py-2 px-3 small"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Bộ lọc dẹt phẳng */}
      <div className="border border-light-subtle rounded-1 bg-white p-3 mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-2 align-items-end">
            <Col md={6} lg={3}>
              <Form.Label className="small text-secondary mb-1">
                Tìm kiếm khách
              </Form.Label>
              <Form.Control
                size="sm"
                className="rounded-1"
                placeholder="Tên khách hàng, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>

            <Col md={6} lg={3}>
              <Form.Label className="small text-secondary mb-1">
                Trạng thái
              </Form.Label>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={trangThaiFilter}
                onChange={(e) => setTrangThaiFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="choXacNhan">Chờ xác nhận</option>
                <option value="daXacNhan">Đã xác nhận</option>
                <option value="daHuy">Đã hủy</option>
              </Form.Select>
            </Col>

            <Col md={6} lg={3}>
              <Form.Label className="small text-secondary mb-1">
                Chọn ngày hẹn
              </Form.Label>
              <Form.Control
                size="sm"
                className="rounded-1"
                type="date"
                value={ngayFilter}
                onChange={(e) => setNgayFilter(e.target.value)}
              />
            </Col>

            <Col md={6} lg={3} className="d-flex gap-2">
              <Button
                variant="dark"
                size="sm"
                className="fw-semibold rounded-1 px-3 w-100"
                type="submit"
              >
                Tìm lọc
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-1"
                onClick={() => {
                  setSearch("");
                  setTrangThaiFilter("");
                  setNgayFilter("");
                  setTimeout(() => loadData(), 50);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Danh sách đặt bàn phẳng dẹt */}
      <div className="border border-light-subtle rounded-1 bg-white mb-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-secondary mt-2 mb-0">
              Đang tải danh sách đặt bàn...
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            Không tìm thấy yêu cầu đặt bàn nào.
          </div>
        ) : (
          <Table hover responsive className="align-middle mb-0 table-sm">
            <thead className="table-light border-bottom">
              <tr>
                <th
                  className="px-3 py-2 text-muted fw-semibold small"
                  style={{ width: "60px" }}
                >
                  #
                </th>
                <th className="py-2 text-muted fw-semibold small">
                  Khách hàng
                </th>
                <th className="py-2 text-muted fw-semibold small">
                  Số điện thoại
                </th>
                <th
                  className="py-2 text-muted fw-semibold small text-center"
                  style={{ width: "100px" }}
                >
                  Số khách
                </th>
                <th className="py-2 text-muted fw-semibold small">
                  Thời gian hẹn
                </th>
                <th className="py-2 text-muted fw-semibold small">Ghi chú</th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "140px" }}
                >
                  Trạng thái
                </th>
                <th
                  className="py-2 text-muted fw-semibold text-end px-3 small"
                  style={{ width: "160px" }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((db, idx) => (
                <tr key={db._id} className="border-bottom last-border-0">
                  <td className="px-3 py-2 text-secondary small">{idx + 1}</td>
                  <td className="py-2 fw-semibold text-dark small">
                    {db.tenKhach}
                  </td>
                  <td className="py-2 text-secondary small">
                    {db.soDienThoai}
                  </td>
                  <td className="py-2 fw-bold text-dark text-center small">
                    {db.soNguoi}
                  </td>
                  <td className="py-2 text-secondary small">
                    {new Date(db.thoiGianDat).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {new Date(db.thoiGianDat).toLocaleDateString("vi-VN")}
                  </td>
                  <td
                    className="py-2 text-secondary small text-truncate"
                    style={{ maxWidth: "160px" }}
                    title={db.ghiChu}
                  >
                    {db.ghiChu || "-"}
                  </td>
                  <td className="py-2 small">
                    {renderStatusBadge(db.trangThai)}
                  </td>
                  <td className="py-2 text-end px-3">
                    {db.trangThai === "choXacNhan" ? (
                      <>
                        <Button
                          variant="link"
                          size="sm"
                          className="me-3 text-success p-0 text-decoration-none small fw-semibold"
                          onClick={() =>
                            handleUpdateStatus(db._id, "daXacNhan", db.tenKhach)
                          }
                        >
                          Duyệt
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0 text-decoration-none small fw-semibold"
                          onClick={() =>
                            handleUpdateStatus(db._id, "daHuy", db.tenKhach)
                          }
                        >
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted small">Đã duyệt</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
