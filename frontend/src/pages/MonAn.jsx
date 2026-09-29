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
import {
  get_monan_service,
  create_monan_service,
  update_monan_service,
  delete_monan_service,
  update_status_monan_service,
  get_danhmuc_service
} from "../services/quantri_service";

export default function MonAn() {
  const [list, setList] = useState([]);
  const [danhMucList, setDanhMucList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc
  const [search, setSearch] = useState("");
  const [danhMucFilter, setDanhMucFilter] = useState("");
  const [conBanFilter, setConBanFilter] = useState("");

  // State Modal (Thêm & Sửa dùng chung form nhưng khác chế độ)
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State Form fields
  const [ten, setTen] = useState("");
  const [gia, setGia] = useState("");
  const [hinhAnh, setHinhAnh] = useState("");
  const [danhMucId, setDanhMucId] = useState("");
  const [conBan, setConBan] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Xây dựng bộ lọc cho params
      const filters = { all: "true" };
      if (search) filters.search = search;
      if (danhMucFilter) filters.danhMuc = danhMucFilter;
      if (conBanFilter !== "") filters.conBan = conBanFilter;

      const [monAnData, danhmucData] = await Promise.all([
        get_monan_service(filters),
        get_danhmuc_service()
      ]);

      setList(monAnData);
      setDanhMucList(danhmucData);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [danhMucFilter, conBanFilter]); // Lọc lập tức khi đổi danh mục hoặc trạng thái còn bán

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTen("");
    setGia("");
    setHinhAnh("");
    setDanhMucId(danhMucList[0]?._id || "");
    setConBan(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setEditingId(item._id);
    setTen(item.ten);
    setGia(item.gia);
    setHinhAnh(item.hinhAnh || "");
    setDanhMucId(item.danhMucId?._id || item.danhMucId || "");
    setConBan(item.conBan);
    setShowModal(true);
  };

  const handleSaveMonAn = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    
    const data = {
      ten,
      gia: Number(gia),
      hinhAnh,
      danhMucId,
      conBan
    };

    try {
      if (isEditMode) {
        await update_monan_service(editingId, data);
        setMsg(`Cập nhật món ăn "${ten}" thành công!`);
      } else {
        await create_monan_service(data);
        setMsg(`Thêm món ăn "${ten}" thành công!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleDelete = async (id, tenMon) => {
    if (window.confirm(`Bạn có muốn xóa món ăn "${tenMon}" không?`)) {
      try {
        setError("");
        setMsg("");
        await delete_monan_service(id);
        setMsg("Xóa món ăn thành công!");
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, tenMon) => {
    try {
      setError("");
      const newStatus = !currentStatus;
      await update_status_monan_service(id, newStatus);
      setMsg(`Đã cập nhật trạng thái "${tenMon}" thành ${newStatus ? "ĐANG BÁN" : "TẠM NGƯNG BÁN"}`);
      
      // Cập nhật state trực tiếp để tránh xoay spinner toàn trang
      setList(prev => prev.map(item => item._id === id ? { ...item, conBan: newStatus } : item));
    } catch (err) {
      setError(err.toString());
    }
  };

  return (
    <div>
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">🍔 Quản Lý Thực Đơn Món Ăn</h2>
          <p className="text-secondary mb-0">Thiết lập danh mục thực đơn và giá bán món ăn nhà hàng</p>
        </div>
        <Button variant="primary" className="fw-bold" onClick={handleOpenAddModal}>
          + Thêm Món Ăn
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
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    placeholder="Tìm theo tên món ăn..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="secondary" type="submit">
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </Col>
              
              <Col md={3}>
                <Form.Select
                  value={danhMucFilter}
                  onChange={(e) => setDanhMucFilter(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {danhMucList.map(dm => (
                    <option key={dm._id} value={dm._id}>{dm.ten}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={conBanFilter}
                  onChange={(e) => setConBanFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái bán</option>
                  <option value="true">Đang bán</option>
                  <option value="false">Tạm dừng bán</option>
                </Form.Select>
              </Col>

              <Col md={2} className="text-md-end">
                <Button 
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearch("");
                    setDanhMucFilter("");
                    setConBanFilter("");
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

      {/* Danh sách món ăn */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2 mb-0">Đang tải danh sách món ăn...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              Không tìm thấy món ăn nào.
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: "80px" }}>#</th>
                  <th className="py-3" style={{ width: "100px" }}>Hình</th>
                  <th className="py-3">Tên Món Ăn</th>
                  <th className="py-3">Giá Bán</th>
                  <th className="py-3">Danh Mục</th>
                  <th className="py-3" style={{ width: "150px" }}>Trạng Thái</th>
                  <th className="py-3 text-end px-4" style={{ width: "220px" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, idx) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 text-secondary">{idx + 1}</td>
                    <td className="py-3">
                      <img 
                        src={item.hinhAnh || "https://placehold.co/100x100?text=No+Image"} 
                        alt={item.ten} 
                        className="rounded"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
                      />
                    </td>
                    <td className="py-3 fw-bold text-dark">{item.ten}</td>
                    <td className="py-3 text-primary fw-bold">
                      {Number(item.gia).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="py-3">
                      <Badge bg="secondary">
                        {item.danhMucId?.ten || "Mặc định"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button 
                        variant={item.conBan ? "success" : "danger"} 
                        size="sm"
                        onClick={() => handleToggleStatus(item._id, item.conBan, item.ten)}
                        title="Bấm để chuyển đổi trạng thái bán"
                      >
                        {item.conBan ? "🟢 Đang bán" : "🔴 Tạm ngừng"}
                      </Button>
                    </td>
                    <td className="py-3 text-end px-4">
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

      {/* Modal Thêm / Sửa Món Ăn */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Form onSubmit={handleSaveMonAn}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-dark">
              {isEditMode ? "Cập Nhật Món Ăn" : "Thêm Món Ăn Mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Tên món ăn</Form.Label>
              <Form.Control
                required
                placeholder="VD: Lẩu hải sản, Cơm rang..."
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Giá bán (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                required
                min={0}
                placeholder="VD: 150000"
                value={gia}
                onChange={(e) => setGia(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Đường dẫn hình ảnh (URL)</Form.Label>
              <Form.Control
                placeholder="VD: https://link-anh.com/com-rang.png"
                value={hinhAnh}
                onChange={(e) => setHinhAnh(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Danh mục thực đơn</Form.Label>
              <Form.Select
                required
                value={danhMucId}
                onChange={(e) => setDanhMucId(e.target.value)}
              >
                {danhMucList.map(dm => (
                  <option key={dm._id} value={dm._id}>{dm.ten}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="conBanCheckbox"
                label="Cho phép hiển thị bán món ăn này"
                checked={conBan}
                onChange={(e) => setConBan(e.target.checked)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" className="fw-bold">
              {isEditMode ? "Cập nhật" : "+ Thêm món"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}