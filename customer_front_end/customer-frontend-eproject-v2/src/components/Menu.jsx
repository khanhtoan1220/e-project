import { useEffect, useState } from "react";
import api from "../services/api";

function Menu({ selectedCategoryId, onAddToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/thuc-don/mon-an", {
          params: {
            ...(selectedCategoryId ? { danhMuc: selectedCategoryId } : {}),
            conBan: true
          }
        });
        setItems(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (error) {
        console.error(error);
        setError("Không thể tải thực đơn.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCategoryId]);

  if (loading) return <p className="status-text">Đang tải món ăn...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="menu-grid">
      {items.map((item) => (
        <article className="menu-card" key={item._id}>
          {item.hinhAnh ? (
            <img src={item.hinhAnh} alt={item.ten} />
          ) : (
            <div className="menu-placeholder">🍽️</div>
          )}
          <div className="menu-card-body">
            <h3>{item.ten}</h3>
            <p className="price">{Number(item.gia).toLocaleString("vi-VN")} đ</p>
            <button onClick={() => onAddToCart(item)}>Thêm vào giỏ</button>
          </div>
        </article>
      ))}
      {items.length === 0 && <p className="status-text">Không có món phù hợp.</p>}
    </div>
  );
}

export default Menu;
