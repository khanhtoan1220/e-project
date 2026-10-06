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
  Card,
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

      // Gọi tuần tự từng API theo chuẩn hướng dẫn của thầy Hòa
      const resHoaDon = await apiClient.get("/quan-tri/hoa-don", { params });
      setList(resHoaDon.data || []);

      const resBan = await apiClient.get("/quan-tri/ban-an");
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
    if (
      window.confirm(
        `Bạn có chắc chắn muốn HỦY hóa đơn mã "${maHD}"?\nHành động này không thể hoàn tác!`,
      )
    ) {
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
        return (
          <Badge
            bg="success-subtle"
            text="success"
            className="border border-success rounded-1 px-2 py-1"
          >
            Đã thanh toán
          </Badge>
        );
      case "chuaThanhToan":
        return (
          <Badge
            bg="warning-subtle"
            text="warning"
            className="border border-warning rounded-1 px-2 py-1"
          >
            Chưa thanh toán
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-page">
      {/* Style CSS ẩn các phần không cần thiết khi in hóa đơn */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />

      {/* Tiêu đề */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Hóa đơn</h1>
          <div className="text-muted small">
            Theo dõi và tra cứu toàn bộ lịch sử bán hàng, hóa đơn thanh toán
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
                Trạng thái
              </Form.Label>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={trangThaiFilter}
                onChange={(e) => setTrangThaiFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="daThanhToan">Đã thanh toán</option>
                <option value="chuaThanhToan">Chưa thanh toán</option>
                <option value="daHuy">Đã hủy</option>
              </Form.Select>
            </Col>

            <Col md={6} lg={3}>
              <Form.Label className="small text-secondary mb-1">
                Bàn ăn
              </Form.Label>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={banFilter}
                onChange={(e) => setBanFilter(e.target.value)}
              >
                <option value="">Tất cả bàn</option>
                {banList.map((ban) => (
                  <option key={ban._id} value={ban._id}>
                    {ban.ten} (
                    {ban.khuVuc === "tang1"
                      ? "Tầng 1"
                      : ban.khuVuc === "tang2"
                        ? "Tầng 2"
                        : "Tầng 3"}
                    )
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6} lg={3}>
              <Form.Label className="small text-secondary mb-1">
                Từ ngày
              </Form.Label>
              <Form.Control
                size="sm"
                className="rounded-1"
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
              />
            </Col>

            <Col md={6} lg={3}>
              <Form.Label className="small text-secondary mb-1">
                Đến ngày
              </Form.Label>
              <Form.Control
                size="sm"
                className="rounded-1"
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
              />
            </Col>

            <Col xs={12} className="d-flex gap-2 justify-content-end">
              {" "}
              <Button
                variant="dark"
                size="sm"
                type="submit"
                className="fw-semibold rounded-1 px-3"
              >
                Lọc
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-1"
                onClick={() => {
                  setTrangThaiFilter("");
                  setBanFilter("");
                  setTuNgay("");
                  setDenNgay("");
                  setTimeout(() => loadData(), 50);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Danh sách hóa đơn phẳng dẹt */}
      <div className="border border-light-subtle rounded-1 bg-white mb-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-secondary mt-2 mb-0">
              Đang tải danh sách hóa đơn...
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            Không có hóa đơn nào khớp với bộ lọc.
          </div>
        ) : (
          <Table hover responsive className="align-middle mb-0 table-sm">
            <thead className="table-light border-bottom">
              <tr>
                <th
                  className="px-3 py-2 text-muted fw-semibold small"
                  style={{ width: "120px" }}
                >
                  Mã hóa đơn
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "120px" }}
                >
                  Bàn ăn
                </th>
                <th className="py-2 text-muted fw-semibold small">Giờ vào</th>
                <th className="py-2 text-muted fw-semibold small">
                  Giờ thanh toán
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Tổng tiền
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "140px" }}
                >
                  Trạng thái
                </th>
                <th
                  className="py-2 text-muted fw-semibold text-end px-3 small"
                  style={{ width: "180px" }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((hd) => (
                <tr key={hd._id} className="border-bottom last-border-0">
                  <td className="px-3 py-2 fw-semibold text-secondary small">
                    {hd._id.substring(14).toUpperCase()}
                  </td>
                  <td className="py-2 fw-semibold text-dark small">
                    {hd.banId?.ten || "Bàn đã xóa"}
                  </td>
                  <td className="py-2 text-secondary small">
                    {new Date(hd.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {new Date(hd.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-2 text-secondary small">
                    {hd.trangThai === "daThanhToan" && hd.thoiGianRa ? (
                      <>
                        {new Date(hd.thoiGianRa).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {new Date(hd.thoiGianRa).toLocaleDateString("vi-VN")}
                      </>
                    ) : hd.trangThai === "daThanhToan" ? (
                      <>
                        {new Date(hd.updatedAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {new Date(hd.updatedAt).toLocaleDateString("vi-VN")}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2 fw-bold text-dark small">
                    {Number(hd.tongTien).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-2 small">
                    {renderInvoiceStatus(hd.trangThai)}
                  </td>
                  <td className="py-2 text-end px-3">
                    <Button
                      variant="link"
                      size="sm"
                      className="me-3 text-primary p-0 text-decoration-none small fw-semibold"
                      onClick={() => handleShowDetail(hd._id)}
                    >
                      Chi tiết
                    </Button>
                    {hd.trangThai === "chuaThanhToan" && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0 text-decoration-none small fw-semibold"
                        onClick={() =>
                          handleCancelInvoice(
                            hd._id,
                            hd._id.substring(12).toUpperCase(),
                          )
                        }
                      >
                        Hủy đơn
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal Chi tiết Hóa Đơn dẹt phẳng */}
      <Modal
        show={showDetailModal}
        onHide={() => {
          setShowDetailModal(false);
          setSelectedInvoice(null);
        }}
        size="lg"
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Modal.Header
          closeButton
          className="close-button py-2 px-3 border-bottom"
        >
          <Modal.Title className="fs-6 fw-bold text-dark">
            Chi tiết hóa đơn
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="print-area" className="p-4">
          {detailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" />
            </div>
          ) : !selectedInvoice ? (
            <div className="text-center py-5 text-secondary small">
              Không tải được dữ liệu hóa đơn.
            </div>
          ) : (
            <div>
              {/* Khung Hóa Đơn Thanh Toán (Dùng cho in ấn) */}
              <div className="text-center mb-4">
                <h4 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                  NHÀ HÀNG CHÚNG TÔI
                </h4>
                <p className="text-muted small mb-0">
                  Địa chỉ: 123 Đường ABC, Quận Cầu Giấy, Hà Nội
                </p>
                <p className="text-muted small mb-0">SĐT: 0912.345.678</p>
                <h5
                  className="fw-bold mt-4 "
                  style={{ fontSize: "1rem", letterSpacing: "1px" }}
                >
                  HÓA ĐƠN THANH TOÁN
                </h5>
                <small className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Mã HD: {selectedInvoice._id.toUpperCase()}
                </small>
              </div>

              <Row className="mb-3 small">
                <Col xs={6}>
                  <p className="mb-1">
                    Bàn:{" "}
                    <strong className="text-dark">
                      {selectedInvoice.banId?.ten || "Bàn đã xóa"} (
                      {selectedInvoice.banId?.khuVuc === "tang1"
                        ? "Tầng 1"
                        : "Tầng 2"}
                      )
                    </strong>
                  </p>
                  <p className="mb-1 text-muted">
                    Trạng thái:{" "}
                    {selectedInvoice.trangThai === "daThanhToan"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </p>
                </Col>
                <Col xs={6} className="text-end">
                  <p className="mb-1 text-muted">
                    Giờ vào:{" "}
                    {new Date(selectedInvoice.createdAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                  <p className="mb-1 text-muted">
                    Giờ in: {new Date().toLocaleString("vi-VN")}
                  </p>
                </Col>
              </Row>

              <Table
                bordered
                responsive
                className="align-middle my-3 table-sm small"
              >
                <thead className="table-light">
                  <tr>
                    <th className="py-2">Tên món ăn</th>
                    <th className="text-center py-2" style={{ width: "100px" }}>
                      Số lượng
                    </th>
                    <th className="text-end py-2" style={{ width: "120px" }}>
                      Đơn giá
                    </th>
                    <th className="text-end py-2" style={{ width: "140px" }}>
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.danhSachMon?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-dark py-2">
                        {item.ten || item.menuId?.ten || "Món đã xóa"}
                      </td>
                      <td className="text-center fw-bold py-2">
                        {item.soLuong}
                      </td>
                      <td className="text-end py-2">
                        {Number(item.gia).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="text-end fw-bold text-dark py-2">
                        {Number(item.gia * item.soLuong).toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </td>
                    </tr>
                  ))}
                  <tr className="border-top-2">
                    <td colSpan="3" className="text-end fw-bold py-2">
                      TỔNG CỘNG:
                    </td>
                    <td className="text-end fw-bold text-danger py-2 fs-6">
                      {Number(selectedInvoice.tongTien).toLocaleString("vi-VN")}
                      đ
                    </td>
                  </tr>
                </tbody>
              </Table>

              <div className="text-center mt-4">
                <p className="fst-italic text-muted small">
                  Cám ơn quý khách! Hẹn gặp lại quý khách lần sau!
                </p>
                <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Powered by Restaurant POS
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="close-button py-2 px-3 border-top">
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-1 px-3"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedInvoice(null);
            }}
          >
            Đóng
          </Button>
          <Button
            variant="dark"
            size="sm"
            onClick={handlePrint}
            className="fw-semibold rounded-1 px-3"
          >
            In hóa đơn (PDF)
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
