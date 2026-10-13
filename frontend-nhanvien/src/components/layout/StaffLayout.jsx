import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "../../hooks/context";
import { logout_service } from "../../services/staff_service";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import Pusher from "pusher-js";

export default function StaffLayout() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [coYeuCauHoTroMoi, setCoYeuCauHoTroMoi] = useState(false);

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
    const key = import.meta.env.VITE_PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    const pusher = new Pusher(key, { cluster });
    const role = state.user?.vaiTro;
    const tenSuKien = {
      "yeu-cau-moi": "Yêu cầu mới",
      "dat-ban-moi": "Có đặt bàn mới",
      "mon-da-xong": "Món đã hoàn thành",
      "chuyen-ban": "Bàn vừa được chuyển",
      "co-don-moi": "Bếp nhận đơn mới",
    };
    const channels = [];
    const bindEvents = (channelName, eventNames) => {
      const channel = pusher.subscribe(channelName);
      channels.push(channel);
      eventNames.forEach((eventName) => {
        channel.bind(eventName, (data = {}) => {
          if (eventName === "yeu-cau-moi") setCoYeuCauHoTroMoi(true);
          setNotifications((current) => [{
            id: `${Date.now()}-${Math.random()}`,
            title: tenSuKien[eventName] || "Thông báo mới",
            message: data.message || "Có một cập nhật mới.",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          }, ...current]);

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
            // Giữ thông báo trên màn hình ngay cả khi trình duyệt chặn âm thanh.
          }
        });
      });
    };

    if (["admin", "phucVu"].includes(role)) {
      bindEvents("nhan-vien-channel", ["yeu-cau-moi", "dat-ban-moi", "mon-da-xong", "chuyen-ban"]);
    }
    if (["admin", "bep"].includes(role)) {
      bindEvents("bep-channel", ["co-don-moi"]);
    }

    return () => {
      channels.forEach((channel) => {
        channel.unbind_all();
        channel.unsubscribe();
      });
      pusher.disconnect();
    };
  }, [state.user?.vaiTro, state.isAuthenticated]);

  const dongThongBao = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (location.pathname === "/yeu-cau-ho-tro") setCoYeuCauHoTroMoi(false);
  }, [location.pathname]);



  if (!state.isAuthenticated || !["admin", "phucVu", "bep"].includes(state.user?.vaiTro)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="staff-shell">
      <div className="staff-live-notifications" aria-live="polite" aria-label="Thông báo mới">
        {notifications.map((item) => <section className="staff-live-notification" key={item.id}>
          <header>
            <strong>{item.title}</strong>
            <button type="button" aria-label="Đóng thông báo" onClick={() => dongThongBao(item.id)}>×</button>
          </header>
          <p>{item.message}</p>
          <small>{item.time}</small>
        </section>)}
      </div>
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
              {["admin", "phucVu"].includes(state.user.vaiTro) &&
                <Nav.Link as={NavLink} to="/yeu-cau-ho-tro" className="staff-support-link">
                  Yêu cầu hỗ trợ
                  {coYeuCauHoTroMoi && <span className="staff-support-dot" aria-label="Có yêu cầu hỗ trợ mới" />}
                </Nav.Link>}
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

