import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <NavLink to="/" className="brand-link">
          <h1 className="brand">Agri Market</h1>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          {["farmer", "vendor", "admin"].includes(user?.role) ? (
            <NavLink to="/products/new">Add Product</NavLink>
          ) : null}
          <NavLink to="/cart">Cart ({totalItems})</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          {user?.role === "admin" ? <NavLink to="/admin/dashboard">Admin</NavLink> : null}
          {isAuthenticated ? (
            <button type="button" className="nav-logout" onClick={logout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
