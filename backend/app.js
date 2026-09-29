const express = require("express");
const cors = require("cors");

const session = require("express-session");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(express.static("public"));
app.use(
  session({
    secret: "khanhtoan123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      secure: false,
    },
  }),
);
app.use(express.static("public"));
app.use("/api", require("./routes/router"));

// Xử lý 404
app.use((req, res) => {
  res.status(404).json({ message: "Đường dẫn không tồn tại" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Lỗi máy chủ:", err.stack || err);
  res.status(err.status || 500).json({
    status: false,
    message: err.message || "Đã có lỗi nội bộ từ máy chủ",
  });
});

module.exports = app;
