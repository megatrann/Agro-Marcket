import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";

function ProductCard({ product, onAddToCart, disabled }) {
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=800&q=80";

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrap">
        <img src={image} alt={product.title} className="product-image" />
      </Link>
      <div className="product-content">
        <div className="product-header">
          <h3>
            <Link to={`/product/${product.id}`}>{product.title}</Link>
          </h3>
          {product.organic ? <span className="badge badge-organic">Organic</span> : null}
        </div>
        <p className="product-location">{product.location}</p>
        <div className="price-group">
          <p>Retail: {formatCurrency(product.retailPrice)}</p>
          <p>Wholesale: {formatCurrency(product.wholesalePrice)}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onAddToCart(product.id)}
          disabled={disabled}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
