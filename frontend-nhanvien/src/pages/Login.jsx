import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/context";
import { login_service } from "../services/staff_service";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

export default function Login() {
  const { state, dispatch } = useAppContext();
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Nếu đã đăng nhập thì đẩy thẳng vào trang vai trò
  useEffect(() => {
    if (state.isAuthenticated) {
      if (state.user?.vaiTro === "phucVu" || state.user?.vaiTro === "admin") {
        navigate("/phuc-vu");
      } else if (state.user?.vaiTro === "bep") {
        navigate("/nha-bep");
      } else {
        setError(
          "Tài khoản của bạn không có quyền truy cập ứng dụng nhân viên!",
        );
      }
    }
  }, [state.isAuthenticated, state.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login_service(tenDangNhap, matKhau);
      const allowedRoles = ["admin", "phucVu", "bep"];

      if (allowedRoles.includes(res.user.vaiTro)) {
        dispatch({ type: "LOGIN_SUCCESS", payload: res.user });
      } else {
        setError(
          "Tài khoản của bạn không có quyền truy cập ứng dụng nhân viên!",
        );
      }
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login">
      <Container style={{ maxWidth: "450px" }}>
        <Card className="staff-login-card">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark mb-1">Bếp Nhà</h2>
              <p className="text-secondary small">Đăng nhập dành cho phục vụ và nhà bếp</p>
            </div>

            {error && (
              <Alert variant="danger" className="small py-2 px-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">
                  Tên đăng nhập
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  autoComplete="username"
                  placeholder="Nhập tài khoản nhân viên..."
                  value={tenDangNhap}
                  onChange={(e) => setTenDangNhap(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Mật khẩu
                </Form.Label>
                <Form.Control
                  required
                  type="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu..."
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 fw-bold py-2 mb-2 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Đang xác thực...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
