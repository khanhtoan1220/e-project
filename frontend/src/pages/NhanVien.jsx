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
import {
  get_nhanvien_service,
  create_nhanvien_service,
  delete_nhanvien_service,
  reset_matkhau_service,
} from "../services/quantri_service";
import { useAppContext } from "../hooks/context";

export default function NhanVien() {
  const { state } = useAppContext();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc
  const [search, setSearch] = useState("");
  const [vaiTroFilter, setVaiTroFilter] = useState("");

  // State Modal Tạo mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoTen, setHoTen] = useState("");
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [vaiTro, setVaiTro] = useState("phucVu");

  // State Modal Reset Mật khẩu
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [matKhauMoi, setMatKhauMoi] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await get_nhanvien_service(search, vaiTroFilter);
      setList(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vaiTroFilter]); // Lọc ngay khi đổi Vai trò, tìm kiếm bấm nút Tìm kiếm

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      await create_nhanvien_service(hoTen, tenDangNhap, matKhau, vaiTro);
      setMsg("Tạo tài khoản nhân viên thành công!");
      setShowAddModal(false);
      // Reset form
      setHoTen("");
      setTenDangNhap("");
      setMatKhau("");
      setVaiTro("phucVu");
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleDelete = async (id, ten) => {
    if (id === state.user?.id) {
      alert("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${ten}" không?`)) {
      try {
        setError("");
        setMsg("");
        await delete_nhanvien_service(id);
        setMsg("Đã xóa tài khoản nhân viên thành công");
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMsg("");
      await reset_matkhau_service(selectedUser._id, matKhauMoi);
      setMsg(
        `Đặt lại mật khẩu thành công cho nhân viên ${selectedUser.hoTen}!`,
      );
      setShowResetModal(false);
      setMatKhauMoi("");
      setSelectedUser(null);
    } catch (err) {
      setError(err.toString());
    }
  };

  const translateRole = (role) => {
    switch (role) {
      case "admin":
        return <Badge bg="danger">Quản trị viên</Badge>;
      case "bep":
        return (
          <Badge bg="warning" text="dark">
            Đầu bếp
          </Badge>
        );
      case "phucVu":
        return (
          <Badge bg="info" text="dark">
            Phục vụ
          </Badge>
        );
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="admin-page">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Nhân viên</h1>
          <div className="text-muted small">
            Cấp tài khoản và quản lý phân quyền cho nhân sự quán
          </div>
        </div>
        <Button
          variant="dark"
          size="sm"
          className="fw-semibold rounded-1 px-3"
          onClick={() => setShowAddModal(true)}
        >
          + Thêm nhân viên
        </Button>
      </div>

      {/* Thông báo thành công / thất bại */}
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
                placeholder="Họ tên, tên đăng nhập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={vaiTroFilter}
                onChange={(e) => setVaiTroFilter(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="phucVu">Phục vụ bàn</option>
                <option value="bep">Đầu bếp</option>
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
                  setVaiTroFilter("");
                  setTimeout(() => loadData(), 50);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Danh sách nhân viên */}
      <div className="border border-light-subtle rounded-1 bg-white mb-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-secondary mt-2 mb-0">
              Đang tải danh sách nhân viên...
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            Không tìm thấy nhân viên nào phù hợp.
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
                <th className="py-2 text-muted fw-semibold small">Họ và tên</th>
                <th className="py-2 text-muted fw-semibold small">
                  Tên đăng nhập
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Vai trò
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "120px" }}
                >
                  Ngày tạo
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
              {list.map((user, idx) => (
                <tr key={user._id} className="border-bottom last-border-0">
                  <td className="px-3 py-2 text-secondary small">{idx + 1}</td>
                  <td className="py-2 fw-semibold text-dark small">
                    {user.hoTen}
                  </td>
                  <td className="py-2 text-secondary small">
                    {user.tenDangNhap}
                  </td>
                  <td className="py-2 small">{translateRole(user.vaiTro)}</td>
                  <td className="py-2 text-secondary small">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-2 text-end px-3">
                    <Button
                      variant="link"
                      size="sm"
                      className="me-3 text-primary p-0 text-decoration-none small fw-semibold"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowResetModal(true);
                      }}
                    >
                      Đặt lại mật khẩu
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0 text-decoration-none small fw-semibold"
                      disabled={user._id === state.user?.id}
                      onClick={() => handleDelete(user._id, user.hoTen)}
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

      {/* Modal Thêm Nhân Viên */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton className="py-2 px-3 border-bottom">
            <Modal.Title className="fs-6 fw-bold text-dark">
              Thêm nhân viên mới
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Họ và tên nhân viên
              </Form.Label>
              <Form.Control
                required
                className="rounded-1 form-control-sm"
                placeholder="Nguyễn Văn A..."
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Tên đăng nhập
              </Form.Label>
              <Form.Control
                required
                className="rounded-1 form-control-sm"
                placeholder="nguyenvana..."
                value={tenDangNhap}
                onChange={(e) =>
                  setTenDangNhap(
                    e.target.value.toLowerCase().replace(/\s/g, ""),
                  )
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Mật khẩu khởi tạo
              </Form.Label>
              <Form.Control
                type="password"
                required
                className="rounded-1 form-control-sm"
                placeholder="Ít nhất 6 ký tự..."
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold text-secondary small">
                Vai trò / Phân quyền
              </Form.Label>
              <Form.Select
                className="rounded-1 form-select-sm"
                value={vaiTro}
                onChange={(e) => setVaiTro(e.target.value)}
              >
                <option value="phucVu">Phục vụ bàn</option>
                <option value="bep">Nhà bếp / Đầu bếp</option>
                <option value="admin">Quản trị hệ thống</option>
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
              Thêm nhân viên
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Đặt lại Mật khẩu */}
      <Modal
        show={showResetModal}
        onHide={() => {
          setShowResetModal(false);
          setSelectedUser(null);
        }}
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        {selectedUser && (
          <Form onSubmit={handleResetPasswordSubmit}>
            <Modal.Header closeButton className="py-2 px-3 border-bottom">
              <Modal.Title className="fs-6 fw-bold text-dark">
                Đặt lại mật khẩu
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
              <p className="small mb-3">
                Đặt lại mật khẩu cho nhân viên:{" "}
                <strong className="text-dark">{selectedUser.hoTen}</strong>
              </p>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold text-secondary small">
                  Mật khẩu mới
                </Form.Label>
                <Form.Control
                  type="password"
                  required
                  className="rounded-1 form-control-sm"
                  placeholder="Nhập ít nhất 6 ký tự..."
                  value={matKhauMoi}
                  onChange={(e) => setMatKhauMoi(e.target.value)}
                  minLength={6}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="py-2 px-3 border-top">
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-1 px-3"
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedUser(null);
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
                Đặt lại
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </div>
  );
}
