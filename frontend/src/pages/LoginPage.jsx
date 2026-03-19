import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/products";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap page-card">
      <h2>Login</h2>
      <p className="muted">Access your cart, orders, and purchase history.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="auth-meta">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}

export default LoginPage;
