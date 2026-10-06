import React, { useEffect } from "react";
import { Outlet, Navigate, useNavigate, NavLink } from "react-router-dom";
import { useAppContext } from "../../hooks/context";
import { logout_service } from "../../services/staff_service";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import Pusher from "pusher-js";

export default function StaffLayout() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("Bạn muốn đăng xuất?")) return;
    try {
      await logout_service();
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    if (!state.isAuthenticated) return;
    const pusher = new Pusher("3beeb39343729e248b1d", { cluster: "ap1" });
    const thongBao = (data) => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
        oscillator.onended = () => audioCtx.close();
      } catch {
        console.log("Trình duyệt chưa cho phép phát âm thanh.");
      }
      alert(data.message);
    };

    let channel;
    if (state.user?.vaiTro === "phucVu") {
      channel = pusher.subscribe("nhan-vien-channel");
      channel.bind("yeu-cau-moi", thongBao);
      channel.bind("dat-ban-moi", thongBao);
      channel.bind("mon-da-xong", thongBao);
    } else if (state.user?.vaiTro === "bep") {
      channel = pusher.subscribe("bep-channel");
      channel.bind("co-don-moi", thongBao);
    }
    return () => {
      if (channel) channel.unbind_all();
      pusher.disconnect();
    };
  }, [state.user, state.isAuthenticated]);

  if (!state.isAuthenticated || !["admin", "phucVu", "bep"].includes(state.user?.vaiTro)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="staff-shell">
      <Navbar expand="lg" className="staff-header">
        <Container fluid className="px-4">
          <Navbar.Brand className="fw-semibold">Bếp Nhà · Nhân viên</Navbar.Brand>
          <Navbar.Toggle aria-controls="staff-navbar-nav" />
          <Navbar.Collapse id="staff-navbar-nav">
            <Nav className="me-auto my-2 my-lg-0 gap-2">
              {["admin", "phucVu"].includes(state.user.vaiTro) &&
                <Nav.Link as={NavLink} to="/phuc-vu">Bàn ăn & gọi món</Nav.Link>}
              {["admin", "bep"].includes(state.user.vaiTro) &&
                <Nav.Link as={NavLink} to="/nha-bep">Nhà bếp</Nav.Link>}
            </Nav>
            <Nav className="align-items-lg-center gap-3">
              <Navbar.Text className="text-secondary small">
                {state.user.hoTen} · {state.user.vaiTro === "admin" ? "Quản trị" : state.user.vaiTro === "phucVu" ? "Phục vụ" : "Nhà bếp"}
              </Navbar.Text>
              <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Đăng xuất</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="staff-main"><Outlet /></main>
    </div>
  );
}
