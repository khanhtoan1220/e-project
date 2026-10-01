import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Spinner, Table, Badge } from "react-bootstrap";
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
  Legend
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
    trungBinhMoiHoaDon: 0
  });

  const [monBanChay, setMonBanChay] = useState([]);
  const [monBanE, setMonBanE] = useState([]);
  const [tonKhoThap, setTonKhoThap] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Gọi đồng thời các API Thống kê của Backend
      const [resDoanhThu, resBanChay, resBanE, resKho] = await Promise.all([
        apiClient.get(`/quan-tri/thong-ke/doanh-thu?thang=${thang}&nam=${nam}`),
        apiClient.get("/quan-tri/thong-ke/mon-ban-chay?kieu=banchay"),
        apiClient.get("/quan-tri/thong-ke/mon-ban-chay?kieu=bane"),
        apiClient.get("/quan-tri/thong-ke/ton-kho-thap")
      ]);

      setStatData(resDoanhThu.data);
      setMonBanChay(resBanChay.data || []);
      setMonBanE(resBanE.data || []);
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
  const chartDataMon = monBanChay.map(item => ({
    name: item._id || "N/A",
    "Số lượng": item.soLuongDaBan,
    "Doanh thu": item.doanhThuMon
  }));

  return (
    <div>
      {/* Header Dashboard & Bộ Lọc */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">📊 Tổng Quan & Thống Kê Doanh Thu</h2>
          <p className="text-secondary mb-0">Báo cáo trực quan tình hình kinh doanh của nhà hàng</p>
        </div>

        {/* Bộ lọc tháng năm */}
        <Form className="d-flex gap-2 align-items-center bg-white p-2 rounded shadow-sm">
          <i className="bi bi-funnel text-secondary ms-1"></i>
          <Form.Select 
            size="sm" 
            value={thang} 
            onChange={(e) => setThang(Number(e.target.value))} 
            style={{ width: "110px" }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </Form.Select>
          <Form.Select 
            size="sm" 
            value={nam} 
            onChange={(e) => setNam(Number(e.target.value))} 
            style={{ width: "100px" }}
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </Form.Select>
          <Button variant="primary" size="sm" onClick={loadDashboardData}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
        </Form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary mt-2">Đang tính toán số liệu thống kê...</p>
        </div>
      ) : (
        <>
          {/* 1. Các thẻ chỉ số tổng quan (Stat Cards) */}
          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-3 bg-gradient bg-primary text-white">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: "0.75rem" }}>Tổng Doanh Thu (Đã thanh toán)</small>
                    <h2 className="fw-bold mt-1 mb-0">{Number(statData.tongDoanhThu || 0).toLocaleString("vi-VN")}đ</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded p-3">
                    <i className="bi bi-cash-coin fs-2"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-3 bg-gradient bg-success text-white">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: "0.75rem" }}>Đơn Hàng Thành Công</small>
                    <h2 className="fw-bold mt-1 mb-0">{statData.tongLuotKhach || 0} hóa đơn</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded p-3">
                    <i className="bi bi-receipt fs-2"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-3 bg-gradient bg-info text-dark">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-dark-50 text-uppercase fw-bold" style={{ fontSize: "0.75rem" }}>Giá Trị Trung Bình / Đơn</small>
                    <h2 className="fw-bold mt-1 mb-0">{Number(statData.trungBinhMoiHoaDon || 0).toLocaleString("vi-VN")}đ</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded p-3">
                    <i className="bi bi-calculator fs-2"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 2. Biểu đồ món ăn bán chạy */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Body className="p-4">
                  <h5 className="fw-bold text-dark mb-4">🔥 Top 10 Món Ăn Bán Chạy Nhất (Số lượng & Doanh thu)</h5>
                  <div style={{ width: "100%", height: 350 }}>
                    {chartDataMon.length === 0 ? (
                      <div className="text-center py-5 text-secondary">Chưa có dữ liệu bán hàng.</div>
                    ) : (
                      <ResponsiveContainer>
                        <BarChart data={chartDataMon} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="Số lượng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 3. Bảng cảnh báo kho & món bán chậm */}
          <Row className="g-4">
            {/* Tồn kho thấp */}
            <Col md={6}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-danger mb-0">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>Cảnh Báo Tồn Kho Thấp (&lt; 10)
                  </h5>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  {tonKhoThap.length === 0 ? (
                    <div className="text-center py-5 text-success">
                      <i className="bi bi-check-circle-fill fs-1 d-block mb-2"></i>
                      Tất cả nguyên liệu trong kho đều an toàn!
                    </div>
                  ) : (
                    <Table responsive hover className="align-middle mb-0 mt-2">
                      <thead>
                        <tr>
                          <th>Nguyên Liệu</th>
                          <th>Đơn Vị</th>
                          <th>Còn Lại</th>
                          <th>Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tonKhoThap.map(item => (
                          <tr key={item._id}>
                            <td className="fw-bold text-dark">{item.tenNguyenLieu}</td>
                            <td>{item.donViTinh}</td>
                            <td className="text-danger fw-bold">{item.soLuongTon}</td>
                            <td>
                              {item.soLuongTon === 0 ? (
                                <Badge bg="danger">Hết hàng</Badge>
                              ) : (
                                <Badge bg="warning" text="dark">Sắp hết</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Món bán chậm */}
            <Col md={6}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Header className="bg-white border-0 pt-4 px-4">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-arrow-down-right-circle-fill text-warning me-2"></i>Món Ăn Bán Ít / Chậm Nhất
                  </h5>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  {monBanE.length === 0 ? (
                    <div className="text-center py-5 text-secondary">Chưa có dữ liệu thống kê món bán chậm.</div>
                  ) : (
                    <Table responsive hover className="align-middle mb-0 mt-2">
                      <thead>
                        <tr>
                          <th>Tên Món Ăn</th>
                          <th>Đã Bán</th>
                          <th>Doanh Thu Thu Được</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monBanE.map(item => (
                          <tr key={item._id}>
                            <td className="fw-bold text-dark">{item._id}</td>
                            <td className="text-danger fw-bold">{item.soLuongDaBan} phần</td>
                            <td className="text-secondary">{Number(item.doanhThuMon || 0).toLocaleString("vi-VN")}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}