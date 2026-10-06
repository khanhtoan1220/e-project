const ENV = {
  app_name: "Hệ Thống Nhân Viên Nhà Hàng",
  api_url: "http://localhost:3000/api",
  customer_url: import.meta.env.VITE_CUSTOMER_URL || `${window.location.protocol}//${window.location.hostname}:5176`,
  env: "development",
};

export default ENV;
