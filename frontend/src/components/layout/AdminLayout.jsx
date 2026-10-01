import React from "react";
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
    <div className="d-flex flex-column vh-100 overflow-hidden">
      {/* Header */}
      <AdminHeader />
      
      {/* Body */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="flex-grow-1 bg-light overflow-auto p-4">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}