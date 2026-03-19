import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";
import { FALLBACK_IMAGE, resolveImageUrl } from "../utils/image";
import { useLanguage } from "../context/LanguageContext";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await productService.getProductById(id);
        const selected = resolveImageUrl(data.product?.images?.[0]);
        setProduct(data.product);
        setSelectedImage(selected);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load product details."));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to add to cart."));
    }
  };

  if (loading) {
    return <Loader label={t("product.loading")} />;
  }

  if (error) {
    return <section className="page-card">{error}</section>;
  }

  if (!product) {
    return <section className="page-card">{t("product.notFound")}</section>;
  }

  const images =
    product.images?.length > 0
      ? product.images.map((image) => resolveImageUrl(image)).filter(Boolean)
      : [FALLBACK_IMAGE];
  const activeImage = selectedImage || images[0];
  const activeImageIndex = Math.max(0, images.findIndex((image) => image === activeImage));

  return (
    <section className="product-detail page-card">
      <div className="gallery-col">
        <div className="detail-image-shell">
          <img
            src={resolveImageUrl(activeImage)}
            alt={product.title}
            className="detail-main-image"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>
        <p className="gallery-meta">
          {t("product.imageOf", { current: activeImageIndex + 1, total: images.length })}
        </p>
        <div className="thumb-row">
          {images.map((image) => (
            <button
              key={image}
              type="button"
              className={`thumb-btn ${activeImage === image ? "active" : ""}`}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={resolveImageUrl(image)}
                alt={product.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="detail-col">
        <h2>{product.title}</h2>
        <div className="detail-badges">
          {product.organic ? <span className="badge badge-organic">{t("product.organicProduct")}</span> : null}
          <span className="badge detail-category">{product.category}</span>
          {product.subcategory ? <span className="badge detail-category">{product.subcategory}</span> : null}
        </div>
        {product.subcategory ? <p className="muted">{t("product.subcategory")}: {product.subcategory}</p> : null}
        <p className="detail-description">{product.description}</p>
        <p>{t("product.retail")}: {formatCurrency(product.retailPrice)}</p>
        <p>{t("product.wholesale")}: {formatCurrency(product.wholesalePrice)}</p>
        <p>{t("product.minWholesale")}: {product.minWholesaleQty}</p>
        <p>{t("product.location")}: {product.location}</p>
        <p>{t("product.availableQty")}: {product.quantity}</p>

        <div className="seller-box">
          <h4>{t("product.sellerDetails")}</h4>
          <p>{t("auth.name")}: {product.seller?.name || t("common.na")}</p>
          <p>{t("auth.email")}: {product.seller?.email || t("common.na")}</p>
          <p>{t("auth.role")}: {product.seller?.role || t("common.na")}</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
          {t("product.addToCart")}
        </button>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
