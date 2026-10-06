import { useEffect, useState } from "react";
import api from "../services/api";

function Category({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setError("");

        const response = await api.get("/category");

        setCategories(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        setError("Không thể tải danh mục.");
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="category-list">
      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

      <button
        type="button"
        className={
          !selectedCategoryId
            ? "category active"
            : "category"
        }
        onClick={() => onSelectCategory(null)}
      >
        Tất cả
      </button>

      {categories.map((category) => (
        <button
          type="button"
          key={category._id}
          className={
            selectedCategoryId === category._id
              ? "category active"
              : "category"
          }
          onClick={() =>
            onSelectCategory(category._id)
          }
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default Category;