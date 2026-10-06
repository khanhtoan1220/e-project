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
  InputGroup,
  Card,
} from "react-bootstrap";
import apiClient from "../utils/api";
import URL from "../constants/URL";

const getErrorMessage = (err) =>
  err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";

export default function KhoNguyenLieu() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc
  const [search, setSearch] = useState("");
  const [tinhTrangFilter, setTinhTrangFilter] = useState("");

  // State Modal Thêm / Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [ten, setTen] = useState("");
  const [donViTinh, setDonViTinh] = useState("kg");
  const [soLuongTon, setSoLuongTon] = useState(0);

  // State Modal Nhập Kho Nhanh
  const [showNhapKhoModal, setShowNhapKhoModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [soLuongThem, setSoLuongThem] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { all: "true" };
      if (search) params.search = search;
      if (tinhTrangFilter) params.tinhTrang = tinhTrangFilter;

      const res = await apiClient.get(URL.KHO, { params });
      setList(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tinhTrangFilter]); // Tự lọc ngay khi đổi Trạng Thái tồn

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTen("");
    setDonViTinh("kg");
    setSoLuongTon(0);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setEditingId(item._id);
    setTen(item.ten);
    setDonViTinh(item.donVi);
    setSoLuongTon(item.soLuongTon);
    setShowModal(true);
  };

  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    const data = {
      ten,
      donVi: donViTinh,
      soLuongTon: Number(soLuongTon),
    };

    try {
      if (isEditMode) {
        await apiClient.put(`${URL.KHO}/${editingId}`, data);
        setMsg(`Cập nhật nguyên liệu "${ten}" thành công!`);
      } else {
        await apiClient.post(URL.KHO, data);
        setMsg(`Thêm nguyên liệu "${ten}" thành công!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleOpenNhapKhoModal = (item) => {
    setSelectedIngredient(item);
    setSoLuongThem("");
    setShowNhapKhoModal(true);
  };

  const handleSaveNhapKho = async (e) => {
    e.preventDefault();
    if (!soLuongThem || Number(soLuongThem) <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ lớn hơn 0!");
      return;
    }
    try {
      setError("");
      setMsg("");

      // Gọi API Patch /api/quan-tri/nhap-kho của Backend
      await apiClient.patch("/quan-tri/nhap-kho", {
        id: selectedIngredient._id,
        soLuongThem: Number(soLuongThem),
      });

      setMsg(
        `Đã nhập thêm +${soLuongThem} ${selectedIngredient.donVi} cho nguyên liệu ${selectedIngredient.ten}!`,
      );
      setShowNhapKhoModal(false);
      setSelectedIngredient(null);
      setSoLuongThem("");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id, tenNL) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${tenNL}" không?`)
    ) {
      try {
        setError("");
        setMsg("");
        await apiClient.delete(`${URL.KHO}/${id}`);
        setMsg("Xóa nguyên liệu khỏi kho thành công!");
        loadData();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
  };

  const renderStatusBadge = (tonKho) => {
    if (tonKho <= 0) {
      return (
        <Badge
          bg="danger-subtle"
          text="danger"
          className="border border-danger rounded-1 px-2 py-1"
        >
          Hết hàng
        </Badge>
      );
    } else if (tonKho < 10) {
      return (
        <Badge
          bg="warning-subtle"
          text="warning"
          className="border border-warning rounded-1 px-2 py-1"
        >
          Sắp hết
        </Badge>
      );
    } else {
      return (
        <Badge
          bg="success-subtle"
          text="success"
          className="border border-success rounded-1 px-2 py-1"
        >
          An toàn
        </Badge>
      );
    }
  };

  return (
    <div className="admin-page">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Nguyên liệu</h1>
          <div className="text-muted small">
            Giám sát số lượng tồn thực tế, nhập thêm nguyên vật liệu
          </div>
        </div>
        <Button
          variant="dark"
          size="sm"
          className="fw-semibold rounded-1 px-3"
          onClick={handleOpenAddModal}
        >
          + Thêm nguyên liệu
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

      {/* Khung lọc & tìm kiếm */}
      <div className="border border-light-subtle rounded-1 bg-white p-3 mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-2 align-items-center">
            <Col md={4}>
              <Form.Control
                size="sm"
                className="rounded-1"
                placeholder="Tìm theo tên nguyên liệu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={tinhTrangFilter}
                onChange={(e) => setTinhTrangFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái tồn</option>
                <option value="conHang">Còn nhiều (tồn &gt;= 10)</option>
                <option value="sapHet">Sắp hết (tồn &lt; 10)</option>
                <option value="hetHang">Hết hàng (tồn &lt;= 0)</option>
              </Form.Select>
            </Col>

            <Col md={5} className="d-flex gap-2 justify-content-md-end">
              <Button
                variant="dark"
                size="sm"
                className="fw-semibold rounded-1 px-3"
                type="submit"
              >
                Tìm kiếm
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-1"
                onClick={() => {
                  setSearch("");
                  setTinhTrangFilter("");
                  setTimeout(() => loadData(), 50);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Danh sách nguyên liệu */}
      <div className="border border-light-subtle rounded-1 bg-white mb-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-secondary mt-2 mb-0">
              Đang tải danh sách kho...
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            Không tìm thấy nguyên liệu nào trong kho.
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
                  Tên nguyên liệu
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Đơn vị
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Tồn thực tế
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "180px" }}
                >
                  Tình trạng
                </th>
                <th
                  className="py-2 text-muted fw-semibold text-end px-3 small"
                  style={{ width: "220px" }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, idx) => (
                <tr key={item._id} className="border-bottom last-border-0">
                  <td className="px-3 py-2 text-secondary small">{idx + 1}</td>
                  <td className="py-2 fw-semibold text-dark small">
                    {item.ten}
                  </td>
                  <td className="py-2 text-secondary small">{item.donVi}</td>
                  <td className="py-2 fw-bold text-dark small">
                    {item.soLuongTon}
                  </td>
                  <td className="py-2 small">
                    {renderStatusBadge(item.soLuongTon)}
                  </td>
                  <td className="py-2 text-end px-3">
                    <Button
                      variant="link"
                      size="sm"
                      className="me-3 text-success p-0 text-decoration-none small fw-semibold"
                      onClick={() => handleOpenNhapKhoModal(item)}
                    >
                      Nhập kho
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="me-3 text-primary p-0 text-decoration-none small fw-semibold"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0 text-decoration-none small fw-semibold"
                      onClick={() => handleDelete(item._id, item.ten)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal Thêm / Sửa Nguyên Liệu */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Form onSubmit={handleSaveIngredient}>
          <Modal.Header closeButton className="py-2 px-3 border-bottom">
            <Modal.Title className="fs-6 fw-bold text-dark">
              {isEditMode
                ? "Sửa thông tin nguyên liệu"
                : "Thêm nguyên liệu mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Tên nguyên liệu
              </Form.Label>
              <Form.Control
                required
                className="rounded-1 form-control-sm"
                placeholder="Thịt bò, Nấm kim châm, Hành lá..."
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Đơn vị tính
              </Form.Label>
              <Form.Control
                required
                className="rounded-1 form-control-sm"
                placeholder="VD: kg, gam, quả, lon, chai..."
                value={donViTinh}
                onChange={(e) => setDonViTinh(e.target.value)}
              />
            </Form.Group>

            {!isEditMode && (
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold text-secondary small">
                  Số lượng tồn ban đầu
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  className="rounded-1 form-control-sm"
                  value={soLuongTon}
                  onChange={(e) => setSoLuongTon(e.target.value)}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer className="py-2 px-3 border-top">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-1 px-3"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button
              variant="dark"
              size="sm"
              type="submit"
              className="fw-semibold rounded-1 px-3"
            >
              {isEditMode ? "Cập nhật" : "Tạo nguyên liệu"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Nhập Kho Nhanh */}
      <Modal
        show={showNhapKhoModal}
        onHide={() => {
          setShowNhapKhoModal(false);
          setSelectedIngredient(null);
        }}
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        {selectedIngredient && (
          <Form onSubmit={handleSaveNhapKho}>
            <Modal.Header closeButton className="py-2 px-3 border-bottom">
              <Modal.Title className="fs-6 fw-bold text-dark">
                Nhập thêm nguyên liệu
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
              <p className="small mb-3">
                Nguyên liệu:{" "}
                <strong className="text-dark">{selectedIngredient.ten}</strong>
                <br />
                Tồn kho hiện tại:{" "}
                <strong className="text-dark">
                  {selectedIngredient.soLuongTon} {selectedIngredient.donVi}
                </strong>
              </p>

              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold text-secondary small">
                  Số lượng cần nhập thêm ({selectedIngredient.donVi})
                </Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  required
                  className="rounded-1 form-control-sm"
                  min="0.01"
                  placeholder="Nhập số lượng bổ sung..."
                  value={soLuongThem}
                  onChange={(e) => setSoLuongThem(e.target.value)}
                  autoFocus
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="py-2 px-3 border-top">
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-1 px-3"
                onClick={() => {
                  setShowNhapKhoModal(false);
                  setSelectedIngredient(null);
                }}
              >
                Hủy
              </Button>
              <Button
                variant="dark"
                size="sm"
                type="submit"
                className="fw-semibold rounded-1 px-3"
              >
                Xác nhận nhập
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </div>
  );
}
