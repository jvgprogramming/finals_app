// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../../services/ProductService';
import { resolveProductImageUrl } from '../../utils/imageUrl';
import { formatPeso } from '../../utils/currency';
import './catalog.css';

const CatalogPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both categories and products
        const [fetchedCategories, fetchedProducts] = await Promise.all([
          ProductService.getCategories(),
          ProductService.getProducts(),
        ]);

        setCategories(['All', ...fetchedCategories.map(c => c.name)]);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = products.filter((p: any) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === 'All' || p.category?.name === category;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="catalog-page container">
      <header className="catalog-hero">
        <div>
          <h1>Nicai's Pastry</h1>
          <p className="lead">Premium confectionery for your sweetest moments.</p>
        </div>
        <div className="catalog-cta">
          <button
            className="btn-primary"
            onClick={() => {
              localStorage.setItem('pendingCheckout', '1');
              navigate('/');
            }}
          >
            Login to Order
          </button>
        </div>
      </header>

      <section className="catalog-controls">
        <div className="search">
          <input
            placeholder="Search cakes, pastries, breads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="product-grid">
        {loading && (
          <div className="loading-state">
            <p>Loading products...</p>
          </div>
        )}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button 
              className="btn-sm" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
        {!loading && filtered.length === 0 && !error && (
          <div className="empty-state">
            <p>No products found.</p>
          </div>
        )}
        {filtered.map((p) => (
          <article key={p.id} className="product-card">
            <img
              src={resolveProductImageUrl(p.image_url) || '/images/placeholder.png'}
              alt={p.name}
              className="product-thumb"
            />
            <div className="product-body">
              <h3>{p.name}</h3>
              <p className="muted">{p.category?.name}</p>
              <p className="desc">{p.description}</p>
              <div className="product-meta">
                <strong>{formatPeso(p.price)}</strong>
                <button
                  className="btn-sm"
                  onClick={() => {
                    localStorage.setItem('pendingCheckout', '1');
                    navigate('/');
                  }}
                >
                  Order
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default CatalogPage;
