import { Outlet, Navigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { useAppContext } from "../../hooks/context";

export default function AdminLayout() {
  const { state } = useAppContext();

  // Nếu chưa đăng nhập hoặc vai trò không phải admin thì chuyển hướng về login
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (state.user?.vaiTro !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-shell">
      {/* Header */}
      <AdminHeader />
      
      {/* Body */}
      <div className="admin-body">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="admin-main">
          <div className="admin-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}