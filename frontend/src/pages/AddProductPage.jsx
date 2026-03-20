import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import IngredientBadge from '../components/IngredientBadge';
import { formatPrice } from '../services/productService';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { createProduct, loading, error } = useProducts();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    ingredients: '',
  });

  // After successful submission, the AI audit result is shown here
  const [auditResult, setAuditResult] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAuditResult(null);

    const result = await createProduct({
      ...formData,
      price: parseFloat(formData.price),
    });

    if (result.payload && !result.error) {
      setAuditResult(result.payload);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Submit a Product</h1>
      <p style={styles.subtitle}>
        Fill in the product details and ingredient list. Our AI will immediately audit
        the ingredients and flag any clean-label violations.
      </p>

      <div style={{ ...styles.layout, gridTemplateColumns: auditResult ? '1fr 1fr' : '1fr' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="name">Product name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g. Organic Face Wash"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="Short product description"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="price">Price (USD) *</label>
            <input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              style={styles.input}
              placeholder="19.99"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="image_url">Image URL</label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              style={styles.input}
              placeholder="https://example.com/product.jpg"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="ingredients">
              Ingredient list *{' '}
              <span style={styles.labelHint}>(comma-separated or as printed on label)</span>
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              style={{ ...styles.input, height: '120px', resize: 'vertical', fontFamily: 'monospace' }}
              placeholder="Water, Aloe Vera, Glycerin, Citric Acid, Methylparaben..."
              required
            />
          </div>

          {error && (
            <p style={styles.errorText}>{error}</p>
          )}

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate('/products')}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Running AI audit...' : 'Submit & Audit'}
            </button>
          </div>
        </form>

        {/* Audit Result Panel */}
        {auditResult && (
          <div style={styles.resultPanel}>
            <h2 style={styles.resultTitle}>AI Audit Result</h2>

            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Product:</span>
              <span style={styles.resultValue}>{auditResult.name}</span>
            </div>

            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Price:</span>
              <span style={styles.resultValue}>{formatPrice(auditResult.price)}</span>
            </div>

            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Status:</span>
              <IngredientBadge isSafe={auditResult.is_safe} aiReason={auditResult.ai_reason} />
            </div>

            <div style={styles.reasonBox}>
              <p style={styles.reasonLabel}>AI Reasoning:</p>
              <p style={styles.reasonText}>{auditResult.ai_reason}</p>
            </div>

            {auditResult.flagged_ingredients && auditResult.flagged_ingredients.length > 0 && (
              <div style={styles.flaggedBox}>
                <p style={styles.flaggedLabel}>Flagged ingredients:</p>
                <ul style={styles.flaggedList}>
                  {auditResult.flagged_ingredients.map((ing, i) => (
                    <li key={i} style={styles.flaggedItem}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            {auditResult.is_safe ? (
              <p style={styles.successNote}>
                This product passed the audit and is now publicly listed.
              </p>
            ) : (
              <p style={styles.failNote}>
                This product failed the audit. It is saved but will not appear in the public listing until the ingredient issues are resolved.
              </p>
            )}

            <button
              style={styles.viewProductBtn}
              onClick={() => navigate(`/products/${auditResult.id}`)}
            >
              View product page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  layout: {
    display: 'grid',
    gap: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  labelHint: {
    fontWeight: '400',
    color: '#9ca3af',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.875rem',
    backgroundColor: '#fee2e2',
    padding: '10px 14px',
    borderRadius: '6px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151',
  },
  submitBtn: {
    padding: '10px 24px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  resultPanel: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '24px',
    alignSelf: 'flex-start',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  resultTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '16px',
  },
  resultRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  resultLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    minWidth: '70px',
  },
  resultValue: {
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  reasonBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    marginTop: '12px',
    marginBottom: '12px',
  },
  reasonLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px',
  },
  reasonText: {
    fontSize: '0.85rem',
    color: '#4b5563',
    lineHeight: '1.5',
  },
  flaggedBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px',
  },
  flaggedLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: '6px',
  },
  flaggedList: {
    paddingLeft: '16px',
    margin: 0,
  },
  flaggedItem: {
    fontSize: '0.85rem',
    color: '#7f1d1d',
    marginBottom: '2px',
  },
  successNote: {
    fontSize: '0.85rem',
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '14px',
  },
  failNote: {
    fontSize: '0.85rem',
    color: '#92400e',
    backgroundColor: '#fef3c7',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '14px',
  },
  viewProductBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
};
