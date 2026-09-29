import React, { useReducer } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppContext } from "./hooks/context";
import { STATE } from "./hooks/INIT_STATE";
import reducer from "./hooks/reducer";

import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import NhanVien from "./pages/NhanVien";
import MonAn from "./pages/MonAn";
import DanhMuc from "./pages/DanhMuc";

function App() {
  const [state, dispatch] = useReducer(reducer, STATE);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* Nhóm các Route Admin dùng chung Layout quản trị */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Trang chủ Admin: Bảng điều khiển */}
          <Route 
            index 
            element={
              <div className="p-4 bg-white rounded-3 shadow-sm">
                <h2 className="fw-bold text-dark">📊 Bảng Điều Khiển Quản Trị</h2>
                <p className="text-secondary">Chào mừng quay trở lại hệ thống quản lý, <strong>{state.user?.hoTen}</strong>.</p>
                <hr className="my-4" />
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="card bg-info text-dark border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold">📂 Quản Lý Danh Mục</h5>
                        <p className="card-text">Quản lý nhóm thực đơn (Lẩu, Nướng, Tráng miệng, Đồ uống...).</p>
                        <a href="/admin/danh-muc" className="btn btn-light btn-sm fw-bold text-dark">Đi tới Quản Lý Danh Mục</a>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-primary text-white border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold">🍔 Quản Lý Món Ăn</h5>
                        <p className="card-text">Quản lý thực đơn món ăn nhà hàng, thiết lập giá bán chi tiết.</p>
                        <a href="/admin/mon-an" className="btn btn-light btn-sm fw-bold text-primary">Đi tới Quản Lý Món Ăn</a>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-warning text-dark border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-bold">👥 Quản Lý Nhân Viên</h5>
                        <p className="card-text">Cấp tài khoản và quản lý phân quyền (Phục vụ, Đầu bếp...).</p>
                        <a href="/admin/nhan-vien" className="btn btn-dark btn-sm fw-bold text-warning">Đi tới Quản Lý Nhân Viên</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } 
          />
          
          {/* Quản lý danh mục */}
          <Route path="danh-muc" element={<DanhMuc />} />

          {/* Quản lý món ăn */}
          <Route path="mon-an" element={<MonAn />} />
          
          {/* Quản lý nhân viên */}
          <Route path="nhan-vien" element={<NhanVien />} />
        </Route>

        {/* Bất cứ đường dẫn nào khác không hợp lệ đều đẩy về /admin để được chuyển tiếp */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;