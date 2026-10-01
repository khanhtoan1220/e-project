import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Card
} from "react-bootstrap";
import {
  get_danhmuc_service,
  create_danhmuc_service,
  update_danhmuc_service,
  delete_danhmuc_service
} from "../services/quantri_service";

export default function DanhMuc() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State Modal (Thêm / Sửa)
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State Form fields
  const [ten, setTen] = useState("");
  const [moTa, setMoTa] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await get_danhmuc_service();
      setList(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTen("");
    setMoTa("");
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setEditingId(item._id);
    setTen(item.ten);
    setMoTa(item.moTa || "");
    setShowModal(true);
  };

  const handleSaveDanhMuc = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    const data = { ten, moTa };

    try {
      if (isEditMode) {
        await update_danhmuc_service(editingId, data);
        setMsg(`Cập nhật danh mục "${ten}" thành công!`);
      } else {
        await create_danhmuc_service(data);
        setMsg(`Thêm danh mục "${ten}" thành công!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleDelete = async (id, tenDanhMuc) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${tenDanhMuc}"?\nLưu ý: Hành động này có thể ảnh hưởng đến các món ăn thuộc danh mục này.`)) {
      try {
        setError("");
        setMsg("");
        await delete_danhmuc_service(id);
        setMsg("Xóa danh mục thành công!");
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  return (
    <div>
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">📂 Quản Lý Danh Mục Thực Đơn</h2>
          <p className="text-secondary mb-0">Phân loại các món ăn trong thực đơn của nhà hàng</p>
        </div>
        <Button variant="primary" className="fw-bold" onClick={handleOpenAddModal}>
          + Thêm Danh Mục
        </Button>
      </div>

      {/* Thông báo */}
      {msg && <div className="alert alert-success alert-dismissible fade show py-2 px-3 small" role="alert">{msg}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show py-2 px-3 small" role="alert">{error}</div>}

      {/* Danh sách danh mục */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2 mb-0">Đang tải danh sách danh mục...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              Chưa có danh mục nào. Hãy bấm nút "Thêm Danh Mục" để tạo mới.
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: "80px" }}>#</th>
                  <th className="py-3" style={{ width: "250px" }}>Tên Danh Mục</th>
                  <th className="py-3">Mô Tả</th>
                  <th className="py-3" style={{ width: "180px" }}>Ngày Tạo</th>
                  <th className="py-3 text-end px-4" style={{ width: "200px" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, idx) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 text-secondary">{idx + 1}</td>
                    <td className="py-3 fw-bold text-dark">{item.ten}</td>
                    <td className="py-3 text-secondary">{item.moTa || "-"}</td>
                    <td className="py-3 text-secondary">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
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

      {/* Modal Thêm / Sửa Danh Mục */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Form onSubmit={handleSaveDanhMuc}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-dark">
              {isEditMode ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Tên danh mục</Form.Label>
              <Form.Control
                required
                placeholder="VD: Khai vị, Món chính, Đồ uống..."
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Mô tả danh mục</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Mô tả ngắn gọn về danh mục thực đơn này..."
                value={moTa}
                onChange={(e) => setMoTa(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" className="fw-bold">
              {isEditMode ? "Lưu thay đổi" : "+ Thêm Danh Mục"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}