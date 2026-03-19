import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(formData);
      navigate("/products", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap page-card">
      <h2>Create Account</h2>
      <p className="muted">Register as customer, farmer, or vendor.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

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
            minLength={6}
          />
        </label>

        <label>
          Role
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="farmer">Farmer</option>
            <option value="vendor">Vendor</option>
          </select>
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="auth-meta">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
