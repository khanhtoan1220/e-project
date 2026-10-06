import ENV from "../constants/ENV";
import QrGoiMon from "../components/QrGoiMon";
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  get_sodoban_service,
  mo_ban_service,
  get_hoadon_ban_service,
  get_danhmuc_menu_service,
  get_monan_menu_service,
  goi_mon_service,
  thanh_toan_service,
  don_ban_service,
  chuyen_ban_service,
  bung_mon_service,
  duyet_mon_service,
} from "../services/staff_service";

export default function PhucVu() {
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State phục vụ gọi món (Order Modal)
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeBan, setActiveBan] = useState(null);
  const [activeHoaDon, setActiveHoaDon] = useState(null);
  const [danhMucList, setDanhMucList] = useState([]);
  const [monAnList, setMonAnList] = useState([]);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState("");
  const [timMon, setTimMon] = useState("");
  const [dangGuiMon, setDangGuiMon] = useState(false);
  const [khuVucLoc, setKhuVucLoc] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const tenTrangThaiMon = {
    choXacNhan: "Chờ xác nhận", choCheBien: "Chờ chế biến", dangLam: "Đang làm",
    daXong: "Chờ mang ra bàn", daPhucVu: "Đã phục vụ", daHuy: "Đã hủy",
  };
  const [cart, setCart] = useState([]);
  const [ghiChuMon, setGhiChuMon] = useState({});
  const monHienThi = monAnList.filter(mon =>
    (!selectedDanhMuc || (mon.danhMucId?._id || mon.danhMucId) === selectedDanhMuc) &&
    mon.ten.toLocaleLowerCase("vi-VN").includes(timMon.trim().toLocaleLowerCase("vi-VN"))
  );
  const tongMonMoi = cart.reduce((sum, item) => sum + item.gia * item.soLuong, 0);
  const banHienThi = banList.filter(ban =>
    (!khuVucLoc || ban.khuVuc === khuVucLoc) &&
    (!trangThaiLoc || ban.trangThai === trangThaiLoc)
  );
  const layUrlAnh = (url) => {
    try { return new URL(url, ENV.api_url).href; } catch { return ""; }
  };
  const handleDongGoiMon = () => {
    if (dangGuiMon) return;
    if (cart.length && !window.confirm("Món đang chọn chưa gửi. Bạn muốn đóng và bỏ các món này?")) return;
    setShowOrderModal(false);
  };
  const handleTaiHoaDon = async () => {
    try {
      setError("");
      setActiveHoaDon(await get_hoadon_ban_service(activeBan._id));
    } catch (err) { setError(err.toString()); }
  };

  // State phục vụ chuyển bàn
  const [showChuyenBanModal, setShowChuyenBanModal] = useState(false);
  const [targetBanId, setTargetBanId] = useState("");

  const loadSodoBan = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await get_sodoban_service();
      setBanList(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSodoBan();
  }, []);

  // Mở bàn
  const handleMoBan = async (banId, tenBan) => {
    if (window.confirm(`Xác nhận MỞ BÀN đón khách tại [${tenBan}]?`)) {
      try {
        setError("");
        setMsg("");
        await mo_ban_service(banId);
        setMsg(`Mở bàn [${tenBan}] thành công!`);
        loadSodoBan();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  // Hoàn tất dọn bàn
  const handleHoanTatDonBan = async (banId, tenBan) => {
    try {
      setError("");
      setMsg("");
      await don_ban_service(banId);
      setMsg(`Bàn [${tenBan}] đã sạch sẽ, chuyển sang trạng thái sẵn sàng!`);
      loadSodoBan();
    } catch (err) {
      setError(err.toString());
    }
  };

  // Click vào bàn để xử lý gọi món / xem hóa đơn
  const handleOpenOrderModal = async (ban) => {
    try {
      setError("");
      setActiveBan(ban);
      setMsg("");
      setTimMon("");
      setSelectedDanhMuc("");
      setCart([]);
      setGhiChuMon({});

      // 1. Tải hóa đơn hiện tại của bàn
      const hoaDon = await get_hoadon_ban_service(ban._id);
      setActiveHoaDon(hoaDon);

      // 2. Tải danh mục thực đơn
      const dmData = await get_danhmuc_menu_service();
      setDanhMucList(dmData);

      // Tải tất cả món ăn trước
      const maData = await get_monan_menu_service();
      setMonAnList(maData);

      setShowOrderModal(true);
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleDanhMucSelect = (dmId) => {
    setSelectedDanhMuc(dmId);
  };

  // Quản lý giỏ hàng tạm thời
  const addToCart = (mon) => {
    if (dangGuiMon) return;
    const exist = cart.find((item) => item.menuId === mon._id);
    if (exist?.soLuong >= 100) return;
    if (exist) {
      setCart(
        cart.map((item) =>
          item.menuId === mon._id
            ? { ...item, soLuong: item.soLuong + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        { menuId: mon._id, ten: mon.ten, gia: mon.gia, soLuong: 1 },
      ]);
    }
  };

  const changeQty = (menuId, delta) => {
    if (dangGuiMon) return;
    if (cart.find(item => item.menuId === menuId)?.soLuong === 1 && delta < 0) {
      setGhiChuMon({ ...ghiChuMon, [menuId]: "" });
    }
    setCart(
      cart
        .map((item) => {
          if (item.menuId === menuId) {
            const newQty = Math.min(100, item.soLuong + delta);
            return newQty > 0 ? { ...item, soLuong: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const handleGhiChuChange = (menuId, value) => {
    setGhiChuMon({ ...ghiChuMon, [menuId]: value });
  };

  // Gửi gọi món vào bếp
  const handleGoiMon = async () => {
    if (dangGuiMon) return;
    if (cart.length === 0) {
      alert("Vui lòng chọn ít nhất 1 món ăn!");
      return;
    }
    setDangGuiMon(true);
    try {
      setError("");
      setMsg("");

      const inputCart = cart.map((item) => ({
        menuId: item.menuId,
        soLuong: item.soLuong,
        ghiChu: ghiChuMon[item.menuId] || "",
      }));

      await goi_mon_service(activeHoaDon._id, inputCart);
      setMsg(
        `Đã gửi thành công đơn gọi món mới của [${activeBan.ten}] vào bếp!`,
      );
      setShowOrderModal(false);
      loadSodoBan();
    } catch (err) {
      setError(err.toString());
    } finally {
      setDangGuiMon(false);
    }
  };

  // Thanh toán bàn
  const handleThanhToan = async () => {
    if (
      !window.confirm(
        `Xác nhận thanh toán cho [${activeBan.ten}]?\nSố tiền cần thu: ${Number(activeHoaDon.tongTien).toLocaleString("vi-VN")}đ`,
      )
    ) {
      return;
    }
    try {
      setError("");
      setMsg("");
      await thanh_toan_service(activeHoaDon._id);
      setMsg(
        `Thanh toán thành công cho [${activeBan.ten}]! Vui lòng dọn dẹp bàn.`,
      );
      setShowOrderModal(false);
      loadSodoBan();
    } catch (err) {
      setError(err.toString());
    }
  };

  // Chuyển bàn
  const handleOpenChuyenBan = () => {
    setTargetBanId("");
    setShowChuyenBanModal(true);
  };

  const handleChuyenBan = async () => {
    if (!targetBanId) {
      alert("Vui lòng chọn bàn cần chuyển đến!");
      return;
    }
    try {
      setError("");
      setMsg("");
      await chuyen_ban_service(activeBan._id, targetBanId);
      setMsg(`Chuyển bàn thành công!`);
      setShowChuyenBanModal(false);
      setShowOrderModal(false);
      loadSodoBan();
    } catch (err) {
      setError(err.toString());
    }
  };

  // Xác nhận bưng món
  const handleBungMon = async (monItemObjectId) => {
    try {
      setError("");
      await bung_mon_service(activeHoaDon._id, monItemObjectId);
      // Đồng bộ hóa đơn mới nhất sau khi bưng
      const updatedHoaDon = await get_hoadon_ban_service(activeBan._id);
      setActiveHoaDon(updatedHoaDon);
    } catch (err) {
      setError(err.toString());
    }
  };

  // Phục vụ duyệt các món khách tự gọi qua QR để báo Bếp nấu
  const handleDuyetMon = async () => {
    try {
      setError("");
      await duyet_mon_service(activeHoaDon._id);
      setMsg(
        "Đã duyệt các món ăn khách tự đặt và gửi xuống bếp chế biến!",
      );
      // Đồng bộ lại hóa đơn
      const updatedHoaDon = await get_hoadon_ban_service(activeBan._id);
      setActiveHoaDon(updatedHoaDon);
    } catch (err) {
      setError(err.toString());
    }
  };

  const renderBanCardStyle = (trangThai) => {
    switch (trangThai) {
      case "trong":
        return {
          bg: "#f0fdf4",
          border: "#bbf7d0",
          text: "#166534",
          status: "Trống",
        };
      case "dangSuDung":
        return {
          bg: "#fef2f2",
          border: "#fca5a5",
          text: "#991b1b",
          status: "Có khách",
        };
      case "choDonDep":
        return {
          bg: "#fef9c3",
          border: "#fde047",
          text: "#854d0e",
          status: "Chờ dọn",
        };
      case "datTruoc":
        return {
          bg: "#f0f9ff",
          border: "#bae6fd",
          text: "#075985",
          status: "Đặt trước",
        };
      default:
        return {
          bg: "#f8fafc",
          border: "#cbd5e1",
          text: "#475569",
          status: trangThai,
        };
    }
  };

  return (
    <div className="staff-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Bàn ăn</h1>
          <div className="text-muted small">
            Quản lý trạng thái bàn ăn, hỗ trợ khách gọi món và thanh toán
          </div>
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          className="fw-semibold rounded-1 px-3"
          onClick={loadSodoBan}
        >
          Tải lại sơ đồ
        </Button>
      </div>

      {/* Thông báo */}
      {msg && (
        <Alert variant="success" className="py-2 px-3 small">
          {msg}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="py-2 px-3 small">
          {error}
        </Alert>
      )}

      <div className="table-filters">
        <Form.Select aria-label="Lọc khu vực" value={khuVucLoc} onChange={e => setKhuVucLoc(e.target.value)}>
          <option value="">Tất cả khu vực</option>
          <option value="tang1">Tầng 1</option><option value="tang2">Tầng 2</option><option value="tang3">Tầng 3</option>
        </Form.Select>
        <Form.Select aria-label="Lọc trạng thái bàn" value={trangThaiLoc} onChange={e => setTrangThaiLoc(e.target.value)}>
          <option value="">Tất cả trạng thái</option><option value="trong">Trống</option>
          <option value="dangSuDung">Có khách</option><option value="datTruoc">Đặt trước</option>
          <option value="choDonDep">Chờ dọn</option>
        </Form.Select>
        <span className="text-secondary small">{banHienThi.length} bàn</span>
      </div>
      {!loading && banHienThi.length === 0 && <div className="empty-state">Không có bàn phù hợp.</div>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" />
          <p className="text-secondary mt-2 mb-0">Đang tải dữ liệu bàn...</p>
        </div>
      ) : (
        <Row className="g-2">
          {banHienThi.map((ban) => {
            const style = renderBanCardStyle(ban.trangThai);
            return (
              <Col key={ban._id} xs={12} sm={6} md={4} lg={3} xl={2}>
                <div
                  className="table-card"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #dfe5e2",
                    minHeight: "170px",
                  }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h4 className="fw-bold text-dark h5 mb-0">{ban.ten}</h4>
                      <span
                        className="small text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {ban.khuVuc === "tang1"
                          ? "T1"
                          : ban.khuVuc === "tang2"
                            ? "T2"
                            : "T3"}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span
                        className="badge px-2 py-1 rounded-1 small fw-semibold"
                        style={{
                          backgroundColor: style.border,
                          color: style.text,
                          fontSize: "0.85rem",
                        }}
                      >
                        {style.status}
                      </span>
                    </div>
                  </div>

                  {/* Nút hành động dẹt */}
                  <div className="d-flex flex-column gap-2 mt-2">
                    {["trong", "datTruoc"].includes(ban.trangThai) && (
                      <Button
                        variant="dark"
                        size="sm"
                        className="fw-semibold py-1 rounded-1 text-white border-0"
                        style={{ backgroundColor: style.text }}
                        onClick={() => handleMoBan(ban._id, ban.ten)}
                      >
                        Mở bàn
                      </Button>
                    )}

                    {ban.trangThai === "dangSuDung" && (
                      <Button
                        variant="dark"
                        size="sm"
                        className="fw-semibold py-1 rounded-1 border-0"
                        onClick={() => handleOpenOrderModal(ban)}
                      >
                        Gọi món
                      </Button>
                    )}

                    {ban.trangThai === "dangSuDung" && ban.hoaDon && (
                      <QrGoiMon key={ban.hoaDon._id} hoaDon={ban.hoaDon} tenBan={ban.ten} />
                    )}

                    {ban.trangThai === "choDonDep" && (
                      <Button
                        variant="warning"
                        size="sm"
                        className="fw-semibold py-1 rounded-1 text-dark border-0"
                        onClick={() => handleHoanTatDonBan(ban._id, ban.ten)}
                      >
                        Dọn xong bàn
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Gọi món cho bàn đang phục vụ */}
      <Modal show={showOrderModal} onHide={handleDongGoiMon}
        size="xl" fullscreen="lg-down" backdrop="static" className="order-modal">
        {activeBan && activeHoaDon && <>
          <Modal.Header closeButton={!dangGuiMon}>
            <div>
              <Modal.Title>Gọi món · {activeBan.ten}</Modal.Title>
              <div className="text-secondary small mt-1">
                {activeBan.khuVuc === "tang1" ? "Tầng 1" : activeBan.khuVuc === "tang2" ? "Tầng 2" : "Tầng 3"}
                {" · "}Chọn món và kiểm tra trước khi gửi
              </div>
            </div>
          </Modal.Header>
          {error && <Alert variant="danger" className="m-3 mb-0">{error}</Alert>}
          {msg && <Alert variant="success" className="m-3 mb-0">{msg}</Alert>}
          <Modal.Body className="order-body">
            <section className="menu-panel" aria-label="Thực đơn">
              <div className="menu-tools">
                <Form.Control type="search" placeholder="Tìm tên món ăn..."
                  aria-label="Tìm món ăn" value={timMon}
                  onChange={(e) => setTimMon(e.target.value)} />
                <div className="category-list" aria-label="Danh mục món">
                  <Button variant={!selectedDanhMuc ? "dark" : "outline-secondary"}
                    aria-pressed={!selectedDanhMuc} onClick={() => handleDanhMucSelect("")}>Tất cả</Button>
                  {danhMucList.map(dm => <Button key={dm._id}
                    variant={selectedDanhMuc === dm._id ? "dark" : "outline-secondary"}
                    aria-pressed={selectedDanhMuc === dm._id}
                    onClick={() => handleDanhMucSelect(dm._id)}>{dm.ten}</Button>)}
                </div>
                <div className="small text-secondary">{monHienThi.length} món trong thực đơn</div>
                <Button variant="outline-dark" className="mobile-cart-link"
                  onClick={() => document.getElementById("staff-bill-panel")?.scrollIntoView({ behavior: "smooth" })}>
                  Xem món đang chọn ({cart.reduce((sum, item) => sum + item.soLuong, 0)})
                </Button>
              </div>
              <div className="menu-grid">
                {monHienThi.map(mon => {
                  const daChon = cart.find(item => item.menuId === mon._id)?.soLuong || 0;
                  return <article key={mon._id} className={"menu-card" + (daChon ? " selected" : "")}>
                    <div className="dish-image">
                      <span>Chưa có ảnh</span>
                      {mon.hinhAnh && <img src={layUrlAnh(mon.hinhAnh)} alt={mon.ten} loading="lazy"
                        onError={e => { e.currentTarget.style.display = "none"; }} />}
                      {daChon > 0 && <span className="dish-count">Đã chọn {daChon}</span>}
                    </div>
                    <div className="dish-content">
                      <div className="dish-category">
                        {mon.danhMucId?.ten || danhMucList.find(dm => dm._id === mon.danhMucId)?.ten || "Món ăn"}
                      </div>
                      <h3>{mon.ten}</h3>
                      <div className="dish-bottom">
                        <strong>{Number(mon.gia).toLocaleString("vi-VN")} đ</strong>
                        <Button variant="outline-dark" size="sm"
                          disabled={dangGuiMon || daChon >= 100}
                          aria-label={"Thêm " + mon.ten} onClick={() => addToCart(mon)}>Thêm món</Button>
                      </div>
                    </div>
                  </article>;
                })}
              </div>
              {monHienThi.length === 0 && <div className="empty-state">
                <h3>Không tìm thấy món</h3><p>Thử tên khác hoặc chọn lại danh mục.</p>
              </div>}
            </section>
            <section id="staff-bill-panel" className="bill-panel" aria-label="Món của bàn">
              <Tabs defaultActiveKey="orderMoi" className="bill-tabs">
                <Tab eventKey="orderMoi" title={"Đang chọn (" + cart.reduce((sum, item) => sum + item.soLuong, 0) + ")"}>
                  <div className="bill-items">
                    {cart.length === 0 ? <div className="empty-state">
                      <h3>Chưa chọn món</h3><p>Bấm “Thêm món” trong thực đơn để gọi cho khách.</p>
                    </div> : cart.map(item => <div className="cart-item" key={item.menuId}>
                      <div className="d-flex justify-content-between gap-3">
                        <strong>{item.ten}</strong>
                        <Button variant="link" className="text-danger p-0" disabled={dangGuiMon}
                          aria-label={"Bỏ " + item.ten} onClick={() => {
                            setCart(cart.filter(mon => mon.menuId !== item.menuId));
                            setGhiChuMon({ ...ghiChuMon, [item.menuId]: "" });
                          }}>Bỏ</Button>
                      </div>
                      <div className="cart-item-price">
                        <span>{Number(item.gia).toLocaleString("vi-VN")} đ / phần</span>
                        <div className="quantity-control">
                          <Button variant="outline-secondary" disabled={dangGuiMon}
                            aria-label={"Giảm số lượng " + item.ten} onClick={() => changeQty(item.menuId, -1)}>−</Button>
                          <span aria-label="Số lượng">{item.soLuong}</span>
                          <Button variant="outline-secondary" disabled={dangGuiMon || item.soLuong >= 100}
                            aria-label={"Tăng số lượng " + item.ten} onClick={() => changeQty(item.menuId, 1)}>+</Button>
                        </div>
                      </div>
                      <Form.Control aria-label={"Ghi chú cho " + item.ten}
                        placeholder="Ghi chú: ít cay, không hành..."
                        maxLength={500} disabled={dangGuiMon}
                        value={ghiChuMon[item.menuId] || ""}
                        onChange={e => handleGhiChuChange(item.menuId, e.target.value)} />
                      <div className="text-end small mt-2">{Number(item.gia * item.soLuong).toLocaleString("vi-VN")} đ</div>
                    </div>)}
                  </div>
                  <div className="bill-summary">
                    <div className="d-flex justify-content-between mb-3">
                      <span>Tạm tính món mới</span><strong>{tongMonMoi.toLocaleString("vi-VN")} đ</strong>
                    </div>
                    <Button variant="dark" className="w-100" disabled={!cart.length || dangGuiMon} onClick={handleGoiMon}>
                      {dangGuiMon ? "Đang gửi món..." : "Gửi món"}
                    </Button>
                    <p className="small text-secondary mt-2 mb-0">Món mới sẽ được cộng vào hóa đơn hiện tại.</p>
                  </div>
                </Tab>
                <Tab eventKey="daGoi" title="Món đã gọi">
                  <div className="bill-items">
                    <Button variant="outline-secondary" size="sm" className="mb-3"
                      onClick={handleTaiHoaDon}>Cập nhật trạng thái</Button>
                    {activeHoaDon.danhSachMon?.some(item => item.trangThaiMon === "choXacNhan") &&
                      <Alert variant="warning">
                        <p>Có món khách gọi đang chờ xác nhận.</p>
                        <Button variant="dark" size="sm" onClick={handleDuyetMon}>Duyệt món</Button>
                      </Alert>}
                    {!activeHoaDon.danhSachMon?.length && <div className="empty-state"><p>Bàn chưa gọi món nào.</p></div>}
                    {activeHoaDon.danhSachMon?.map(item => <div key={item._id} className="cart-item">
                      <div className="d-flex justify-content-between gap-2">
                        <strong>{item.ten}</strong><span>× {item.soLuong}</span>
                      </div>
                      <div className="d-flex justify-content-between gap-2 flex-wrap mt-2">
                        <span>{Number(item.gia * item.soLuong).toLocaleString("vi-VN")} đ</span>
                        <Badge bg={item.trangThaiMon === "daHuy" ? "danger-subtle" : "light"} text={item.trangThaiMon === "daHuy" ? "danger" : "dark"}>
                          {tenTrangThaiMon[item.trangThaiMon] || item.trangThaiMon}
                        </Badge>
                      </div>
                      {item.ghiChu && <p className="dish-note mt-2 mb-0">Ghi chú: {item.ghiChu}</p>}
                      {item.trangThaiMon === "daXong" && <Button variant="outline-dark" className="mt-2" size="sm"
                        onClick={() => handleBungMon(item._id)}>Xác nhận đã phục vụ</Button>}
                    </div>)}
                  </div>
                  <div className="bill-summary">
                    <div className="d-flex justify-content-between mb-3">
                      <span>Tổng hóa đơn</span><strong>{Number(activeHoaDon.tongTien).toLocaleString("vi-VN")} đ</strong>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-secondary" disabled={dangGuiMon || cart.length > 0} onClick={handleOpenChuyenBan}>Chuyển bàn</Button>
                      <Button variant="dark" className="flex-grow-1" disabled={dangGuiMon || cart.length > 0} onClick={handleThanhToan}>Thanh toán</Button>
                    </div>
                    {cart.length > 0 && <p className="small text-secondary mt-2 mb-0">Gửi hoặc bỏ món đang chọn trước khi chuyển bàn, thanh toán.</p>}
                  </div>
                </Tab>
              </Tabs>
            </section>
          </Modal.Body>
        </>}
      </Modal>

      {/* --- POPUP CHUYỂN BÀN --- */}
      <Modal
        show={showChuyenBanModal}
        onHide={() => setShowChuyenBanModal(false)}
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Modal.Header closeButton className="py-2 px-3 border-bottom">
          <Modal.Title className="fs-6 fw-bold text-dark">
            Đổi chỗ & chuyển bàn
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          {activeBan && (
            <Form.Group className="mb-2">
              <Form.Label className="small text-muted mb-2">
                Chuyển hóa đơn từ{" "}
                <strong className="text-dark">{activeBan.ten}</strong> sang bàn
                trống:
              </Form.Label>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={targetBanId}
                onChange={(e) => setTargetBanId(e.target.value)}
              >
                <option value="">-- Chọn bàn trống --</option>
                {banList
                  .filter((ban) => ban.trangThai === "trong")
                  .map((ban) => (
                    <option key={ban._id} value={ban._id}>
                      {ban.ten} ({ban.khuVuc === "tang1" ? "Tầng 1" : "Tầng 2"})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="py-2 px-3 border-top">
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-1 px-3"
            onClick={() => setShowChuyenBanModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="dark"
            size="sm"
            className="fw-semibold rounded-1 px-3"
            onClick={handleChuyenBan}
          >
            Xác nhận chuyển
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
