import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-top">
          <div>
            <h3>Agri Market</h3>
            <p>{t("footer.description")}</p>
          </div>
          <nav className="footer-links" aria-label="Footer links">
            <Link to="/products">{t("footer.marketplace")}</Link>
            <Link to="/products/new">{t("footer.sell")}</Link>
            <Link to="/my-products">My Products</Link>
            <Link to="/orders">{t("footer.orders")}</Link>
            <Link to="/cart">{t("footer.cart")}</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </div>
        <p className="footer-bottom">© {year} Agri Market. {t("footer.bottom")}</p>
      </div>
    </footer>
  );
}

export default Footer;
