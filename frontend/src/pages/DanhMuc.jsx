import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner, Card } from "react-bootstrap";
import {
  get_danhmuc_service,
  create_danhmuc_service,
  update_danhmuc_service,
  delete_danhmuc_service,
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
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa danh mục "${tenDanhMuc}"?\nLưu ý: Hành động này có thể ảnh hưởng đến các món ăn thuộc danh mục này.`,
      )
    ) {
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
    <div className="admin-page">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="page-heading">
        <div>
          <h1 className="h5 fw-bold text-dark mb-1">Danh mục</h1>
          <div className="text-muted small">
            Quản lý phân loại các nhóm món ăn trong nhà hàng
          </div>
        </div>
        <Button
          variant="dark"
          size="sm"
          className="fw-semibold rounded-1 px-3"
          onClick={handleOpenAddModal}
        >
          + Thêm danh mục
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

      {/* Danh sách danh mục */}
      <div className="border border-light-subtle rounded-1 bg-white mb-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-secondary mt-2 mb-0">
              Đang tải danh sách danh mục...
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            Chưa có danh mục nào. Hãy bấm nút "Thêm Danh Mục" để tạo mới.
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
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "220px" }}
                >
                  Tên danh mục
                </th>
                <th className="py-2 text-muted fw-semibold small">Mô tả</th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Ngày tạo
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
              {list.map((item, idx) => (
                <tr key={item._id} className="border-bottom last-border-0">
                  <td className="px-3 py-2 text-secondary small">{idx + 1}</td>
                  <td className="py-2 fw-semibold text-dark small">
                    {item.ten}
                  </td>
                  <td className="py-2 text-secondary small">
                    {item.moTa || "-"}
                  </td>
                  <td className="py-2 text-secondary small">
                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-2 text-end px-3">
                    <Button
                      variant="link"
                      size="sm"
                      className="me-2 text-primary p-0 text-decoration-none small fw-semibold"
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

      {/* Modal Thêm / Sửa Danh Mục */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Form onSubmit={handleSaveDanhMuc}>
          <Modal.Header closeButton className="py-2 px-3 border-bottom">
            <Modal.Title className="fs-6 fw-bold text-dark">
              {isEditMode ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Tên danh mục
              </Form.Label>
              <Form.Control
                required
                className="rounded-1 form-control-sm"
                placeholder="Khai vị, Món chính, Đồ uống..."
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold text-secondary small">
                Mô tả danh mục
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="rounded-1 form-control-sm"
                placeholder="Mô tả ngắn gọn về nhóm món ăn này..."
                value={moTa}
                onChange={(e) => setMoTa(e.target.value)}
              />
            </Form.Group>
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
              {isEditMode ? "Lưu thay đổi" : "Thêm danh mục"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
