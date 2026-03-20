import React from 'react';
import { Link } from 'react-router-dom';
import IngredientBadge from './IngredientBadge';
import { formatPrice, excerptIngredients } from '../services/productService';

/**
 * ProductCard — presentational component for displaying a product summary.
 * All data comes via props; no Redux or API calls here.
 *
 * Props:
 *   product {object} — product record from the API
 */
export default function ProductCard({ product }) {
  const {
    id,
    name,
    description,
    price,
    image_url,
    ingredients,
    is_safe,
    ai_reason,
  } = product;

  return (
    <div style={styles.card}>
      {image_url ? (
        <img src={image_url} alt={name} style={styles.image} />
      ) : (
        <div style={styles.imagePlaceholder}>
          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No image</span>
        </div>
      )}

      <div style={styles.body}>
        <div style={styles.header}>
          <h3 style={styles.name}>{name}</h3>
          <IngredientBadge isSafe={is_safe} aiReason={ai_reason} />
        </div>

        {description && (
          <p style={styles.description}>{description}</p>
        )}

        <p style={styles.ingredients}>
          <strong>Ingredients: </strong>
          {excerptIngredients(ingredients)}
        </p>

        <div style={styles.footer}>
          <span style={styles.price}>{formatPrice(price)}</span>
          <Link to={`/products/${id}`} style={styles.detailLink}>
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '180px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  },
  name: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    flex: 1,
  },
  description: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4',
  },
  ingredients: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    margin: 0,
    lineHeight: '1.4',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '8px',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#2d6a4f',
  },
  detailLink: {
    color: '#2d6a4f',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderBottom: '1px solid #2d6a4f',
  },
};
