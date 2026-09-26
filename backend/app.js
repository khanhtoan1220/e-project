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

app.use((req, res) => {
  res.status(404).json({ message: "Đường dẫn không tồn tại" });
});

module.exports = app;
