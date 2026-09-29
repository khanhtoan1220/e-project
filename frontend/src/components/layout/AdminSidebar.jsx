import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const menuItems = [
    { path: "/admin", label: "📊 Bảng Điều Khiển", end: true },
    { path: "/admin/danh-muc", label: "📂 Quản Lý Danh Mục", end: false },
    { path: "/admin/mon-an", label: "🍔 Quản Lý Món Ăn", end: false },
    { path: "/admin/nhan-vien", label: "👥 Quản Lý Nhân Viên", end: false }
  ];

  return (
    <div className="bg-dark text-white p-3 d-flex flex-column shadow" style={{ width: "260px", minHeight: "calc(100vh - 56px)" }}>
      <div className="mb-4 px-2">
        <small className="text-uppercase text-secondary fw-bold letter-spacing-1" style={{ fontSize: "0.7rem" }}>
          Chức năng hệ thống
        </small>
      </div>
      
      <Nav className="flex-column gap-2 flex-grow-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 px-3 py-2-5 rounded transition-all ${
                isActive 
                  ? "bg-primary text-white fw-bold shadow-sm"
                  : "text-light-gray hover-bg-secondary text-white-50"
              }`
            }
            style={{ textDecoration: "none" }}
          >
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