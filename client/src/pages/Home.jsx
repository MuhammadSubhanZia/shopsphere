import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductImage from '../components/common/ProductImage.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { fetchProducts, selectAllProducts, selectProductsStatus } from '../store/slices/productsSlice.js';
import { selectCategories } from '../store/slices/categoriesSlice.js';
import { discountPercent } from '../utils/formatters.js';
import './Home.css';

const HERO_TILES = [
  { name: 'Headphones', icon: 'bi-headphones', tint: 195 },
  { name: 'Handbag', icon: 'bi-handbag', tint: 20 },
  { name: 'Running shoes', icon: 'bi-speedometer2', tint: 8 },
  { name: 'Table lamp', icon: 'bi-lamp', tint: 50 },
];

const PERKS = [
  { icon: 'bi-truck', title: 'Free delivery', text: 'On orders over Rs. 5,000' },
  { icon: 'bi-arrow-repeat', title: 'Easy returns', text: '7-day hassle-free returns' },
  { icon: 'bi-shield-check', title: 'Secure checkout', text: 'Your details stay private' },
  { icon: 'bi-headset', title: 'Friendly support', text: 'Mon – Sat, 9am to 8pm' },
];

/** Shows a spinner / error / grid depending on how the product request is going. */
function ProductSection({ status, products, onRetry }) {
  if (status === 'failed') {
    return (
      <EmptyState icon="bi-wifi-off" title="Could not load products" message="Please check your connection and try again.">
        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={onRetry}>
          Try again
        </button>
      </EmptyState>
    );
  }
  if (status !== 'succeeded') return <Spinner label="Loading products..." />;
  return <ProductGrid products={products} />;
}

export default function Home() {
  useDocumentTitle('');
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);
  const categories = useSelector(selectCategories);

  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 8), [products]);

  const deals = useMemo(
    () =>
      products
        .filter((p) => p.stock > 0 && discountPercent(p.price, p.oldPrice) > 0)
        .sort((a, b) => discountPercent(b.price, b.oldPrice) - discountPercent(a.price, a.oldPrice))
        .slice(0, 4),
    [products]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const retry = () => dispatch(fetchProducts());

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="ss-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 ss-fade-up">
              <span className="ss-eyebrow mb-3">New season, new arrivals</span>
              <h1 className="ss-hero__title">
                Shop smarter.
                <br />
                Live <span className="ss-hero__highlight">better.</span>
              </h1>
              <p className="ss-hero__lead">
                Electronics, fashion, home essentials and more – quality products at fair prices, delivered
                to your door anywhere in Pakistan.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/products" className="btn btn-primary btn-lg rounded-pill px-4">
                  Shop now <i className="bi bi-arrow-right ms-2" />
                </Link>
                <Link to="/products?sort=discount" className="btn btn-outline-dark btn-lg rounded-pill px-4">
                  See hot deals
                </Link>
              </div>
              <p className="ss-hero__code">
                <i className="bi bi-ticket-perforated me-2" />
                Use code <strong>SAVE10</strong> at checkout for 10% off
              </p>
            </div>

            <div className="col-lg-6 d-none d-md-block">
              <div className="ss-hero__visual" aria-hidden="true">
                {HERO_TILES.map((tile) => (
                  <div className="ss-hero__tile" key={tile.name}>
                    <ProductImage product={tile} />
                  </div>
                ))}
                <div className="ss-hero__float ss-hero__float--top">
                  <i className="bi bi-star-fill" /> 4.8 average rating
                </div>
                <div className="ss-hero__float ss-hero__float--bottom">
                  <i className="bi bi-truck" /> Delivery in 2–4 days
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Perks ---------- */}
      <section className="ss-perks">
        <div className="container">
          <div className="row g-3">
            {PERKS.map((perk) => (
              <div className="col-6 col-lg-3" key={perk.title}>
                <div className="ss-perk">
                  <i className={`bi ${perk.icon}`} />
                  <div>
                    <strong>{perk.title}</strong>
                    <span>{perk.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="ss-section">
        <div className="container">
          <div className="ss-section-head">
            <div>
              <span className="ss-eyebrow">Browse</span>
              <h2>Shop by category</h2>
            </div>
          </div>
          <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3">
            {categories.map((category) => (
              <div className="col" key={category.id}>
                <Link
                  to={`/products?category=${category.slug}`}
                  className="ss-category-tile"
                  style={{ '--tint': category.tint }}
                >
                  <span className="ss-category-tile__icon">
                    <i className={`bi ${category.icon}`} />
                  </span>
                  <strong>{category.name}</strong>
                  <small>{categoryCounts[category.slug] || 0} products</small>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured ---------- */}
      <section className="ss-section pt-0">
        <div className="container">
          <div className="ss-section-head">
            <div>
              <span className="ss-eyebrow">Hand-picked</span>
              <h2>Featured products</h2>
            </div>
            <Link to="/products" className="ss-link-arrow">
              View all <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <ProductSection status={status} products={featured} onRetry={retry} />
        </div>
      </section>

      {/* ---------- Deals ---------- */}
      {deals.length > 0 && (
        <section className="ss-section ss-deals">
          <div className="container">
            <div className="ss-section-head">
              <div>
                <span className="ss-eyebrow">Limited time</span>
                <h2>Hot deals</h2>
              </div>
              <Link to="/products?sort=discount" className="ss-link-arrow">
                More deals <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <ProductGrid products={deals} />
          </div>
        </section>
      )}

      {/* ---------- Call to action ---------- */}
      <section className="ss-section pb-0">
        <div className="container">
          <div className="ss-cta">
            <div>
              <h2>Join ShopSphere today</h2>
              <p>
                Create a free account to save your wishlist, track orders and check out faster. New here? Use
                code <strong>WELCOME200</strong> for Rs. 200 off.
              </p>
            </div>
            <Link to="/register" className="btn btn-light btn-lg rounded-pill px-4">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
