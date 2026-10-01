import { useEffect, useState } from "react";
import api from "../services/api";

function Category({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/thuc-don/danh-muc");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
        setError("Không thể tải danh mục.");
      }
    };
    load();
  }, []);

  return (
    <div className="category-list">
      {error && <p className="error-text">{error}</p>}
      <button
        className={!selectedCategoryId ? "category active" : "category"}
        onClick={() => onSelectCategory(null)}
      >
        Tất cả
      </button>
      {categories.map((category) => (
        <button
          key={category._id}
          className={selectedCategoryId === category._id ? "category active" : "category"}
          onClick={() => onSelectCategory(category._id)}
        >
          {category.ten}
        </button>
      ))}
    </div>
  );
}

export default Category;
