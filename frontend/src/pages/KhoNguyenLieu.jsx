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
  Card
} from "react-bootstrap";
import apiClient from "../utils/api";
import URL from "../constants/URL";

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
      setError(err.toString());
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
    setDonViTinh(item.donViTinh);
    setSoLuongTon(item.soLuongTon);
    setShowModal(true);
  };

  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    
    const data = {
      ten,
      donViTinh,
      soLuongTon: Number(soLuongTon)
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
      setError(err.toString());
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
        soLuongThem: Number(soLuongThem)
      });

      setMsg(`Đã nhập thêm +${soLuongThem} ${selectedIngredient.donViTinh} cho nguyên liệu ${selectedIngredient.ten}!`);
      setShowNhapKhoModal(false);
      setSelectedIngredient(null);
      setSoLuongThem("");
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleDelete = async (id, tenNL) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${tenNL}" không?`)) {
      try {
        setError("");
        setMsg("");
        await apiClient.delete(`${URL.KHO}/${id}`);
        setMsg("Xóa nguyên liệu khỏi kho thành công!");
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  const renderStatusBadge = (tonKho) => {
    if (tonKho <= 0) {
      return <Badge bg="danger">🔴 Hết hàng (0)</Badge>;
    } else if (tonKho < 10) {
      return <Badge bg="warning" text="dark">🟡 Sắp hết ({tonKho})</Badge>;
    } else {
      return <Badge bg="success">🟢 An toàn ({tonKho})</Badge>;
    }
  };

  return (
    <div>
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">📦 Quản Lý Kho Nguyên Liệu</h2>
          <p className="text-secondary mb-0">Theo dõi tồn kho thực tế, nhập kho và kiểm soát nguyên liệu</p>
        </div>
        <Button variant="primary" className="fw-bold" onClick={handleOpenAddModal}>
          + Thêm Nguyên Liệu
        </Button>
      </div>

      {/* Thông báo */}
      {msg && <div className="alert alert-success alert-dismissible fade show py-2 px-3 small" role="alert">{msg}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show py-2 px-3 small" role="alert">{error}</div>}

      {/* Khung lọc & tìm kiếm */}
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3 align-items-center">
              <Col md={5}>
                <InputGroup>
                  <Form.Control
                    placeholder="Tìm theo tên nguyên liệu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="secondary" type="submit">
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </Col>
              
              <Col md={4}>
                <Form.Select
                  value={tinhTrangFilter}
                  onChange={(e) => setTinhTrangFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái tồn</option>
                  <option value="conHang">Còn nhiều (tồn &gt;= 10)</option>
                  <option value="sapHet">Sắp hết (tồn &lt; 10)</option>
                  <option value="hetHang">Hết hàng (tồn &lt;= 0)</option>
                </Form.Select>
              </Col>

              <Col md={3} className="text-md-end">
                <Button 
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearch("");
                    setTinhTrangFilter("");
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

      {/* Danh sách nguyên liệu */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2 mb-0">Đang tải danh sách kho...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              Không tìm thấy nguyên liệu nào trong kho.
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: "80px" }}>#</th>
                  <th className="py-3">Tên Nguyên Liệu</th>
                  <th className="py-3">Đơn Vị Tính</th>
                  <th className="py-3">Số Lượng Tồn</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="py-3 text-end px-4" style={{ width: "280px" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, idx) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 text-secondary">{idx + 1}</td>
                    <td className="py-3 fw-bold text-dark">{item.ten}</td>
                    <td className="py-3">{item.donViTinh}</td>
                    <td className="py-3 fw-bold text-primary">{item.soLuongTon}</td>
                    <td className="py-3">{renderStatusBadge(item.soLuongTon)}</td>
                    <td className="py-3 text-end px-4">
                      <Button 
                        variant="success" 
                        size="sm"
                        className="me-2 fw-semibold"
                        onClick={() => handleOpenNhapKhoModal(item)}
                      >
                        ➕ Nhập kho
                      </Button>
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        className="me-2 fw-semibold"
                        onClick={() => handleOpenEditModal(item)}
                      >
                        ✏️ Sửa
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="fw-semibold"
                        onClick={() => handleDelete(item._id, item.ten)}
                      >
                        🗑️ Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal Thêm / Sửa Nguyên Liệu */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Form onSubmit={handleSaveIngredient}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-dark">
              {isEditMode ? "Sửa Thông Tin Nguyên Liệu" : "Thêm Nguyên Liệu Mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Tên nguyên liệu</Form.Label>
              <Form.Control
                required
                placeholder="VD: Thịt bò, Nấm kim châm, Hành lá..."
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Đơn vị tính</Form.Label>
              <Form.Control
                required
                placeholder="VD: kg, gam, quả, lon, chai..."
                value={donViTinh}
                onChange={(e) => setDonViTinh(e.target.value)}
              />
            </Form.Group>

            {!isEditMode && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Số lượng tồn ban đầu</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={soLuongTon}
                  onChange={(e) => setSoLuongTon(e.target.value)}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" className="fw-bold">
              {isEditMode ? "Cập nhật" : "+ Tạo nguyên liệu"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Nhập Kho Nhanh */}
      <Modal show={showNhapKhoModal} onHide={() => { setShowNhapKhoModal(false); setSelectedIngredient(null); }} backdrop="static">
        {selectedIngredient && (
          <Form onSubmit={handleSaveNhapKho}>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-dark">➕ Nhập Kho Nguyên Liệu</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-3">
                Nguyên liệu: <strong className="text-primary">{selectedIngredient.ten}</strong>
              </p>
              <p className="mb-3 text-secondary">
                Tồn kho hiện tại: <strong>{selectedIngredient.soLuongTon} {selectedIngredient.donViTinh}</strong>
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">Số lượng cần nhập thêm ({selectedIngredient.donViTinh})</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  required
                  min="0.01"
                  placeholder="Nhập số lượng bổ sung..."
                  value={soLuongThem}
                  onChange={(e) => setSoLuongThem(e.target.value)}
                  autoFocus
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => { setShowNhapKhoModal(false); setSelectedIngredient(null); }}>Hủy</Button>
              <Button variant="success" type="submit" className="fw-bold">Xác Nhận Nhập</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </div>
  );
}