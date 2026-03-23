import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import aiService from "../services/aiService";
import { CATEGORY_OPTIONS } from "../utils/constants";
import { getApiErrorMessage } from "../utils/apiError";
import { FALLBACK_IMAGE } from "../utils/image";
import { uploadToCloudinary } from "../utils/cloudinary";
import AddFarmerProductForm from "../components/AddFarmerProductForm";
import AddVendorProductForm from "../components/AddVendorProductForm";
import { useLanguage } from "../context/LanguageContext";

function AddProductPage() {
  const { user } = useAuth();
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
  return (
    <section className="page-card add-product-wrap">
      <div className="section-head">
        <h2>Add Product</h2>
      </div>
      {user?.role === "vendor" ? <AddVendorProductForm /> : <AddFarmerProductForm />}
    </section>
  );
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
