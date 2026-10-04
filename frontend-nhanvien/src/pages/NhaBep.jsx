import React, { useEffect, useState } from "react";
import { Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import {
  get_bep_moncho_service,
  bep_capnhat_mon_service,
} from "../services/staff_service";

export default function NhaBep() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await get_bep_moncho_service();
      setList(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Thiết lập tự động làm mới danh sách mỗi 10 giây (Polling dự phòng cho Pusher)
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCapNhatTrangThai = async (
    hoaDonId,
    monItemObjectId,
    trangThaiMoi,
    _tenMon,
  ) => {
    try {
      setError("");
      await bep_capnhat_mon_service(hoaDonId, monItemObjectId, trangThaiMoi);
      // Tải lại danh sách sau khi lưu
      loadData();
    } catch (err) {
      setError(err.toString());
    }
  };

  const renderBadgeTrangThaiMon = (trangThai) => {
    switch (trangThai) {
      case "choCheBien":
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-1 small fw-semibold">
            Chờ nấu
          </span>
        );
      case "dangLam":
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1 rounded-1 small fw-semibold">
            Đang nấu
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary px-2 py-1 rounded-1 small">
            {trangThai}
          </span>
        );
    }
  };

  return (
    <div className="staff-page">
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Nhà bếp</h1>
          <div className="text-muted small">
            Chế biến và kiểm soát thứ tự ra món ăn cho thực khách
          </div>
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-1 px-3 fw-semibold"
          onClick={loadData}
        >
          Làm mới
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary mt-2 mb-0">
            Đang đồng bộ danh sách món chờ...
          </p>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-5 border border-light-subtle rounded-1 bg-white">
          <h5 className="fw-bold text-dark mt-2 mb-1">
            Mọi món ăn đã được hoàn thành
          </h5>
          <p className="text-secondary small mb-0">
            Hiện tại không có món ăn nào đang xếp hàng chờ chế biến.
          </p>
        </div>
      ) : (
        <Row className="g-2">
          {list.map((mon, idx) => (
            <Col key={idx} xs={12} sm={6} md={4} lg={3}>
              <div
                className="kitchen-card bg-white h-100 d-flex flex-column justify-content-between"
                style={{
                  borderLeft:
                    mon.item.trangThaiMon === "choCheBien"
                      ? "4px solid #f59e0b"
                      : "4px solid #739784",
                }}
              >
                {/* Header Thẻ: Số bàn */}
                <div className="border-bottom py-2 px-3 d-flex justify-content-between align-items-center bg-light">
                  <span className="fw-bold text-dark small">
                    {mon.banId?.ten || "Bàn ăn"}
                  </span>
                  <span
                    className="text-muted small"
                    style={{ fontSize: "0.85rem" }}
                  >
                    #{mon.hoaDonId.substring(18).toUpperCase()}
                  </span>
                </div>

                <div className="p-3 flex-grow-1 d-flex flex-column justify-content-between">
                  <div>
                    {/* Tên món và Số lượng */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span
                        className="fw-bold text-dark"
                        style={{ maxWidth: "80%", fontSize: "0.95rem" }}
                      >
                        {mon.item.ten}
                      </span>
                      <span className="badge bg-light text-dark rounded-1 px-2 py-1 small">
                        x{mon.item.soLuong}
                      </span>
                    </div>

                    <div className="mb-2">
                      {renderBadgeTrangThaiMon(mon.item.trangThaiMon)}
                    </div>

                    {/* Ghi chú của khách */}
                    {mon.item.ghiChu && (
                      <div
                        className="dish-note mb-3"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Ghi chú: {mon.item.ghiChu}
                      </div>
                    )}
                  </div>

                  {/* Nút hành động */}
                  <div className="d-flex flex-column gap-2 mt-2">
                    {mon.item.trangThaiMon === "choCheBien" && (
                      <Button
                        variant="dark"
                        size="sm"
                        className="fw-semibold py-2 rounded-1"
                        onClick={() =>
                          handleCapNhatTrangThai(
                            mon.hoaDonId,
                            mon.item._id,
                            "dangLam",
                            mon.item.ten,
                          )
                        }
                      >
                        Bắt đầu chế biến
                      </Button>
                    )}

                    {mon.item.trangThaiMon === "dangLam" && (
                      <Button
                        variant="success"
                        size="sm"
                        className="fw-semibold py-2 rounded-1 border-0"
                        onClick={() =>
                          handleCapNhatTrangThai(
                            mon.hoaDonId,
                            mon.item._id,
                            "daXong",
                            mon.item.ten,
                          )
                        }
                      >
                        Nấu xong
                      </Button>
                    )}

                    {/* Chỉ cho phép bếp báo hủy món khi chưa hoàn thành chế biến */}
                    {(mon.item.trangThaiMon === "choCheBien" ||
                      mon.item.trangThaiMon === "dangLam") && (
                      <Button
                        variant="link"
                        size="sm"
                        className="fw-semibold text-danger text-decoration-none p-0 mt-1 small"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Xác nhận hủy chế biến món "${mon.item.ten}" cho ${mon.banId?.ten}?`,
                            )
                          ) {
                            handleCapNhatTrangThai(
                              mon.hoaDonId,
                              mon.item._id,
                              "daHuy",
                              mon.item.ten,
                            );
                          }
                        }}
                      >
                        Hủy chế biến
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
