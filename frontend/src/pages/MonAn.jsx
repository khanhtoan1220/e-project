import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Row,
  Col,
  InputGroup,
  Card,
} from "react-bootstrap";
import {
  get_monan_service,
  create_monan_service,
  update_monan_service,
  delete_monan_service,
  update_status_monan_service,
  get_danhmuc_service,
} from "../services/quantri_service";
import apiClient from "../utils/api";

export default function MonAn() {
  const [list, setList] = useState([]);
  const [danhMucList, setDanhMucList] = useState([]);
  const [nguyenLieuList, setNguyenLieuList] = useState([]); // Lấy từ kho phục vụ cho Định Lượng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // State bộ lọc
  const [search, setSearch] = useState("");
  const [danhMucFilter, setDanhMucFilter] = useState("");
  const [conBanFilter, setConBanFilter] = useState("");

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State Form fields
  const [ten, setTen] = useState("");
  const [gia, setGia] = useState("");
  const [hinhAnh, setHinhAnh] = useState("");
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [loiAnh, setLoiAnh] = useState("");
  const [danhMucId, setDanhMucId] = useState("");
  const [conBan, setConBan] = useState(true);
  const [canNao, setCanNao] = useState(true);

  // State Định Lượng [{ nguyenLieuID, soLuong, donVi }]
  const [dinhLuong, setDinhLuong] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = { all: "true" };
      if (search) filters.search = search;
      if (danhMucFilter) filters.danhMuc = danhMucFilter;
      if (conBanFilter !== "") filters.conBan = conBanFilter;

      // Gọi tuần tự từng API theo đúng chuẩn giảng dạy của thầy Hòa
      const monAnData = await get_monan_service(filters);
      setList(monAnData);

      const danhmucData = await get_danhmuc_service();
      setDanhMucList(danhmucData);

      const khoData = await apiClient.get("/quan-tri/kho");
      setNguyenLieuList(khoData.data || []);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [danhMucFilter, conBanFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTen("");
    setGia("");
    setHinhAnh("");
    setLoiAnh("");
    setDanhMucId(danhMucList[0]?._id || "");
    setConBan(true);
    setCanNao(true);
    setDinhLuong([]); // Reset định lượng rỗng khi thêm mới
    setShowModal(true);
  };

  const handleOpenEditModal = async (item) => {
    setIsEditMode(true);
    setEditingId(item._id);
    setTen(item.ten);
    setGia(item.gia);
    setHinhAnh(item.hinhAnh || "");
    setLoiAnh("");
    setDanhMucId(item.danhMucId?._id || item.danhMucId || "");
    setConBan(item.conBan);
    setCanNao(item.canNao !== false);

    // Gọi API chi tiết món ăn (GET /thuc-don/mon-an/:id) để lấy định lượng chi tiết
    try {
      const res = await apiClient.get(`/thuc-don/mon-an/${item._id}`);
      // Định lượng ở backend có populate, đưa về cấu trúc phẳng để edit
      const dlFlat = (res.data?.dinhLuong || []).map((dl) => ({
        nguyenLieuID: dl.nguyenLieuID?._id || dl.nguyenLieuID,
        soLuong: dl.soLuong || 1,
        donVi: dl.donVi || dl.nguyenLieuID?.donViTinh || "kg",
      }));
      setDinhLuong(dlFlat);
    } catch (err) {
      setDinhLuong([]);
    }

    setShowModal(true);
  };

  // Thêm dòng định lượng nguyên liệu mới
  const handleAddDinhLuongRow = () => {
    if (nguyenLieuList.length === 0) {
      alert(
        "Kho chưa có nguyên liệu nào. Vui lòng thêm nguyên liệu vào kho trước!",
      );
      return;
    }
    const firstNL = nguyenLieuList[0];
    setDinhLuong([
      ...dinhLuong,
      {
        nguyenLieuID: firstNL._id,
        soLuong: 1,
        donVi: firstNL.donViTinh || "kg",
      },
    ]);
  };

  // Xóa dòng định lượng
  const handleRemoveDinhLuongRow = (index) => {
    setDinhLuong(dinhLuong.filter((_, idx) => idx !== index));
  };

  // Thay đổi giá trị trong dòng định lượng
  const handleChangeDinhLuongRow = (index, field, value) => {
    const newList = [...dinhLuong];
    newList[index][field] = value;

    // Nếu đổi nguyên liệu, tự động đồng bộ đơn vị tính của nguyên liệu đó
    if (field === "nguyenLieuID") {
      const selectedNL = nguyenLieuList.find((nl) => nl._id === value);
      if (selectedNL) {
        newList[index].donVi = selectedNL.donViTinh || "kg";
      }
    }
    setDinhLuong(newList);
  };

  const handleChonAnh = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoiAnh("");
    if (!["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(file.type)) {
      setLoiAnh("Vui lòng chọn ảnh JPG, PNG hoặc GIF.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLoiAnh("Ảnh không được vượt quá 10 MB.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setDangTaiAnh(true);
    try {
      const res = await apiClient.post("/file/upload", formData, {
        headers: { "Content-Type": undefined },
      });
      if (!res.data.url) throw new Error("Máy chủ chưa trả về đường dẫn ảnh.");
      const urlAnh = new URL(res.data.url, apiClient.defaults.baseURL).href;
      setHinhAnh(urlAnh);
    } catch (err) {
      setLoiAnh(err.response?.data?.message || err.message || "Không tải được ảnh.");
      e.target.value = "";
    } finally {
      setDangTaiAnh(false);
    }
  };

  const handleSaveMonAn = async (e) => {
    e.preventDefault();
    if (dangTaiAnh || loiAnh) return;
    setError("");
    setMsg("");

    // Đóng gói mảng định lượng đúng cấu trúc của backend schema
    const formattedDinhLuong = dinhLuong.map((dl) => ({
      nguyenLieuID: dl.nguyenLieuID,
      soLuong: Number(dl.soLuong),
      donVi: dl.donVi,
    }));

    const data = {
      ten,
      gia: Number(gia),
      hinhAnh,
      danhMucId,
      conBan,
      canNao,
      dinhLuong: formattedDinhLuong,
    };

    try {
      if (isEditMode) {
        await update_monan_service(editingId, data);
        setMsg(`Cập nhật món ăn "${ten}" thành công!`);
      } else {
        await create_monan_service(data);
        setMsg(`Thêm món ăn "${ten}" thành công!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  const handleDelete = async (id, tenMon) => {
    if (window.confirm(`Bạn có muốn xóa món ăn "${tenMon}" không?`)) {
      try {
        setError("");
        setMsg("");
        await delete_monan_service(id);
        setMsg("Xóa món ăn thành công!");
        loadData();
      } catch (err) {
        setError(err.toString());
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, tenMon) => {
    try {
      setError("");
      const newStatus = !currentStatus;
      await update_status_monan_service(id, newStatus);
      setMsg(
        `Đã cập nhật trạng thái "${tenMon}" thành ${newStatus ? "ĐANG BÁN" : "TẠM NGƯNG BÁN"}`,
      );
      setList((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, conBan: newStatus } : item,
        ),
      );
    } catch (err) {
      setError(err.toString());
    }
  };

  return (
    <div className="admin-page">
      {/* Tiêu đề & Nút Thêm mới */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Món ăn</h1>
          <div className="text-muted small">
            Thiết lập danh mục món ăn, giá và cấu hình nguyên liệu tiêu hao
          </div>
        </div>
        <Button
          variant="dark"
          size="sm"
          className="fw-semibold rounded-1 px-3"
          onClick={handleOpenAddModal}
        >
          + Thêm món ăn
        </Button>
      </div>

      {/* Thông báo */}
      {msg && (
        <div
          className="alert alert-success alert-dismissible fade show py-2 px-3 small"
          role="alert"
        >
          {msg}
        </div>
      )}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show py-2 px-3 small"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Khung lọc & tìm kiếm */}
      <div className="border border-light-subtle rounded-1 bg-white p-3 mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-2 align-items-center">
            <Col md={3}>
              <Form.Control
                size="sm"
                className="rounded-1"
                placeholder="Tên món ăn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={danhMucFilter}
                onChange={(e) => setDanhMucFilter(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {danhMucList.map((dm) => (
                  <option key={dm._id} value={dm._id}>
                    {dm.ten}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                size="sm"
                className="rounded-1"
                value={conBanFilter}
                onChange={(e) => setConBanFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái bán</option>
                <option value="true">Đang bán</option>
                <option value="false">Tạm dừng bán</option>
              </Form.Select>
            </Col>

            <Col md={3} className="d-flex gap-2 justify-content-md-end">
              <Button
                variant="dark"
                size="sm"
                className="fw-semibold rounded-1 px-3"
                type="submit"
              >
                Tìm kiếm
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-1"
                onClick={() => {
                  setSearch("");
                  setDanhMucFilter("");
                  setConBanFilter("");
                  setTimeout(() => loadData(), 50);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Danh sách món ăn */}
      <div className="border border-light-subtle rounded-1 bg-white mb-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-secondary mt-2 mb-0">
              Đang tải danh sách món ăn...
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            Không tìm thấy món ăn nào.
          </div>
        ) : (
          <Table hover responsive className="align-middle mb-0 table-sm">
            <thead className="table-light border-bottom">
              <tr>
                <th
                  className="px-3 py-2 text-muted fw-semibold small"
                  style={{ width: "60px" }}
                >
                  #
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "80px" }}
                >
                  Hình ảnh
                </th>
                <th className="py-2 text-muted fw-semibold small">
                  Tên món ăn
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Giá bán
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Danh mục
                </th>
                <th
                  className="py-2 text-muted fw-semibold small"
                  style={{ width: "150px" }}
                >
                  Trạng thái
                </th>
                <th
                  className="py-2 text-muted fw-semibold text-end px-3 small"
                  style={{ width: "180px" }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, idx) => (
                <tr key={item._id} className="border-bottom last-border-0">
                  <td className="px-3 py-2 text-secondary small">{idx + 1}</td>
                  <td className="py-2">
                    <img
                      src={
                        item.hinhAnh ||
                        "https://placehold.co/100x100?text=No+Image"
                      }
                      alt={item.ten}
                      className="rounded-1"
                      style={{
                        width: "56px",
                        height: "56px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/100x100?text=No+Image";
                      }}
                    />
                  </td>
                  <td className="py-2 fw-semibold text-dark small">
                    {item.ten}
                  </td>
                  <td className="py-2 fw-semibold text-dark small">
                    {Number(item.gia).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-2 small">
                    <Badge
                      bg="light"
                      text="dark"
                      className="border border-light-subtle rounded-1 font-weight-normal me-1"
                    >
                      {item.danhMucId?.ten || "Mặc định"}
                    </Badge>
                    {item.canNao === false && (
                      <Badge
                        bg="light"
                        text="secondary"
                        className="border border-light-subtle rounded-1 font-weight-normal"
                      >
                        Ăn liền
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 small">
                    <Button
                      variant="link"
                      size="sm"
                      className={`p-0 text-decoration-none fw-semibold small ${item.conBan ? "text-success" : "text-danger"}`}
                      onClick={() =>
                        handleToggleStatus(item._id, item.conBan, item.ten)
                      }
                      title="Bấm để chuyển đổi trạng thái bán"
                    >
                      {item.conBan ? "Đang bán" : "Tạm ngưng"}
                    </Button>
                  </td>
                  <td className="py-2 text-end px-3">
                    <Button
                      variant="link"
                      size="sm"
                      className="me-3 text-primary p-0 text-decoration-none small fw-semibold"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0 text-decoration-none small fw-semibold"
                      onClick={() => handleDelete(item._id, item.ten)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal Thêm / Sửa Món Ăn & Định Lượng */}
      <Modal
        show={showModal}
        onHide={() => { if (!dangTaiAnh) setShowModal(false); }}
        size="lg"
        backdrop="static"
        contentClassName="rounded-1 border-0"
      >
        <Form onSubmit={handleSaveMonAn}>
          <Modal.Header closeButton className="py-2 px-3 border-bottom">
            <Modal.Title className="fs-6 fw-bold text-dark">
              {isEditMode ? "Cập nhật món ăn & công thức" : "Thêm món ăn mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            className="p-3"
            style={{ maxHeight: "550px", overflowY: "auto" }}
          >
            <Row>
              <Col md={6}>
                <h6 className="fw-bold text-dark small mb-3 border-bottom pb-2">
                  Thông tin món ăn
                </h6>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">
                    Tên món ăn
                  </Form.Label>
                  <Form.Control
                    required
                    className="rounded-1 form-control-sm"
                    placeholder="VD: Lẩu hải sản, Cơm rang..."
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">
                    Giá bán (VNĐ)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={0}
                    className="rounded-1 form-control-sm"
                    placeholder="VD: 150000"
                    value={gia}
                    onChange={(e) => setGia(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">
                    Hình ảnh món ăn
                  </Form.Label>
                  <Form.Control
                    className="rounded-1 form-control-sm"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    disabled={dangTaiAnh}
                    onChange={handleChonAnh}
                  />
                  <Form.Text className="text-muted">Chọn ảnh JPG, PNG hoặc GIF, tối đa 10 MB.</Form.Text>
                  {dangTaiAnh && <div className="small mt-2">Đang tải ảnh...</div>}
                  {loiAnh && <div className="text-danger small mt-2" role="alert">{loiAnh}</div>}
                  {hinhAnh && (
                    <img
                      src={new URL(hinhAnh, apiClient.defaults.baseURL).href}
                      alt="Ảnh món ăn đã chọn"
                      className="d-block rounded mt-2"
                      style={{ width: 120, height: 90, objectFit: "cover" }}
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">
                    Danh mục thực đơn
                  </Form.Label>
                  <Form.Select
                    required
                    className="rounded-1 form-select-sm"
                    value={danhMucId}
                    onChange={(e) => setDanhMucId(e.target.value)}
                  >
                    {danhMucList.map((dm) => (
                      <option key={dm._id} value={dm._id}>
                        {dm.ten}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="conBanCheckbox"
                    className="small text-secondary fw-semibold mb-1"
                    label="Đang bán"
                    checked={conBan}
                    onChange={(e) => setConBan(e.target.checked)}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="canNaoCheckbox"
                    className="small text-secondary fw-semibold"
                    label="Cần bếp chế biến"
                    checked={canNao}
                    onChange={(e) => setCanNao(e.target.checked)}
                  />
                </Form.Group>
              </Col>

              {/* KHU VỰC CẤU HÌNH ĐỊNH LƯỢNG NGUYÊN LIỆU TIÊU HAO */}
              <Col md={6} className="border-start">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-bold text-dark small mb-0">
                    Định lượng nguyên liệu tiêu hao
                  </h6>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={handleAddDinhLuongRow}
                    className="fw-semibold py-1 rounded-1"
                  >
                    + Thêm
                  </Button>
                </div>

                {dinhLuong.length === 0 ? (
                  <div className="text-center py-5 text-secondary bg-light border border-light-subtle rounded-1 small">
                    Chưa cấu hình nguyên liệu tiêu hao cho món ăn này.
                  </div>
                ) : (
                  <div
                    className="d-flex flex-column gap-2 overflow-auto"
                    style={{ maxHeight: "360px" }}
                  >
                    {dinhLuong.map((dl, index) => (
                      <Row
                        key={index}
                        className="g-1 align-items-end border-bottom pb-2"
                      >
                        <Col xs={6}>
                          <Form.Label className="fw-semibold text-secondary small mb-1">
                            Nguyên liệu
                          </Form.Label>
                          <Form.Select
                            size="sm"
                            className="rounded-1"
                            value={dl.nguyenLieuID}
                            onChange={(e) =>
                              handleChangeDinhLuongRow(
                                index,
                                "nguyenLieuID",
                                e.target.value,
                              )
                            }
                          >
                            {nguyenLieuList.map((nl) => (
                              <option key={nl._id} value={nl._id}>
                                {nl.ten}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>

                        <Col xs={3}>
                          <Form.Label className="fw-semibold text-secondary small mb-1">
                            Số lượng
                          </Form.Label>
                          <Form.Control
                            size="sm"
                            type="number"
                            step="any"
                            min="0.01"
                            className="rounded-1"
                            value={dl.soLuong}
                            onChange={(e) =>
                              handleChangeDinhLuongRow(
                                index,
                                "soLuong",
                                e.target.value,
                              )
                            }
                          />
                        </Col>

                        <Col xs={2}>
                          <Form.Label className="fw-semibold text-secondary small mb-1">
                            Đơn vị
                          </Form.Label>
                          <Form.Control
                            size="sm"
                            disabled
                            className="rounded-1"
                            value={dl.donVi}
                          />
                        </Col>

                        <Col xs={1} className="text-end">
                          <Button
                            variant="link"
                            className="text-danger p-0 mb-1 border-0 small text-decoration-none fw-bold"
                            onClick={() => handleRemoveDinhLuongRow(index)}
                          >
                            Xóa
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="py-2 px-3 border-top">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-1 px-3"
              onClick={() => setShowModal(false)}
              disabled={dangTaiAnh}
            >
              Hủy
            </Button>
            <Button
              variant="dark"
              size="sm"
              type="submit"
              className="fw-semibold rounded-1 px-3"
              disabled={dangTaiAnh || !!loiAnh}
            >
              {isEditMode ? "Lưu thay đổi" : "Thêm món ăn"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
