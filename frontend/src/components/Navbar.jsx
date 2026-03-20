import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const styles = {
  nav: {
    backgroundColor: '#2d6a4f',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },
  logo: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1.2rem',
    letterSpacing: '0.5px',
  },
  linkGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  link: {
    color: '#d8f3dc',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  button: {
    background: 'transparent',
    border: '1px solid #d8f3dc',
    color: '#d8f3dc',
    padding: '6px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  authForm: {
    position: 'fixed',
    top: '60px',
    right: '24px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    width: '280px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '8px 10px',
    marginBottom: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  submitBtn: {
    width: '100%',
    padding: '9px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.85rem',
    marginBottom: '8px',
  },
  toggleText: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default function Navbar() {
  const { user, isAuthenticated, login, logout, register, loading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogout() {
    logout();
    navigate('/products');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const action = isRegisterMode ? register : login;
    const result = await action({ email, password });
    if (!result.error) {
      setShowAuthPanel(false);
      setEmail('');
      setPassword('');
    }
  }

  function togglePanel() {
    clearAuthError();
    setShowAuthPanel((prev) => !prev);
  }

  return (
    <nav style={styles.nav}>
      <Link to="/products" style={styles.logo}>
        The Clean Label
      </Link>

      <div style={styles.linkGroup}>
        <Link to="/products" style={styles.link}>Browse</Link>

        {isAuthenticated && (
          <>
            <Link to="/products/new" style={styles.link}>Add Product</Link>
            <Link to="/checkout" style={styles.link}>Checkout</Link>
          </>
        )}

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#d8f3dc', fontSize: '0.85rem' }}>
              {user?.email}
            </span>
            <button style={styles.button} onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <button style={styles.button} onClick={togglePanel}>
            {showAuthPanel ? 'Close' : 'Log in'}
          </button>
        )}
      </div>

      {showAuthPanel && !isAuthenticated && (
        <div style={styles.authForm}>
          <h3 style={{ marginBottom: '14px', color: '#111827' }}>
            {isRegisterMode ? 'Create account' : 'Log in'}
          </h3>
          {error && <p style={styles.errorText}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait...' : isRegisterMode ? 'Create account' : 'Log in'}
            </button>
          </form>
          <p
            style={styles.toggleText}
            onClick={() => { setIsRegisterMode((m) => !m); clearAuthError(); }}
          >
            {isRegisterMode ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </p>
        </div>
      )}
    </nav>
  );
}
