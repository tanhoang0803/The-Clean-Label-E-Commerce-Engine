import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import IngredientBadge from '../components/IngredientBadge';
import { formatPrice } from '../services/productService';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProduct, loading, error, loadProductById, clearSelected } = useProducts();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProductById(id);
    return () => clearSelected();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <p style={styles.status}>Loading product...</p>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
        <button style={styles.backBtn} onClick={() => navigate('/products')}>
          Back to products
        </button>
      </div>
    );
  }

  if (!selectedProduct) return null;

  const {
    name, description, price, image_url,
    ingredients, is_safe, ai_reason, ai_checked_at,
  } = selectedProduct;

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/products')}>
        &larr; Back to products
      </button>

      <div style={styles.layout}>
        {/* Image */}
        <div style={styles.imageWrapper}>
          {image_url ? (
            <img src={image_url} alt={name} style={styles.image} />
          ) : (
            <div style={styles.imagePlaceholder}>No image available</div>
          )}
        </div>

        {/* Details */}
        <div style={styles.details}>
          <div style={styles.titleRow}>
            <h1 style={styles.name}>{name}</h1>
            <IngredientBadge isSafe={is_safe} aiReason={ai_reason} />
          </div>

          <p style={styles.price}>{formatPrice(price)}</p>

          {description && <p style={styles.description}>{description}</p>}

          <hr style={styles.divider} />

          {/* AI Audit section */}
          <div style={styles.auditSection}>
            <h3 style={styles.auditTitle}>AI Ingredient Audit</h3>

            <div style={{ ...styles.auditBox, borderColor: is_safe ? '#6ee7b7' : '#fca5a5' }}>
              <div style={styles.auditRow}>
                <span style={styles.auditLabel}>Status:</span>
                <IngredientBadge isSafe={is_safe} aiReason={null} />
              </div>
              {ai_reason && (
                <div style={styles.auditRow}>
                  <span style={styles.auditLabel}>Reason:</span>
                  <span style={styles.auditValue}>{ai_reason}</span>
                </div>
              )}
              {ai_checked_at && (
                <div style={styles.auditRow}>
                  <span style={styles.auditLabel}>Audited:</span>
                  <span style={styles.auditValue}>
                    {new Date(ai_checked_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.ingredientsList}>
              <h4 style={styles.ingredientsTitle}>Full Ingredient List</h4>
              <p style={styles.ingredientsText}>{ingredients}</p>
            </div>
          </div>

          {/* Add to cart — only shown for safe products when authenticated */}
          {is_safe && (
            <button
              style={styles.addToCartBtn}
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please log in to add items to your cart.');
                  return;
                }
                // In a full implementation, this would dispatch to a cartSlice.
                // For this scaffold, navigate to checkout with the item.
                navigate('/checkout', {
                  state: {
                    items: [{ product_id: selectedProduct.id, name, price: Number(price), quantity: 1, image_url }],
                  },
                });
              }}
            >
              Add to cart
            </button>
          )}

          {!is_safe && (
            <p style={styles.unsafeNotice}>
              This product did not pass the clean-label audit and is not available for purchase.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  status: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '48px 0',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#2d6a4f',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0 0 20px 0',
    textDecoration: 'underline',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
  },
  imageWrapper: {},
  image: {
    width: '100%',
    borderRadius: '10px',
    objectFit: 'cover',
    maxHeight: '400px',
  },
  imagePlaceholder: {
    width: '100%',
    height: '300px',
    backgroundColor: '#f3f4f6',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  name: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  price: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#2d6a4f',
    margin: 0,
  },
  description: {
    color: '#4b5563',
    lineHeight: '1.6',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '4px 0',
  },
  auditSection: {},
  auditTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '10px',
  },
  auditBox: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '14px',
    backgroundColor: '#fafafa',
    marginBottom: '14px',
  },
  auditRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
    alignItems: 'flex-start',
  },
  auditLabel: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#374151',
    minWidth: '70px',
  },
  auditValue: {
    fontSize: '0.85rem',
    color: '#4b5563',
    lineHeight: '1.4',
  },
  ingredientsList: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '14px',
  },
  ingredientsTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  ingredientsText: {
    fontSize: '0.8rem',
    color: '#6b7280',
    lineHeight: '1.6',
  },
  addToCartBtn: {
    padding: '12px 24px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '8px',
  },
  unsafeNotice: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
};
