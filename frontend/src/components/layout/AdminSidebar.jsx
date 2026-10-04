import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const menuItems = [
    { path: "/admin", label: "Tổng quan", end: true },
    { path: "/admin/mon-an", label: "Món ăn" },
    { path: "/admin/danh-muc", label: "Danh mục" },
    { path: "/admin/kho", label: "Nguyên liệu" },
    { path: "/admin/ban-an", label: "Bàn ăn" },
    { path: "/admin/dat-ban", label: "Đặt bàn" },
    { path: "/admin/hoa-don", label: "Hóa đơn" },
    { path: "/admin/nhan-vien", label: "Nhân viên" },
  ];

  return (
    <aside className="admin-sidebar">
      <p className="sidebar-heading">Quản lý nhà hàng</p>
      <Nav as="nav" aria-label="Menu quản trị" className="admin-navigation">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => "admin-nav-link" + (isActive ? " active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </Nav>
    </aside>
  );
}
