import { NavLink, Outlet } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function AdminLayout() {
  const { t } = useLanguage();

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar page-card">
        <h2>{t("admin.panel")}</h2>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard">{t("admin.dashboard")}</NavLink>
          <NavLink to="/admin/analytics">{t("admin.analytics")}</NavLink>
          <NavLink to="/admin/users">{t("admin.users")}</NavLink>
          <NavLink to="/admin/products">{t("admin.products")}</NavLink>
          <NavLink to="/admin/orders">{t("admin.orders")}</NavLink>
        </nav>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </section>
  );
}

export default AdminLayout;
