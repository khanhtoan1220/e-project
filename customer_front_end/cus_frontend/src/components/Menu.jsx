import { useEffect, useState } from "react";
import api from "../services/api";

function Menu({
  selectedCategoryId,
  searchKeyword = "",
  onAddToCart,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/menuitem");

        let data = Array.isArray(response.data)
          ? response.data
          : [];

        // Chỉ hiển thị món đang phục vụ
        data = data.filter(
          (item) => item.isAvailable !== false
        );

        // Lọc danh mục
        if (selectedCategoryId) {
          data = data.filter((item) => {
            const categoryId =
              item.categoryId?._id ||
              item.categoryId;

            return (
              String(categoryId) ===
              String(selectedCategoryId)
            );
          });
        }

        // Tìm kiếm
        const keyword = searchKeyword
          .trim()
          .toLowerCase();

        if (keyword) {
          data = data.filter((item) => {
            const name = String(
              item.name || ""
            ).toLowerCase();

            const description = String(
              item.description || ""
            ).toLowerCase();

            return (
              name.includes(keyword) ||
              description.includes(keyword)
            );
          });
        }

        setItems(data);
      } catch (error) {
        console.error("Lỗi tải thực đơn:", error);
        setError("Không thể tải thực đơn.");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [selectedCategoryId, searchKeyword]);

  if (loading) {
    return (
      <p className="status-text">
        Đang tải món ăn...
      </p>
    );
  }

  if (error) {
    return (
      <p className="error-text">
        {error}
      </p>
    );
  }

  return (
    <div className="menu-grid">
      {items.map((item) => (
        <article
          className="menu-card"
          key={item._id}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
            />
          ) : (
            <div className="menu-placeholder">
              🍽️
            </div>
          )}

          <div className="menu-card-body">
            <h3>{item.name}</h3>

            {item.description && (
              <p className="menu-description">
                {item.description}
              </p>
            )}

            <div className="menu-card-bottom">
              <p className="price">
                {Number(
                  item.price || 0
                ).toLocaleString("vi-VN")}{" "}
                đ
              </p>

              <button
                type="button"
                onClick={() =>
                  onAddToCart(item)
                }
              >
                + Thêm
              </button>
            </div>
          </div>
        </article>
      ))}

      {items.length === 0 && (
        <p className="status-text">
          Không có món phù hợp.
        </p>
      )}
    </div>
  );
}

export default Menu;