import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useAppContext } from "../../hooks/context";
import { useNavigate } from "react-router-dom";
import { logout_service } from "../../services/auth_service";

export default function AdminHeader() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout_service();
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3 border-bottom border-secondary shadow-sm">
      <Container fluid>
        <Navbar.Brand href="/admin" className="fw-bold text-warning d-flex align-items-center gap-2">
          <span>🍽️</span>
          <span>RESTAURANT ADMIN</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        
        <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
          <div className="d-flex align-items-center gap-3">
            <div className="text-light text-end">
              <small className="d-block text-secondary" style={{ fontSize: "0.75rem" }}>Tài khoản đang dùng</small>
              <strong>{state.user?.hoTen || "Quản Trị Viên"}</strong>
              <span className="badge bg-danger ms-2" style={{ fontSize: "0.7rem" }}>
                {state.user?.vaiTro === "admin" ? "ADMIN" : state.user?.vaiTro}
              </span>
            </div>
            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="fw-bold">
              Đăng xuất
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}