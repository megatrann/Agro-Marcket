import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import productService from "../services/productService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_OPTIONS } from "../utils/constants";

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts();
        setFeaturedProducts((data.products || []).slice(0, 4));
      } catch (error) {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await addToCart(productId, 1);
  };

  return (
    <div className="home-layout">
      <section className="hero-card">
        <p className="hero-kicker">Agriculture Marketplace</p>
        <h2>Buy fresh produce, seeds, and agri supplies directly from farmers.</h2>
        <p>
          Built for transparent farm-to-market trade with trusted local sellers and
          efficient order management.
        </p>
        <div className="hero-actions">
          <Link to="/products" className="btn btn-primary">
            Explore Marketplace
          </Link>
          <Link to="/register" className="btn btn-outline">
            Become a Seller
          </Link>
        </div>
      </section>

      <section className="page-card">
        <div className="section-head">
          <h3>Categories</h3>
        </div>
        <div className="chip-grid">
          {CATEGORY_OPTIONS.map((category) => (
            <Link key={category} to={`/products?category=${encodeURIComponent(category)}`} className="chip-link">
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="page-card">
        <div className="section-head">
          <h3>Featured Products</h3>
          <Link to="/products" className="text-link">
            View all
          </Link>
        </div>

        {loading ? (
          <Loader label="Fetching featured products..." />
        ) : featuredProducts.length === 0 ? (
          <p>No featured products available yet.</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                disabled={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
