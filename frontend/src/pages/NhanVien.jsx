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
  get_nhanvien_service,
  create_nhanvien_service,
  delete_nhanvien_service,
  reset_matkhau_service
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
      setMsg(`Đặt lại mật khẩu thành công cho nhân viên ${selectedUser.hoTen}!`);
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
        return <Badge bg="warning" text="dark">Đầu bếp</Badge>;
      case "phucVu":
        return <Badge bg="info" text="dark">Phục vụ</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  return (
    <div>
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">👥 Quản Lý Nhân Viên</h2>
          <p className="text-secondary mb-0">Tạo tài khoản và phân quyền cho nhân viên nhà hàng</p>
        </div>
        <Button variant="primary" className="fw-bold" onClick={() => setShowAddModal(true)}>
          + Thêm Nhân Viên
        </Button>
      </div>

      {/* Thông báo thành công / thất bại */}
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
                    placeholder="Tìm theo họ tên, tên đăng nhập..."
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
                  value={vaiTroFilter}
                  onChange={(e) => setVaiTroFilter(e.target.value)}
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="phucVu">Phục vụ</option>
                  <option value="bep">Đầu bếp</option>
                </Form.Select>
              </Col>

              <Col md={4} className="text-md-end">
                <Button 
                  variant="outline-secondary"
                  onClick={() => {
                    setSearch("");
                    setVaiTroFilter("");
                    // Cần reset dữ liệu về nguyên bản
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

      {/* Danh sách nhân viên */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2 mb-0">Đang tải danh sách nhân viên...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              Không tìm thấy nhân viên nào phù hợp.
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: "80px" }}>#</th>
                  <th className="py-3">Họ và Tên</th>
                  <th className="py-3">Tên Đăng Nhập</th>
                  <th className="py-3">Vai Trò</th>
                  <th className="py-3" style={{ width: "150px" }}>Ngày Tạo</th>
                  <th className="py-3 text-end px-4" style={{ width: "300px" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((user, idx) => (
                  <tr key={user._id}>
                    <td className="px-4 py-3 text-secondary">{idx + 1}</td>
                    <td className="py-3 fw-bold text-dark">{user.hoTen}</td>
                    <td className="py-3 text-monospace">{user.tenDangNhap}</td>
                    <td className="py-3">{translateRole(user.vaiTro)}</td>
                    <td className="py-3 text-secondary">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 text-end px-4">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2 fw-semibold"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetModal(true);
                        }}
                      >
                        🔑 Reset mật khẩu
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="fw-semibold"
                        disabled={user._id === state.user?.id}
                        onClick={() => handleDelete(user._id, user.hoTen)}
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

      {/* Modal Thêm Nhân Viên */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static">
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-dark">Thêm Tài Khoản Nhân Viên Mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Họ và tên nhân viên</Form.Label>
              <Form.Control
                required
                placeholder="VD: Nguyễn Văn A..."
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Tên đăng nhập (viết liền, không dấu)</Form.Label>
              <Form.Control
                required
                placeholder="VD: nguyenvana..."
                value={tenDangNhap}
                onChange={(e) => setTenDangNhap(e.target.value.toLowerCase().replace(/\s/g, ""))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Mật khẩu khởi tạo</Form.Label>
              <Form.Control
                type="password"
                required
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)..."
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Vai Trò / Phân Quyền</Form.Label>
              <Form.Select
                value={vaiTro}
                onChange={(e) => setVaiTro(e.target.value)}
              >
                <option value="phucVu">Phục vụ bàn (phucVu)</option>
                <option value="bep">Nhà bếp / Đầu bếp (bep)</option>
                <option value="admin">Quản trị hệ thống (admin)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" className="fw-bold">+ Lưu Nhân Viên</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Đặt lại Mật khẩu */}
      <Modal show={showResetModal} onHide={() => { setShowResetModal(false); setSelectedUser(null); }} backdrop="static">
        {selectedUser && (
          <Form onSubmit={handleResetPasswordSubmit}>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-dark">Đặt Lại Mật Khẩu</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Đặt lại mật khẩu cho nhân viên: <strong>{selectedUser.hoTen}</strong> ({selectedUser.tenDangNhap})
              </p>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  required
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
                  value={matKhauMoi}
                  onChange={(e) => setMatKhauMoi(e.target.value)}
                  minLength={6}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => { setShowResetModal(false); setSelectedUser(null); }}>Hủy</Button>
              <Button variant="danger" type="submit" className="fw-bold">Xác nhận Đổi</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </div>
  );
}