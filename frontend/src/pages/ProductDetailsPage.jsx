import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

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
        const selected = data.product?.images?.[0] || "";
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
    return <Loader label="Loading product..." />;
  }

  if (error) {
    return <section className="page-card">{error}</section>;
  }

  if (!product) {
    return <section className="page-card">Product not found.</section>;
  }

  const images = product.images?.length ? product.images : ["https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=1000&q=80"];
  const activeImage = selectedImage || images[0];

  return (
    <section className="product-detail page-card">
      <div className="gallery-col">
        <img src={activeImage} alt={product.title} className="detail-main-image" />
        <div className="thumb-row">
          {images.map((image) => (
            <button
              key={image}
              type="button"
              className={`thumb-btn ${activeImage === image ? "active" : ""}`}
              onClick={() => setSelectedImage(image)}
            >
              <img src={image} alt={product.title} />
            </button>
          ))}
        </div>
      </div>

      <div className="detail-col">
        <h2>{product.title}</h2>
        {product.organic ? <span className="badge badge-organic">Organic Product</span> : null}
        <p className="muted">Category: {product.category}</p>
        {product.subcategory ? <p className="muted">Subcategory: {product.subcategory}</p> : null}
        <p className="detail-description">{product.description}</p>
        <p>Retail: {formatCurrency(product.retailPrice)}</p>
        <p>Wholesale: {formatCurrency(product.wholesalePrice)}</p>
        <p>Minimum wholesale qty: {product.minWholesaleQty}</p>
        <p>Location: {product.location}</p>
        <p>Available quantity: {product.quantity}</p>

        <div className="seller-box">
          <h4>Seller Details</h4>
          <p>Name: {product.seller?.name || "N/A"}</p>
          <p>Email: {product.seller?.email || "N/A"}</p>
          <p>Role: {product.seller?.role || "N/A"}</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
