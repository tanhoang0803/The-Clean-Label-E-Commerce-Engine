import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../services/productService';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <h2 style={{ marginBottom: '12px' }}>Your basket is empty</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Browse products and add items to your basket.
        </p>
        <button style={styles.primaryBtn} onClick={() => navigate('/products')}>
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Your Basket
        <span style={styles.count}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </h1>

      <div style={styles.layout}>
        {/* Item list */}
        <div style={styles.itemList}>
          {items.map((item) => (
            <div key={item.product_id} style={styles.itemCard}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={styles.itemImage} />
              )}

              <div style={styles.itemDetails}>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemUnitPrice}>{formatPrice(item.price)} each</p>
              </div>

              <div style={styles.itemRight}>
                {/* Quantity controls */}
                <div style={styles.qtyRow}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span style={styles.qtyValue}>{item.quantity}</span>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</p>

                <button
                  style={styles.removeBtn}
                  onClick={() => removeFromCart(item.product_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary panel */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Order summary</h2>

          <div style={styles.summaryRow}>
            <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Shipping</span>
            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Calculated at checkout</span>
          </div>

          <div style={styles.divider} />

          <div style={{ ...styles.summaryRow, fontWeight: '700', fontSize: '1.1rem' }}>
            <span>Total</span>
            <span style={{ color: '#2d6a4f' }}>{formatPrice(totalPrice)}</span>
          </div>

          <button
            style={styles.primaryBtn}
            onClick={() => navigate('/checkout')}
          >
            Proceed to checkout
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate('/products')}
          >
            Continue shopping
          </button>
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
  empty: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  count: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#6b7280',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '24px',
    alignItems: 'start',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '16px',
  },
  itemImage: {
    width: '72px',
    height: '72px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
    fontSize: '0.95rem',
  },
  itemUnitPrice: {
    color: '#6b7280',
    fontSize: '0.85rem',
    margin: 0,
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  qtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '4px 8px',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    color: '#374151',
    padding: '0 4px',
    lineHeight: 1,
  },
  qtyValue: {
    minWidth: '20px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  itemTotal: {
    fontWeight: '700',
    color: '#2d6a4f',
    margin: 0,
    fontSize: '0.95rem',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: 0,
    textDecoration: 'underline',
  },
  summary: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.95rem',
    color: '#374151',
  },
  divider: {
    borderTop: '1px solid #e5e7eb',
    margin: '4px 0',
  },
  primaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '4px',
  },
  secondaryBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#2d6a4f',
    border: '1px solid #2d6a4f',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};
