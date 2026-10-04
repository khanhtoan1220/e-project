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
  Table,
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
  const [khuVuc, setKhuVuc] = useState("tang1");

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

  const uniqueKhuVucs = [...new Set(list.map((item) => item.khuVuc))];
  const filteredList = khuVucFilter
    ? list.filter((item) => item.khuVuc === khuVucFilter)
    : list;

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
    if (
      window.confirm(`Xác nhận THANH TOÁN cho bàn "${tenBan}" và in hóa đơn?`)
    ) {
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
          label: "Bàn Trống",
        };
      case "dangSuDung":
        return {
          bg: "bg-danger bg-opacity-10 border-danger text-danger cursor-pointer",
          badgeBg: "danger",
          label: "Đang Sử Dụng",
        };
      case "choDonDep":
        return {
          bg: "bg-warning bg-opacity-10 border-warning text-warning-emphasis",
          badgeBg: "warning",
          label: "Chờ Dọn Dẹp",
        };
      case "datTruoc":
      case "daDatTruoc":
        return {
          bg: "bg-primary bg-opacity-10 border-primary text-primary",
          badgeBg: "primary",
          label: "Đã Đặt Trước",
        };
      default:
        return {
          bg: "bg-secondary bg-opacity-10 border-secondary text-secondary",
          badgeBg: "secondary",
          label: trangThai,
        };
    }
  };

  return (
    <div className="admin-page">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Bàn ăn</h1>
          <div className="text-muted small">
            Quản lý sơ đồ bàn, tình trạng bàn ăn và dọn dẹp bàn
          </div>
        </div>
        <Button
          variant="dark"
          size="sm"
          className="fw-semibold rounded-1 px-3"
          onClick={() => setShowAddModal(true)}
        >
          + Thêm bàn mới
        </Button>
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

      {/* Thanh lọc khu vực phẳng dẹt */}
      <div className="d-flex gap-2 mb-3 bg-white p-3 border border-light-subtle rounded-1 align-items-center">
        <span className="fw-semibold text-secondary small me-2">
          Bộ lọc khu vực:
        </span>
        <Button
          variant={khuVucFilter === "" ? "dark" : "outline-secondary"}
          size="sm"
          className="rounded-1 py-1 px-2.5 small"
          onClick={() => setKhuVucFilter("")}
        >
          Tất cả
        </Button>
        {uniqueKhuVucs.map((kv) => (
          <Button
            key={kv}
            variant={khuVucFilter === kv ? "dark" : "outline-secondary"}
            size="sm"
            className="rounded-1 py-1 px-2.5 small"
            onClick={() => setKhuVucFilter(kv)}
          >
            {kv === "tang1"
              ? "Tầng 1"
              : kv === "tang2"
                ? "Tầng 2"
                : kv === "tang3"
                  ? "Tầng 3"
                  : kv}
          </Button>
        ))}
      </div>

      {/* Lưới hiển thị các Card bàn ăn */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary mt-2 mb-0">
            Đang nạp trạng thái bàn ăn...
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-5 text-secondary bg-white rounded-3 ">
          Chưa có bàn ăn nào được thêm.
        </div>
      ) : (
        <Row className="g-2">
          {filteredList.map((ban) => {
            const status = getStatusInfo(ban.trangThai);
            return (
              <Col key={ban._id} xs={6} sm={4} md={3} lg={3}>
                <div
                  className="rounded-1 p-3 d-flex flex-column justify-content-between h-100 bg-white border"
                  style={{
                    minHeight: "160px",
                    cursor:
                      ban.trangThai === "dangSuDung" ? "pointer" : "default",
                    borderLeft:
                      ban.trangThai === "dangSuDung"
                        ? "4px solid #fca5a5"
                        : ban.trangThai === "choDonDep"
                          ? "4px solid #fde047"
                          : "1px solid #cbd5e1",
                  }}
                  onClick={() =>
                    ban.trangThai === "dangSuDung" && handleOpenBillDetails(ban)
                  }
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge
                      bg="light"
                      text="dark"
                      className="border border-light-subtle rounded-1 font-weight-normal"
                    >
                      {ban.khuVuc === "tang1"
                        ? "Tầng 1"
                        : ban.khuVuc === "tang2"
                          ? "Tầng 2"
                          : "Tầng 3"}
                    </Badge>
                    <Button
                      variant="link"
                      className="text-danger p-0 border-0 lh-1 text-decoration-none small"
                      title="Xóa bàn"
                      disabled={ban.trangThai !== "trong"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBan(ban._id, ban.ten, ban.trangThai);
                      }}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="my-2 text-center">
                    <h4 className="fw-bold text-dark mb-1 h5">{ban.ten}</h4>
                    <Badge bg={status.badgeBg}>{status.label}</Badge>
                  </div>

                  {/* Nút hành động dẹt phẳng */}
                  <div className="mt-2 pt-2 border-top border-light-subtle d-flex flex-column gap-1">
                    {ban.trangThai === "trong" && (
                      <Button
                        variant="dark"
                        size="sm"
                        className="w-100 fw-semibold py-1 rounded-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoBan(ban._id, ban.ten);
                        }}
                      >
                        Mở bàn
                      </Button>
                    )}
                    {ban.trangThai === "choDonDep" && (
                      <Button
                        variant="outline-dark"
                        size="sm"
                        className="w-100 fw-semibold py-1 rounded-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDonBan(ban._id, ban.ten);
                        }}
                      >
                        Xác nhận dọn dẹp
                      </Button>
                    )}
                    {ban.trangThai === "dangSuDung" && (
                      <div className="text-center text-secondary small fw-semibold py-1">
                        Bấm xem hóa đơn
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal Thêm Bàn Ăn */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Form onSubmit={handleCreateBan}>
          <Modal.Header closeButton className="py-2 px-3 border-bottom">
            <Modal.Title className="fs-6 fw-bold text-dark">
              Thêm bàn ăn mới
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Tên bàn ăn
              </Form.Label>
              <Form.Control
                required
                className="rounded-1 form-control-sm"
                placeholder="VD: Bàn số 1, Bàn số 2, Bàn VIP 01..."
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold text-secondary small">
                Khu vực / Tầng
              </Form.Label>
              <Form.Select
                className="rounded-1 form-select-sm"
                value={khuVuc}
                onChange={(e) => setKhuVuc(e.target.value)}
              >
                <option value="tang1">Tầng 1</option>
                <option value="tang2">Tầng 2</option>
                <option value="tang3">Tầng 3</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="py-2 px-3 border-top">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-1 px-3"
              onClick={() => setShowAddModal(false)}
            >
              Hủy
            </Button>
            <Button
              variant="dark"
              size="sm"
              type="submit"
              className="fw-semibold rounded-1 px-3"
            >
              Tạo bàn
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Xem nhanh Hóa Đơn dẹt phẳng */}
      <Modal
        show={showBillModal}
        onHide={() => {
          setShowBillModal(false);
          setSelectedBan(null);
          setSelectedHoaDon(null);
        }}
        size="lg"
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Modal.Header closeButton className="py-2 px-3 border-bottom">
          <Modal.Title className="fs-6 fw-bold text-dark">
            Hóa đơn hiện tại - {selectedBan?.ten} (
            {selectedBan?.khuVuc === "tang1" ? "Tầng 1" : "Tầng 2"})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          {billLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" />
            </div>
          ) : !selectedHoaDon ? (
            <div className="text-center py-4 text-secondary small">
              Bàn này chưa có món ăn nào được gọi.
            </div>
          ) : (
            <div>
              <p className="text-secondary small mb-3">
                Thời gian mở:{" "}
                <strong>
                  {new Date(selectedHoaDon.createdAt).toLocaleString("vi-VN")}
                </strong>
              </p>

              <Table
                bordered
                hover
                responsive
                className="align-middle table-sm small"
              >
                <thead className="table-light">
                  <tr>
                    <th>Tên món ăn</th>
                    <th className="text-center" style={{ width: "90px" }}>
                      Số lượng
                    </th>
                    <th className="text-end" style={{ width: "110px" }}>
                      Đơn giá
                    </th>
                    <th className="text-end" style={{ width: "130px" }}>
                      Thành tiền
                    </th>
                    <th className="text-center" style={{ width: "120px" }}>
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedHoaDon.danhSachMon?.map((item, idx) => (
                    <tr key={idx} className="border-bottom last-border-0">
                      <td className="fw-semibold text-dark">{item.ten}</td>
                      <td className="text-center fw-bold">{item.soLuong}</td>
                      <td className="text-end">
                        {Number(item.gia).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="text-end fw-bold text-dark">
                        {Number(item.gia * item.soLuong).toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </td>
                      <td className="text-center">
                        {item.trangThaiMon === "choXacNhan" && (
                          <Badge
                            bg="warning-subtle"
                            text="warning"
                            className="border border-warning rounded-1"
                          >
                            Chờ nấu
                          </Badge>
                        )}
                        {item.trangThaiMon === "dangLam" && (
                          <Badge
                            bg="primary-subtle"
                            text="primary"
                            className="border border-primary rounded-1"
                          >
                            Đang làm
                          </Badge>
                        )}
                        {item.trangThaiMon === "daXong" && (
                          <Badge
                            bg="success-subtle"
                            text="success"
                            className="border border-success rounded-1"
                          >
                            Đã xong
                          </Badge>
                        )}
                        {item.trangThaiMon === "daHuy" && (
                          <Badge
                            bg="danger-subtle"
                            text="danger"
                            className="border border-danger rounded-1"
                          >
                            Đã hủy
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-top">
                    <td colSpan="3" className="text-end fw-bold py-2">
                      TỔNG CỘNG:
                    </td>
                    <td className="text-end fw-bold text-danger py-2 fs-6">
                      {Number(selectedHoaDon.tongTien || 0).toLocaleString(
                        "vi-VN",
                      )}
                      đ
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="py-2 px-3 border-top">
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-1 px-3"
            onClick={() => {
              setShowBillModal(false);
              setSelectedBan(null);
              setSelectedHoaDon(null);
            }}
          >
            Đóng
          </Button>
          {selectedHoaDon && (
            <Button
              variant="dark"
              size="sm"
              className="fw-semibold rounded-1 px-3"
              onClick={() =>
                handleThanhToanBill(selectedHoaDon._id, selectedBan?.ten)
              }
            >
              Thanh Toán & Đóng Bàn
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
