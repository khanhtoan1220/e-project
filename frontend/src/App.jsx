import { useReducer } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppContext } from "./hooks/context";
import { STATE } from "./hooks/INIT_STATE";
import reducer from "./hooks/reducer";

import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DanhMuc from "./pages/DanhMuc";
import MonAn from "./pages/MonAn";
import KhoNguyenLieu from "./pages/KhoNguyenLieu";
import BanAn from "./pages/BanAn";
import HoaDon from "./pages/HoaDon";
import DatBan from "./pages/DatBan";
import NhanVien from "./pages/NhanVien";

function App() {
  const [state, dispatch] = useReducer(reducer, STATE);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* Nhóm các Route Admin dùng chung Layout quản trị */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Trang chủ Admin: Tổng quan (Dashboard) */}
          <Route index element={<Dashboard />} />
          
          {/* Quản lý danh mục thực đơn */}
          <Route path="danh-muc" element={<DanhMuc />} />

          {/* Quản lý thực đơn món ăn */}
          <Route path="mon-an" element={<MonAn />} />
          
          {/* Quản lý kho nguyên liệu */}
          <Route path="kho" element={<KhoNguyenLieu />} />
          
          {/* Quản lý sơ đồ bàn ăn */}
          <Route path="ban-an" element={<BanAn />} />
          
          {/* Quản lý hóa đơn */}
          <Route path="hoa-don" element={<HoaDon />} />
          
          {/* Quản lý lịch đặt bàn trước */}
          <Route path="dat-ban" element={<DatBan />} />
          
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