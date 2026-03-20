import React, { useEffect, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

export default function ProductListPage() {
  const { products, loading, error, loadProducts } = useProducts();
  const [safeOnly, setSafeOnly] = useState(false);

  useEffect(() => {
    loadProducts({ safe_only: safeOnly });
  }, [safeOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clean Label Marketplace</h1>
          <p style={styles.subtitle}>
            Every product has been independently audited by AI for ingredient safety.
          </p>
        </div>

        <label style={styles.toggle}>
          <input
            type="checkbox"
            checked={safeOnly}
            onChange={(e) => setSafeOnly(e.target.checked)}
            style={{ marginRight: '8px', width: '16px', height: '16px' }}
          />
          Show safe products only
        </label>
      </div>

      {loading && (
        <p style={styles.status}>Loading products...</p>
      )}

      {error && (
        <p style={{ ...styles.status, color: '#dc2626' }}>
          Error: {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p style={styles.status}>
          {safeOnly
            ? 'No safe products found. Try unchecking the filter.'
            : 'No products yet. Be the first to add one!'}
        </p>
      )}

      <div style={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.95rem',
    margin: 0,
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '8px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
  },
  status: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '48px 0',
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
};
