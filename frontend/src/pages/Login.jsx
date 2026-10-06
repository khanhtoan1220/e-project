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
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center">
      <Container>
        <div className="d-flex justify-content-center">
          <Card className="login-card" style={{ width: "420px" }}>
            <div className="login-heading">
              <h1 className="fw-semibold mb-2">Bếp Nhà</h1>
              <p className="mb-0">Quản lý nhà hàng</p>
            </div>
            <Card.Body className="p-4">
              <h4 className="mb-4 fw-semibold text-dark">Đăng nhập</h4>
              
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
                  className="w-100 py-2 fw-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </Form>
            </Card.Body>
            <div className="card-footer text-center bg-white border-0 py-3 text-secondary small">
              Dành cho tài khoản quản trị.
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}