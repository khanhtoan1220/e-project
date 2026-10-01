import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const menuItems = [
    { path: "/admin", label: "📊 Tổng quan (Dashboard)", icon: "bi-graph-up", end: true },
    { path: "/admin/danh-muc", label: "📂 Danh Mục Thực Đơn", icon: "bi-folder", end: false },
    { path: "/admin/mon-an", label: "🍔 Món Ăn & Đồ Uống", icon: "bi-egg-fried", end: false },
    { path: "/admin/kho", label: "📦 Kho Nguyên Liệu", icon: "bi-box-seam", end: false },
    { path: "/admin/ban-an", label: "🪑 Sơ Đồ Bàn Ăn", icon: "bi-grid-3x3-gap", end: false },
    { path: "/admin/hoa-don", label: "🧾 Quản Lý Hóa Đơn", icon: "bi-receipt", end: false },
    { path: "/admin/dat-ban", label: "📅 Lịch Đặt Bàn", icon: "bi-calendar-event", end: false },
    { path: "/admin/nhan-vien", label: "👥 Quản Lý Nhân Viên", icon: "bi-people", end: false }
  ];

  return (
    <div className="bg-dark text-white p-3 d-flex flex-column shadow" style={{ width: "265px", minHeight: "calc(100vh - 56px)" }}>
      <div className="mb-3 px-2">
        <small className="text-uppercase text-secondary fw-bold letter-spacing-1" style={{ fontSize: "0.7rem" }}>
          Chức năng hệ thống
        </small>
      </div>
      
      <Nav className="flex-column gap-1 flex-grow-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded transition-all ${
                isActive 
                  ? "bg-primary text-white fw-bold shadow-sm"
                  : "text-light-gray hover-bg-secondary text-white-50"
              }`
            }
            style={{ textDecoration: "none" }}
          >
            <i className={`bi ${item.icon} fs-5`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </Nav>

      <div className="mt-auto border-top border-secondary pt-3 text-center">
        <p className="text-secondary mb-0" style={{ fontSize: "0.75rem" }}>
          © 2025 Restaurant Admin
        </p>
        <small className="text-warning" style={{ fontSize: "0.7rem" }}>Version 1.0.0</small>
      </div>
    </div>
  );
}