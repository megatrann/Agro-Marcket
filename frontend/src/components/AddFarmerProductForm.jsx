import { useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import { uploadToCloudinary } from "../utils/cloudinary";
import { useLanguage } from "../context/LanguageContext";

const FARMER_CATEGORIES = ["Vegetables", "Fruits", "Grains", "Seeds"];

export default function AddFarmerProductForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: FARMER_CATEGORIES[0],
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelection = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setImageFiles(selectedFiles.slice(0, 8));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const uploadResults = await Promise.all(imageFiles.map(uploadToCloudinary));
        imageUrls = uploadResults.map((res) => res.secure_url);
      }
      await productService.createProduct({
        ...form,
        organic: form.type === "organic",
        retailPrice: Number(form.retailPrice),
        wholesalePrice: Number(form.wholesalePrice),
        minWholesaleQty: Number(form.minWholesaleQty),
        quantity: Number(form.quantity),
        images: imageUrls,
      });
      setSuccess(t("add.createSuccess"));
      setTimeout(() => navigate("/products"), 800);
    } catch (err) {
      setError(t("add.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-product-form" onSubmit={handleSubmit}>
      <label>Product Name<input name="title" value={form.title} onChange={handleChange} required /></label>
      <label>Category<select name="category" value={form.category} onChange={handleChange}>{FARMER_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></label>
      <label>Subcategory<input name="subcategory" value={form.subcategory} onChange={handleChange} /></label>
      <label>Organic<select name="type" value={form.type} onChange={handleChange}><option value="organic">Organic</option><option value="non-organic">Non-Organic</option></select></label>
      <label>Retail Price<input type="number" name="retailPrice" value={form.retailPrice} onChange={handleChange} required /></label>
      <label>Wholesale Price<input type="number" name="wholesalePrice" value={form.wholesalePrice} onChange={handleChange} required /></label>
      <label>Min Wholesale Qty<input type="number" name="minWholesaleQty" value={form.minWholesaleQty} onChange={handleChange} required /></label>
      <label>Quantity<input type="number" name="quantity" value={form.quantity} onChange={handleChange} required /></label>
      <label>Location<input name="location" value={form.location} onChange={handleChange} required /></label>
      <label>Benefits<textarea name="benefits" value={form.benefits} onChange={handleChange} /></label>
      <label>Tags<input name="tags" value={form.tags} onChange={handleChange} /></label>
      <label>Images<input type="file" accept="image/*" multiple onChange={handleImageSelection} /></label>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      <button type="submit" className="btn btn-primary" disabled={submitting}>Add Product</button>
    </form>
  );
}
