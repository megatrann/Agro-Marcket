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

  return (
    <section className="page-card add-product-wrap">
      <div className="section-head">
        <h2>Add Product</h2>
      </div>
      {user?.role === "vendor" ? <AddVendorProductForm /> : <AddFarmerProductForm />}
    </section>
  );
}

export default AddProductPage;
