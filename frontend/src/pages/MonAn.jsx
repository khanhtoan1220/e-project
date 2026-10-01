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
import apiClient from "../utils/api";

export default function MonAn() {
  const [list, setList] = useState([]);
  const [danhMucList, setDanhMucList] = useState([]);
  const [nguyenLieuList, setNguyenLieuList] = useState([]); // Lấy từ kho phục vụ cho Định Lượng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc
  const [search, setSearch] = useState("");
  const [danhMucFilter, setDanhMucFilter] = useState("");
  const [conBanFilter, setConBanFilter] = useState("");

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State Form fields
  const [ten, setTen] = useState("");
  const [gia, setGia] = useState("");
  const [hinhAnh, setHinhAnh] = useState("");
  const [danhMucId, setDanhMucId] = useState("");
  const [conBan, setConBan] = useState(true);
  
  // State Định Lượng [{ nguyenLieuID, soLuong, donVi }]
  const [dinhLuong, setDinhLuong] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const filters = { all: "true" };
      if (search) filters.search = search;
      if (danhMucFilter) filters.danhMuc = danhMucFilter;
      if (conBanFilter !== "") filters.conBan = conBanFilter;

      const [monAnData, danhmucData, khoData] = await Promise.all([
        get_monan_service(filters),
        get_danhmuc_service(),
        apiClient.get("/quan-tri/kho") // Gọi API kho
      ]);

      setList(monAnData);
      setDanhMucList(danhmucData);
      setNguyenLieuList(khoData.data || []);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [danhMucFilter, conBanFilter]);

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
    setDinhLuong([]); // Reset định lượng rỗng khi thêm mới
    setShowModal(true);
  };

  const handleOpenEditModal = async (item) => {
    setIsEditMode(true);
    setEditingId(item._id);
    setTen(item.ten);
    setGia(item.gia);
    setHinhAnh(item.hinhAnh || "");
    setDanhMucId(item.danhMucId?._id || item.danhMucId || "");
    setConBan(item.conBan);
    
    // Gọi API chi tiết món ăn (GET /thuc-don/mon-an/:id) để lấy định lượng chi tiết
    try {
      const res = await apiClient.get(`/thuc-don/mon-an/${item._id}`);
      // Định lượng ở backend có populate, đưa về cấu trúc phẳng để edit
      const dlFlat = (res.data?.dinhLuong || []).map(dl => ({
        nguyenLieuID: dl.nguyenLieuID?._id || dl.nguyenLieuID,
        soLuong: dl.soLuong || 1,
        donVi: dl.donVi || dl.nguyenLieuID?.donViTinh || "kg"
      }));
      setDinhLuong(dlFlat);
    } catch (err) {
      setDinhLuong([]);
    }
    
    setShowModal(true);
  };

  // Thêm dòng định lượng nguyên liệu mới
  const handleAddDinhLuongRow = () => {
    if (nguyenLieuList.length === 0) {
      alert("Kho chưa có nguyên liệu nào. Vui lòng thêm nguyên liệu vào kho trước!");
      return;
    }
    const firstNL = nguyenLieuList[0];
    setDinhLuong([
      ...dinhLuong,
      { nguyenLieuID: firstNL._id, soLuong: 1, donVi: firstNL.donViTinh || "kg" }
    ]);
  };

  // Xóa dòng định lượng
  const handleRemoveDinhLuongRow = (index) => {
    setDinhLuong(dinhLuong.filter((_, idx) => idx !== index));
  };

  // Thay đổi giá trị trong dòng định lượng
  const handleChangeDinhLuongRow = (index, field, value) => {
    const newList = [...dinhLuong];
    newList[index][field] = value;
    
    // Nếu đổi nguyên liệu, tự động đồng bộ đơn vị tính của nguyên liệu đó
    if (field === "nguyenLieuID") {
      const selectedNL = nguyenLieuList.find(nl => nl._id === value);
      if (selectedNL) {
        newList[index].donVi = selectedNL.donViTinh || "kg";
      }
    }
    setDinhLuong(newList);
  };

  const handleSaveMonAn = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    
    // Đóng gói mảng định lượng đúng cấu trúc của backend schema
    const formattedDinhLuong = dinhLuong.map(dl => ({
      nguyenLieuID: dl.nguyenLieuID,
      soLuong: Number(dl.soLuong),
      donVi: dl.donVi
    }));

    const data = {
      ten,
      gia: Number(gia),
      hinhAnh,
      danhMucId,
      conBan,
      dinhLuong: formattedDinhLuong
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
          <p className="text-secondary mb-0">Thiết lập danh mục thực đơn, giá bán và cấu hình định lượng nguyên liệu món ăn</p>
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

      {/* Modal Thêm / Sửa Món Ăn & Định Lượng */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Form onSubmit={handleSaveMonAn}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-dark">
              {isEditMode ? "Cập Nhật Món Ăn & Công Thức" : "Thêm Món Ăn Mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "550px", overflowY: "auto" }}>
            <Row>
              <Col md={6}>
                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">Thông Tin Cơ Bản</h6>
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
              </Col>

              {/* KHU VỰC CẤU HÌNH ĐỊNH LƯỢNG NGUYÊN LIỆU TIÊU HAO */}
              <Col md={6} className="border-start">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold text-primary mb-0">🍳 Định Lượng Tiêu Hao</h6>
                  <Button variant="outline-primary" size="sm" onClick={handleAddDinhLuongRow} className="fw-bold py-0.5">
                    + Thêm Dòng
                  </Button>
                </div>

                {dinhLuong.length === 0 ? (
                  <div className="text-center py-5 text-secondary bg-light rounded border">
                    <i className="bi bi-info-circle fs-4 d-block mb-1"></i>
                    Món ăn này chưa được cấu hình nguyên liệu tiêu hao khi chế biến.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {dinhLuong.map((dl, index) => (
                      <Row key={index} className="g-2 align-items-end border-bottom pb-2">
                        <Col xs={6}>
                          <Form.Label className="small fw-semibold text-secondary">Nguyên liệu</Form.Label>
                          <Form.Select
                            value={dl.nguyenLieuID}
                            onChange={(e) => handleChangeDinhLuongRow(index, "nguyenLieuID", e.target.value)}
                          >
                            {nguyenLieuList.map(nl => (
                              <option key={nl._id} value={nl._id}>{nl.ten}</option>
                            ))}
                          </Form.Select>
                        </Col>
                        
                        <Col xs={3}>
                          <Form.Label className="small fw-semibold text-secondary">Số lượng</Form.Label>
                          <Form.Control
                            type="number"
                            step="any"
                            min="0.01"
                            value={dl.soLuong}
                            onChange={(e) => handleChangeDinhLuongRow(index, "soLuong", e.target.value)}
                          />
                        </Col>

                        <Col xs={2}>
                          <Form.Label className="small fw-semibold text-secondary">Đơn vị</Form.Label>
                          <Form.Control
                            disabled
                            value={dl.donVi}
                          />
                        </Col>

                        <Col xs={1} className="text-end">
                          <Button 
                            variant="link" 
                            className="text-danger p-0 mb-1 border-0"
                            onClick={() => handleRemoveDinhLuongRow(index)}
                          >
                            <i className="bi bi-trash-fill fs-5"></i>
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}
              </Col>
            </Row>
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