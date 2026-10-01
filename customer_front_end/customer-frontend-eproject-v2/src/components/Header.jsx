import "./styles.css";

function Header({ cartCount, currentPage, onNavigate }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <button className="brand" onClick={() => onNavigate("home")}>
          <span className="brand-icon">🍴</span>
          <span>
            <strong>NgonNhà</strong>
            <small>NGON TỪ TÂM</small>
          </span>
        </button>

        <nav>
          <button className={currentPage === "home" ? "nav-active" : ""} onClick={() => onNavigate("home")}>Trang chủ</button>
          <button className={currentPage === "menu" ? "nav-active" : ""} onClick={() => onNavigate("menu")}>Thực đơn</button>
          <button className={currentPage === "booking" ? "nav-active" : ""} onClick={() => onNavigate("booking")}>Đặt bàn</button>
          <button className={currentPage === "support" ? "nav-active" : ""} onClick={() => onNavigate("support")}>Hỗ trợ</button>
        </nav>

        <button className="cart-header" onClick={() => onNavigate("cart")}>
          🛒 Giỏ hàng
          <span>{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
