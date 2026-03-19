import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import aiService from "../services/aiService";
import { CATEGORY_OPTIONS } from "../utils/constants";
import { getApiErrorMessage } from "../utils/apiError";

function AddProductPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Vegetables",
    subcategory: "",
    type: "organic",
    retailPrice: "",
    wholesalePrice: "",
    minWholesaleQty: "",
    quantity: "",
    location: "",
    imageUrls: "",
    benefits: "",
    tags: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canCreate = ["farmer", "vendor", "admin"].includes(user?.role);

  if (!canCreate) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateAI = async () => {
    setError("");
    setSuccess("");

    if (!form.title || !form.category || !form.location) {
      setError("Please enter product name, category, and location before AI generation.");
      return;
    }

    setGenerating(true);
    try {
      const result = await aiService.generateProductDescription({
        productName: form.title,
        category: form.category,
        location: form.location,
        type: form.type === "organic" ? "organic" : "non-organic",
      });

      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        benefits: Array.isArray(result.benefits) ? result.benefits.join("\n") : prev.benefits,
        tags: Array.isArray(result.tags) ? result.tags.join(", ") : prev.tags,
      }));
      setSuccess("AI content generated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to generate AI content."));
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const images = form.imageUrls
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

      await productService.createProduct({
        title: form.title,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory || undefined,
        organic: form.type === "organic",
        retailPrice: Number(form.retailPrice),
        wholesalePrice: Number(form.wholesalePrice),
        minWholesaleQty: Number(form.minWholesaleQty),
        quantity: Number(form.quantity),
        location: form.location,
        images,
      });

      setSuccess("Product created successfully.");
      setTimeout(() => navigate("/products"), 800);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create product."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-card add-product-wrap">
      <div className="section-head">
        <h2>Add Product</h2>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <label>
          Product Name
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Subcategory
          <input name="subcategory" value={form.subcategory} onChange={handleChange} />
        </label>

        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} required />
        </label>

        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="organic">Organic</option>
            <option value="non-organic">Non-organic</option>
          </select>
        </label>

        <div className="ai-action-row">
          <button type="button" className="btn btn-outline" onClick={handleGenerateAI} disabled={generating}>
            {generating ? "Generating AI content..." : "Generate AI Description"}
          </button>
        </div>

        <label className="full-width">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </label>

        <label className="full-width">
          Benefits (auto-filled by AI)
          <textarea name="benefits" value={form.benefits} onChange={handleChange} rows="4" />
        </label>

        <label className="full-width">
          Tags (comma separated)
          <input name="tags" value={form.tags} onChange={handleChange} />
        </label>

        <label>
          Retail Price
          <input
            type="number"
            min="0"
            step="0.01"
            name="retailPrice"
            value={form.retailPrice}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Wholesale Price
          <input
            type="number"
            min="0"
            step="0.01"
            name="wholesalePrice"
            value={form.wholesalePrice}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Min Wholesale Quantity
          <input
            type="number"
            min="1"
            name="minWholesaleQty"
            value={form.minWholesaleQty}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Available Quantity
          <input
            type="number"
            min="0"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>

        <label className="full-width">
          Image URLs (comma separated)
          <input name="imageUrls" value={form.imageUrls} onChange={handleChange} />
        </label>

        {error ? <p className="error-text full-width">{error}</p> : null}
        {success ? <p className="success-text full-width">{success}</p> : null}

        <div className="full-width">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving Product..." : "Create Product"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddProductPage;
