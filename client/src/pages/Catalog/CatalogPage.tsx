import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DEFAULT_PRODUCTS from '../../data/products';
import './catalog.css';

const CatalogPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();

  const categories = Array.from(
    new Set(['All', ...DEFAULT_PRODUCTS.map((p) => p.category)]),
  );

  const filtered = DEFAULT_PRODUCTS.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === 'All' || p.category === category;
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
        {filtered.map((p) => (
          <article key={p.id} className="product-card">
            <img src={p.image} alt={p.name} className="product-thumb" />
            <div className="product-body">
              <h3>{p.name}</h3>
              <p className="muted">{p.category}</p>
              <p className="desc">{p.description}</p>
              <div className="product-meta">
                <strong>₱{p.price.toLocaleString()}</strong>
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
