import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import aiService from "../services/aiService";
import { CATEGORY_OPTIONS } from "../utils/constants";
import { getApiErrorMessage } from "../utils/apiError";
import { FALLBACK_IMAGE } from "../utils/image";
import { uploadToCloudinary } from "../utils/cloudinary";
import { useLanguage } from "../context/LanguageContext";

function AddProductPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();

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
    benefits: "",
    tags: "",
  });
  const [imageFiles, setImageFiles] = useState([]);

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

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 8) {
      setError(t("add.tooManyImages"));
      setImageFiles(selectedFiles.slice(0, 8));
      return;
    }

    setError("");
    setImageFiles(selectedFiles);
  };

  const previews = useMemo(
    () => imageFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [imageFiles]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleGenerateAI = async () => {
    setError("");
    setSuccess("");

    if (!form.title || !form.category || !form.location) {
      setError(t("add.aiNeedsBasics"));
      return;
    }

    setGenerating(true);
    try {
      const result = await aiService.generateProductDescription({
        productName: form.title,
        category: form.category,
        location: form.location,
        type: form.type === "organic" ? "organic" : "non-organic",
        language,
      });

      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        benefits: Array.isArray(result.benefits) ? result.benefits.join("\n") : prev.benefits,
        tags: Array.isArray(result.tags) ? result.tags.join(", ") : prev.tags,
      }));
      setSuccess(t("add.aiGenerated"));
    } catch (err) {
      setError(getApiErrorMessage(err, t("add.aiFailed")));
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
      let imageUrls = [];
      if (imageFiles.length > 0) {
        // Upload all images to Cloudinary in parallel
        const uploadResults = await Promise.all(
          imageFiles.map((file) => uploadToCloudinary(file))
        );
        imageUrls = uploadResults.map((res) => res.secure_url);
      }

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
        images: imageUrls,
      });

      setSuccess(t("add.createSuccess"));
      setTimeout(() => navigate("/products"), 800);
    } catch (err) {
      setError(getApiErrorMessage(err, t("add.createFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-card add-product-wrap">
      <div className="section-head">
        <h2>{t("add.title")}</h2>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <label>
          {t("add.productName")}
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          {t("add.category")}
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {t(`category.${category}`)}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("add.subcategory")}
          <input name="subcategory" value={form.subcategory} onChange={handleChange} />
        </label>

        <label>
          {t("add.location")}
          <input name="location" value={form.location} onChange={handleChange} required />
        </label>

        <label>
          {t("add.type")}
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="organic">{t("add.organic")}</option>
            <option value="non-organic">{t("add.nonOrganic")}</option>
          </select>
        </label>

        <div className="ai-action-row">
          <button type="button" className="btn btn-outline" onClick={handleGenerateAI} disabled={generating}>
            {generating ? t("add.generatingAi") : t("add.generateAi")}
          </button>
        </div>

        <label className="full-width">
          {t("add.description")}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </label>

        <label className="full-width">
          {t("add.benefits")}
          <textarea name="benefits" value={form.benefits} onChange={handleChange} rows="4" />
        </label>

        <label className="full-width">
          {t("add.tags")}
          <input name="tags" value={form.tags} onChange={handleChange} />
        </label>

        <label>
          {t("add.retail")}
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
          {t("add.wholesale")}
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
          {t("add.minWholesale")}
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
          {t("add.available")}
          <input
            type="number"
            min="0"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>

        <label className="full-width image-input-label">
          {t("add.upload")}
          <input type="file" accept="image/*" multiple onChange={handleImageSelection} />
          <span className="muted">{t("add.uploadHint")}</span>
        </label>

        <div className="full-width upload-preview-grid">
          {previews.length > 0 ? (
            previews.map((preview) => (
              <figure key={preview.url} className="upload-preview-card">
                <img src={preview.url} alt={preview.name} />
                <figcaption>{preview.name}</figcaption>
              </figure>
            ))
          ) : (
            <figure className="upload-preview-card empty">
              <img src={FALLBACK_IMAGE} alt="No image selected" />
              <figcaption>{t("add.noImage")}</figcaption>
            </figure>
          )}
        </div>

        {error ? <p className="error-text full-width">{error}</p> : null}
        {success ? <p className="success-text full-width">{success}</p> : null}

        <div className="full-width">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t("add.saving") : t("add.create")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddProductPage;
