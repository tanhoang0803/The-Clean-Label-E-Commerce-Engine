import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatPrice, calculateCartTotal } from '../services/productService';
import apiClient from '../api/apiClient';

// Stripe promise is instantiated once at module level (not inside the component)
// eslint-disable-next-line no-unused-vars
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = calculateCartTotal(items);

  async function handleCheckout() {
    if (!isAuthenticated) {
      setError('You must be logged in to complete a purchase.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/orders/checkout', { items });
      const { url } = response.data.data;

      // Clear cart then redirect to Stripe-hosted checkout page
      clearCart();
      window.location.href = url;
    } catch (err) {
      const message = err.response?.data?.error || 'Checkout failed. Please try again.';
      setError(message);
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <h2 style={{ marginBottom: '12px' }}>Your cart is empty</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Browse products and add items to your cart.
        </p>
        <button style={styles.browseBtn} onClick={() => navigate('/products')}>
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Order Summary</h1>

      <div style={styles.card}>
        {items.map((item, index) => (
          <div key={index} style={styles.item}>
            <div style={styles.itemInfo}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={styles.itemImage} />
              )}
              <div>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemQty}>Qty: {item.quantity}</p>
              </div>
            </div>
            <p style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}

        <div style={styles.divider} />

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total</span>
          <span style={styles.totalAmount}>{formatPrice(total)}</span>
        </div>
      </div>

      {error && (
        <p style={styles.errorText}>{error}</p>
      )}

      <div style={styles.notice}>
        <p>
          You will be redirected to Stripe's secure checkout page to complete your payment.
          Your card information is never stored on our servers.
        </p>
      </div>

      <div style={styles.buttonRow}>
        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Back
        </button>
        <button
          style={styles.checkoutBtn}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Redirecting to Stripe...' : `Pay ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '560px',
    margin: '0 auto',
  },
  empty: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  itemImage: {
    width: '52px',
    height: '52px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  itemName: {
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  itemQty: {
    color: '#6b7280',
    fontSize: '0.85rem',
    margin: 0,
  },
  itemPrice: {
    fontWeight: '700',
    color: '#2d6a4f',
    margin: 0,
  },
  divider: {
    borderTop: '1px solid #e5e7eb',
    margin: '16px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
  },
  totalAmount: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#2d6a4f',
  },
  errorText: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    marginBottom: '16px',
  },
  notice: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#166534',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  backBtn: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#374151',
  },
  checkoutBtn: {
    padding: '12px 28px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '700',
  },
  browseBtn: {
    padding: '12px 24px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
};
