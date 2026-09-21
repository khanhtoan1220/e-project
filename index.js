require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db.js");

const PORT = process.env.PORT || 3000;

// Kết nối database
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
