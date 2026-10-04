import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Table,
  Badge,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import apiClient from "../utils/api";
import URL from "../constants/URL";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());

  // Dữ liệu thống kê
  const [statData, setStatData] = useState({
    tongDoanhThu: 0,
    tongLuotKhach: 0,
    trungBinhMoiHoaDon: 0,
  });

  const [monBanChay, setMonBanChay] = useState([]);
  const [monBanE, setMonBanE] = useState([]);
  const [tonKhoThap, setTonKhoThap] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Gọi tuần tự từng API theo đúng chuẩn giảng dạy của thầy Hòa
      const resDoanhThu = await apiClient.get(
        `/quan-tri/thong-ke/doanh-thu?thang=${thang}&nam=${nam}`,
      );
      setStatData(resDoanhThu.data);

      const resBanChay = await apiClient.get(
        "/quan-tri/thong-ke/mon-ban-chay?kieu=banchay",
      );
      setMonBanChay(resBanChay.data || []);

      const resBanE = await apiClient.get(
        "/quan-tri/thong-ke/mon-ban-chay?kieu=bane",
      );
      setMonBanE(resBanE.data || []);

      const resKho = await apiClient.get("/quan-tri/thong-ke/ton-kho-thap");
      setTonKhoThap(resKho.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [thang, nam]);

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartDataMon = monBanChay.map((item) => ({
    name: item._id || "N/A",
    "Số lượng": item.soLuongDaBan,
    "Doanh thu": item.doanhThuMon,
  }));

  return (
    <div className="admin-page">
      {/* Header Dashboard & Bộ Lọc */}
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Tổng quan</h1>
          <div className="text-muted small">
            Báo cáo số liệu và thống kê tình hình hoạt động kinh doanh
          </div>
        </div>

        {/* Bộ lọc tháng năm dẹt phẳng */}
        <div className="d-flex gap-2 align-items-center bg-white p-1 border border-light-subtle rounded-1">
          <Form.Select
            size="sm"
            value={thang}
            onChange={(e) => setThang(Number(e.target.value))}
            className="rounded-1 border-0 fw-semibold bg-transparent small"
            style={{ width: "110px", fontSize: "0.85rem" }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            size="sm"
            value={nam}
            onChange={(e) => setNam(Number(e.target.value))}
            className="rounded-1 border-0 fw-semibold bg-transparent small"
            style={{ width: "95px", fontSize: "0.85rem" }}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </Form.Select>
          <Button
            variant="outline-secondary"
            size="sm"
            className="text-dark p-1"
            onClick={loadDashboardData}
          >
            Xem báo cáo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary mt-2">
            Đang tính toán số liệu thống kê...
          </p>
        </div>
      ) : (
        <>
          {/* 1. Các thẻ chỉ số phẳng dẹt (Flat Metric Card) */}
          <Row className="g-2 mb-3">
            <Col md={4}>
              <div className="bg-white p-3 border border-light-subtle rounded-1">
                <div
                  className="text-muted small fw-semibold "
                  style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                >
                  Doanh thu tháng
                </div>
                <h3
                  className="fw-bold text-dark mt-1 mb-0"
                  style={{ fontSize: "1.45rem" }}
                >
                  {Number(statData.tongDoanhThu || 0).toLocaleString("vi-VN")}đ
                </h3>
                <div
                  className="text-success small mt-2"
                  style={{ fontSize: "0.85rem" }}
                >
                  Chỉ tính hóa đơn thành công
                </div>
              </div>
            </Col>

            <Col md={4}>
              <div className="bg-white p-3 border border-light-subtle rounded-1">
                <div
                  className="text-muted small fw-semibold "
                  style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                >
                  Lượt khách phục vụ
                </div>
                <h3
                  className="fw-bold text-dark mt-1 mb-0"
                  style={{ fontSize: "1.45rem" }}
                >
                  {statData.tongLuotKhach || 0} lượt đơn
                </h3>
                <div
                  className="text-muted small mt-2"
                  style={{ fontSize: "0.85rem" }}
                >
                  Hóa đơn đã chốt
                </div>
              </div>
            </Col>

            <Col md={4}>
              <div className="bg-white p-3 border border-light-subtle rounded-1">
                <div
                  className="text-muted small fw-semibold "
                  style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                >
                  Giá trị trung bình đơn
                </div>
                <h3
                  className="fw-bold text-dark mt-1 mb-0"
                  style={{ fontSize: "1.45rem" }}
                >
                  {Number(statData.trungBinhMoiHoaDon || 0).toLocaleString(
                    "vi-VN",
                  )}
                  đ
                </h3>
                <div
                  className="text-muted small mt-2"
                  style={{ fontSize: "0.85rem" }}
                >
                  Doanh số trên mỗi lượt khách
                </div>
              </div>
            </Col>
          </Row>

          {/* 2. Biểu đồ món ăn bán chạy */}
          <div className="bg-white border border-light-subtle rounded-1 p-3 mb-3">
            <h6 className="fw-bold text-dark mb-3 small">
              Món bán chạy
            </h6>
            <div style={{ width: "100%", height: 300 }}>
              {chartDataMon.length === 0 ? (
                <div className="text-center py-5 text-secondary small">
                  Chưa có dữ liệu bán hàng.
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart
                    data={chartDataMon}
                    margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#475569"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#15803d"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      yAxisId="left"
                      dataKey="Số lượng"
                      fill="#28594e"
                      radius={[1, 1, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="Doanh thu"
                      fill="#9daf9d"
                      radius={[1, 1, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 3. Bảng cảnh báo kho & món bán chậm dẹt phẳng */}
          <Row className="g-2">
            {/* Tồn kho thấp */}
            <Col md={6}>
              <div className="bg-white border border-light-subtle rounded-1 p-3 h-100">
                <h6 className="fw-bold text-danger mb-3 small">
                  Nguyên liệu sắp hết (dưới 10)
                </h6>
                {tonKhoThap.length === 0 ? (
                  <div className="text-center py-4 text-success small">
                    Tất cả nguyên liệu trong kho đều an toàn.
                  </div>
                ) : (
                  <Table
                    responsive
                    hover
                    className="align-middle mb-0 table-sm small"
                  >
                    <thead className="table-light border-bottom">
                      <tr>
                        <th className="text-muted py-2 fw-semibold small">
                          Nguyên liệu
                        </th>
                        <th
                          className="text-muted py-2 fw-semibold small"
                          style={{ width: "100px" }}
                        >
                          Đơn vị
                        </th>
                        <th
                          className="text-muted py-2 fw-semibold small"
                          style={{ width: "100px" }}
                        >
                          Tồn thực tế
                        </th>
                        <th
                          className="text-muted py-2 fw-semibold small"
                          style={{ width: "100px" }}
                        >
                          Tình trạng
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tonKhoThap.map((item) => (
                        <tr
                          key={item._id}
                          className="border-bottom last-border-0"
                        >
                          <td className="fw-semibold text-dark py-2 small">
                            {item.ten}
                          </td>
                          <td className="py-2 small">{item.donVi}</td>
                          <td className="text-danger fw-bold py-2 small">
                            {item.soLuongTon}
                          </td>
                          <td className="py-2 small">
                            {item.soLuongTon === 0 ? (
                              <Badge
                                bg="danger-subtle"
                                text="danger"
                                className="border border-danger rounded-1 px-2 py-1 font-weight-normal small-text"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Hết sạch
                              </Badge>
                            ) : (
                              <Badge
                                bg="warning-subtle"
                                text="warning"
                                className="border border-warning rounded-1 px-2 py-1 font-weight-normal small-text"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Sắp hết
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Col>

            {/* Món bán chậm */}
            <Col md={6}>
              <div className="bg-white border border-light-subtle rounded-1 p-3 h-100">
                <h6 className="fw-bold text-dark mb-3 small">
                  Món ít được gọi
                </h6>
                {monBanE.length === 0 ? (
                  <div className="text-center py-4 text-secondary small">
                    Chưa có dữ liệu thống kê món bán chậm.
                  </div>
                ) : (
                  <Table
                    responsive
                    hover
                    className="align-middle mb-0 table-sm small"
                  >
                    <thead className="table-light border-bottom">
                      <tr>
                        <th className="text-muted py-2 fw-semibold small">
                          Tên món ăn
                        </th>
                        <th
                          className="text-muted py-2 fw-semibold small text-center"
                          style={{ width: "100px" }}
                        >
                          Đã bán
                        </th>
                        <th
                          className="text-muted py-2 fw-semibold text-end px-3 small"
                          style={{ width: "150px" }}
                        >
                          Doanh thu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monBanE.map((item) => (
                        <tr
                          key={item._id}
                          className="border-bottom last-border-0"
                        >
                          <td className="fw-semibold text-dark py-2 small">
                            {item._id}
                          </td>
                          <td className="text-danger fw-bold py-2 text-center small">
                            {item.soLuongDaBan} phần
                          </td>
                          <td className="text-secondary py-2 text-end px-3 small">
                            {Number(item.doanhThuMon || 0).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
