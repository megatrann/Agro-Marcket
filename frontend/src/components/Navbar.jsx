import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <NavLink to="/" className="brand-link">
          <h1 className="brand">Agri Market</h1>
        </NavLink>
        <button
          type="button"
          className={`nav-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={t("nav.toggleMenu")}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="primary-nav" className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/">{t("nav.home")}</NavLink>
          <NavLink to="/products">{t("nav.products")}</NavLink>
          {["farmer", "vendor", "admin"].includes(user?.role) ? (
            <NavLink to="/products/new">{t("nav.addProduct")}</NavLink>
          ) : null}
          <NavLink to="/cart">{t("nav.cart")} ({totalItems})</NavLink>
          <NavLink to="/orders">{t("nav.orders")}</NavLink>
          {user?.role === "admin" ? <NavLink to="/admin/dashboard">{t("nav.admin")}</NavLink> : null}
          <label className="language-switcher" aria-label={t("nav.language")}>
            <span>{t("nav.language")}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </label>
          {isAuthenticated ? (
            <button type="button" className="nav-logout" onClick={logout}>
              {t("nav.logout")}
            </button>
          ) : (
            <>
              <NavLink to="/login">{t("nav.login")}</NavLink>
              <NavLink to="/register">{t("nav.register")}</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
