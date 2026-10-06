import { useEffect, useState } from "react";
import api from "../services/api";

function Menu({
  selectedCategoryId,
  searchKeyword = "",
  minGia = "",
  maxGia = "",
  onAddToCart,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const layUrlAnh = (url) => {
    try {
      return new URL(url, import.meta.env.VITE_ASSET_URL || window.location.origin).toString();
    } catch {
      return url;
    }
  };

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/thuc-don/mon-an", {
          params: {
            danhMuc: selectedCategoryId || undefined,
            search: searchKeyword.trim() || undefined,
            minGia: minGia || undefined,
            maxGia: maxGia || undefined,
          },
        });

        let data = Array.isArray(response.data)
          ? response.data
          : [];

        // Lọc danh mục
        if (selectedCategoryId) {
          data = data.filter((item) => {
            const categoryId =
              item.danhMucId?._id ||
              item.danhMucId;

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
              item.ten || ""
            ).toLowerCase();

            const description = String(
              item.moTa || ""
            ).toLowerCase();

            return (
              name.includes(keyword) ||
              description.includes(keyword)
            );
          });
        }

        if (minGia !== "") data = data.filter((item) => Number(item.gia) >= Number(minGia));
        if (maxGia !== "") data = data.filter((item) => Number(item.gia) <= Number(maxGia));

        setItems(data);
      } catch (error) {
        console.error("Lỗi tải thực đơn:", error);
        setError("Không thể tải thực đơn.");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [selectedCategoryId, searchKeyword, minGia, maxGia]);

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
          {item.hinhAnh ? (
            <img
              src={layUrlAnh(item.hinhAnh)}
              alt={item.ten}
            />
          ) : (
            <div className="menu-placeholder">
              🍽️
            </div>
          )}

          <div className="menu-card-body">
            <h3>{item.ten}</h3>

            <span className={`availability-label ${item.conBan ? "available" : "unavailable"}`}>
              {item.conBan ? "Đang phục vụ" : "Hết món"}
            </span>

            {item.moTa && (
              <p className="menu-description">
                {item.moTa}
              </p>
            )}

            <div className="menu-card-bottom">
              <p className="price">
                {Number(
                  item.gia || 0
                ).toLocaleString("vi-VN")}{" "}
                đ
              </p>

              {onAddToCart && (
                <button
                  type="button"
                  disabled={!item.conBan}
                  onClick={() => onAddToCart({ ...item, name: item.ten, price: item.gia })}
                >
                  {item.conBan ? "+ Thêm" : "Hết món"}
                </button>
              )}
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
