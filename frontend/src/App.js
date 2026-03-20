import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from './redux/slices/userSlice';

import Navbar from './components/Navbar';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddProductPage from './pages/AddProductPage';
import CheckoutPage from './pages/CheckoutPage';

/**
 * ProtectedRoute — redirects to /login if no token is present.
 * For this project, we redirect to the product list page which shows a login prompt.
 */
function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.user.token);
  if (!token) {
    return <Navigate to="/products" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();

  // Rehydrate auth state from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        dispatch(setCredentials({ user, token }));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <Routes>
          {/* Default — redirect root to products list */}
          <Route path="/" element={<Navigate to="/products" replace />} />

          {/* Public routes */}
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* Protected routes — requires JWT */}
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Stripe redirects here after payment */}
          <Route
            path="/checkout/success"
            element={
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <h2 style={{ color: '#2d6a4f', marginBottom: '12px' }}>Payment successful!</h2>
                <p>Your order has been placed. You will receive a confirmation shortly.</p>
              </div>
            }
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <h2>404 — Page not found</h2>
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
