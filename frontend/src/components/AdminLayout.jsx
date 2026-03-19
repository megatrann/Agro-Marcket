import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <section className="admin-shell">
      <aside className="admin-sidebar page-card">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/analytics">Analytics</NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
        </nav>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </section>
  );
}

export default AdminLayout;
