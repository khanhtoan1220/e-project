import { useEffect, useState } from "react";
import { Navbar, Container, Button, Dropdown, Badge } from "react-bootstrap";
import { useAppContext } from "../../hooks/context";
import { useNavigate } from "react-router-dom";
import { logout_service } from "../../services/auth_service";
import Pusher from "pusher-js";

export default function AdminHeader() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav");
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.log("Không thể phát nhạc chuông:", error);
    }
  };

  useEffect(() => {
    // Khởi tạo Pusher Client lắng nghe Realtime từ Backend
    const pusher = new Pusher("8bbb5ee6c07004e372dd", {
      cluster: "ap1",
      encrypted: true
    });

    const channel = pusher.subscribe("nhan-vien-channel");
    
    // Sự kiện 1: Khách đặt bàn mới
    channel.bind("dat-ban-moi", (data) => {
      playNotificationSound();
      const newNoti = {
        id: Date.now(),
        title: "Đặt bàn mới",
        message: data.message || "Có yêu cầu đặt bàn mới từ khách hàng.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        link: "/admin/dat-ban"
      };
      setNotifications(prev => [newNoti, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Sự kiện 2: Khách hàng gọi phục vụ / hỗ trợ bàn ăn
    channel.bind("yeu-cau-moi", (data) => {
      playNotificationSound();
      const newNoti = {
        id: Date.now(),
        title: "Yêu cầu hỗ trợ",
        message: data.message || "Bàn ăn yêu cầu nhân viên hỗ trợ!",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        link: "/admin/ban-an"
      };
      setNotifications(prev => [newNoti, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout_service();
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const handleMarkAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <Navbar expand="lg" className="admin-header">
      <Container fluid>
        <Navbar.Brand href="/admin" className="fw-semibold">
          
          <span>Bếp Nhà · Quản trị</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        
        <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
          <div className="d-flex align-items-center gap-3">
            
            {/* Realtime Notification Dropdown Bell */}
            <Dropdown onClick={handleMarkAsRead} align="end">
              <Dropdown.Toggle variant="link" className="text-dark position-relative border-0" id="dropdown-notification" style={{ boxShadow: "none" }}>
                Thông báo
                {unreadCount > 0 && (
                  <Badge 
                    bg="danger" 
                    pill 
                    className="ms-2"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu className="border py-0" style={{ width: "320px", maxHeight: "400px", overflowY: "auto" }}>
                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                  <strong className="text-dark">Thông báo hệ thống</strong>
                  {unreadCount > 0 && <small className="text-primary">{unreadCount} mới</small>}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-secondary small">
                    
                    Chưa có thông báo mới nào
                  </div>
                ) : (
                  notifications.map(noti => (
                    <Dropdown.Item 
                      key={noti.id} 
                      onClick={() => navigate(noti.link)}
                      className="p-3 border-bottom whitespace-normal"
                      style={{ whiteSpace: "normal" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-primary small">{noti.title}</strong>
                        <small className="text-secondary" style={{ fontSize: "0.75rem" }}>{noti.time}</small>
                      </div>
                      <p className="mb-0 text-dark small-text" style={{ fontSize: "0.8rem", lineHeight: "1.3" }}>
                        {noti.message}
                      </p>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>

            <div className="text-dark text-end border-start ps-3">
              <small className="d-block text-secondary" style={{ fontSize: "0.75rem" }}>Tài khoản đang dùng</small>
              <strong>{state.user?.hoTen || "Quản Trị Viên"}</strong>
              <span className="badge bg-light text-secondary ms-2" style={{ fontSize: "0.7rem" }}>
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