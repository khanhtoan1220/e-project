import React, { useCallback, useReducer, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppContext } from "./hooks/context";
import { STATE } from "./hooks/INIT_STATE";
import reducer from "./hooks/reducer";

import StaffLayout from "./components/layout/StaffLayout";
import Login from "./pages/Login";
import PhucVu from "./pages/PhucVu";
import NhaBep from "./pages/NhaBep";
import YeuCauHoTro from "./pages/YeuCauHoTro";
import Pusher from "pusher-js";

// Import CSS Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function App() {
  const [state, dispatch] = useReducer(reducer, STATE);
  const [soDoBanVersion, setSoDoBanVersion] = useState(0);
  const refreshSoDoBan = useCallback(() => setSoDoBanVersion((version) => version + 1), []);

  React.useEffect(() => {
    if (!state.isAuthenticated || !["admin", "phucVu"].includes(state.user?.vaiTro)) return;
    const key = import.meta.env.VITE_PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe("nhan-vien-channel");
    const capNhatBan = (data = {}) => {
      if (data.banId || data.hoaDonId) refreshSoDoBan();
    };
    channel.bind("yeu-cau-moi", capNhatBan);
    channel.bind("dat-ban-moi", capNhatBan);
    channel.bind("chuyen-ban", capNhatBan);
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [state.isAuthenticated, state.user?.vaiTro, refreshSoDoBan]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Routes>
        {/* Trang đăng nhập nhân viên */}
        <Route path="/login" element={<Login />} />

        {/* Khung layout bọc phân quyền cho Phục Vụ & Bếp */}
        <Route path="/" element={<StaffLayout />}>
          {/* Điều hướng mặc định dựa theo vai trò khi vào trang chủ */}
          <Route
            index
            element={
              state.user?.vaiTro === "phucVu" ||
              state.user?.vaiTro === "admin" ? (
                <Navigate to="/phuc-vu" replace />
              ) : (
                <Navigate to="/nha-bep" replace />
              )
            }
          />

          {/* Trang Phục vụ */}
          <Route path="phuc-vu" element={<PhucVu soDoBanVersion={soDoBanVersion} refreshSoDoBan={refreshSoDoBan} />} />

          {/* Trang Nhà bếp */}
          <Route path="nha-bep" element={<NhaBep />} />
          <Route path="yeu-cau-ho-tro" element={<YeuCauHoTro />} />
        </Route>

        {/* Chuyển hướng các đường dẫn lạ về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
