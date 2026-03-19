import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import { FALLBACK_IMAGE, resolveImageUrl } from "../utils/image";
import { useLanguage } from "../context/LanguageContext";

function ProductCard({ product, onAddToCart, disabled }) {
  const { t } = useLanguage();
  const image = resolveImageUrl(product.images?.[0]);
  const [imgSrc, setImgSrc] = useState(image);

  useEffect(() => {
    setImgSrc(image);
  }, [image]);

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrap">
        <img
          src={imgSrc}
          alt={product.title}
          className="product-image"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
      </Link>
      <div className="product-content">
        <div className="product-header">
          <h3>
            <Link to={`/product/${product.id}`}>{product.title}</Link>
          </h3>
          {product.organic ? <span className="badge badge-organic">{t("product.organic")}</span> : null}
        </div>
        <p className="product-location">{product.location}</p>
        <div className="price-group">
          <p>{t("product.retail")}: {formatCurrency(product.retailPrice)}</p>
          <p>{t("product.wholesale")}: {formatCurrency(product.wholesalePrice)}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onAddToCart(product.id)}
          disabled={disabled}
        >
          {t("product.addToCart")}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
