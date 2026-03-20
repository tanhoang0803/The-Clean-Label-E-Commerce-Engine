import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  loginUser,
  logoutUser,
  registerUser,
  clearError,
} from '../redux/slices/userSlice';

/**
 * Custom hook that wraps the user/auth Redux slice.
 * Components should import this hook instead of using useSelector/useDispatch directly.
 *
 * @returns {{
 *   user: object|null,
 *   token: string|null,
 *   loading: boolean,
 *   error: string|null,
 *   isAuthenticated: boolean,
 *   login: (credentials: { email, password }) => Promise,
 *   logout: () => void,
 *   register: (credentials: { email, password }) => Promise,
 *   clearAuthError: () => void,
 * }}
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.user);

  const login = useCallback(
    (credentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  const logout = useCallback(
    () => dispatch(logoutUser()),
    [dispatch]
  );

  const register = useCallback(
    (credentials) => dispatch(registerUser(credentials)),
    [dispatch]
  );

  const clearAuthError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login,
    logout,
    register,
    clearAuthError,
  };
}
