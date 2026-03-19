import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getApiErrorMessage } from "../utils/apiError";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();

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
      <h2>{t("auth.registerTitle")}</h2>
      <p className="muted">{t("auth.registerSubtitle")}</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          {t("auth.name")}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          {t("auth.email")}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          {t("auth.password")}
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
          {t("auth.role")}
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">{t("auth.customer")}</option>
            <option value="farmer">{t("auth.farmer")}</option>
            <option value="vendor">{t("auth.vendor")}</option>
          </select>
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t("auth.creating") : t("auth.register")}
        </button>
      </form>

      <p className="auth-meta">
        {t("auth.already")} <Link to="/login">{t("auth.loginTitle")}</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
