import { useState, useEffect } from "react";
import { Card, Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login_service } from "../services/auth_service";
import { useAppContext } from "../hooks/context";

export default function Login() {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  // Nếu đã đăng nhập rồi thì tự động nhảy vào admin luôn
  useEffect(() => {
    if (state.isAuthenticated && state.user?.vaiTro === "admin") {
      navigate("/admin");
    }
  }, [state.isAuthenticated, state.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login_service(tenDangNhap, matKhau);
      
      if (user.vaiTro !== "admin") {
        setError("Tài khoản của bạn không có quyền truy cập trang quản trị!");
        setIsSubmitting(false);
        return;
      }

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      navigate("/admin");
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light-gray min-vh-100 d-flex align-items-center justify-content-center">
      <Container>
        <div className="d-flex justify-content-center">
          <Card className="shadow border-0 rounded-4 overflow-hidden" style={{ width: "420px" }}>
            <div className="bg-primary text-white text-center py-4 px-3">
              <h3 className="fw-bold mb-1">🍽️ RESTAURANT</h3>
              <p className="text-white-50 mb-0">Hệ Thống Quản Trị Nhà Hàng</p>
            </div>
            <Card.Body className="p-4">
              <h4 className="text-center mb-4 fw-bold text-dark">ĐĂNG NHẬP</h4>
              
              {error && <Alert variant="danger" className="py-2 px-3 small">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTenDangNhap">
                  <Form.Label className="fw-semibold text-secondary">Tên đăng nhập</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Nhập tên đăng nhập..."
                    value={tenDangNhap}
                    onChange={(e) => setTenDangNhap(e.target.value)}
                    disabled={isSubmitting}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formMatKhau">
                  <Form.Label className="fw-semibold text-secondary">Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    placeholder="Nhập mật khẩu..."
                    value={matKhau}
                    onChange={(e) => setMatKhau(e.target.value)}
                    disabled={isSubmitting}
                    className="py-2"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2.5 fw-bold shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng Nhập"
                  )}
                </Button>
              </Form>
            </Card.Body>
            <div className="card-footer text-center bg-white border-0 py-3 text-secondary small">
              Nhân viên phục vụ/nhà bếp đăng nhập trên ứng dụng Tablet.
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}