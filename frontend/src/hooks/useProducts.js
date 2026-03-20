import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchProducts,
  fetchProductById,
  addProduct,
  clearSelectedProduct,
  clearError,
} from '../redux/slices/productSlice';

/**
 * Custom hook that wraps the product Redux slice.
 * Components should import this hook instead of using useSelector/useDispatch directly.
 *
 * @returns {{
 *   products: object[],
 *   selectedProduct: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   loadProducts: (filters?: object) => void,
 *   loadProductById: (id: number) => void,
 *   createProduct: (data: object) => Promise,
 *   clearSelected: () => void,
 *   clearProductError: () => void,
 * }}
 */
export function useProducts() {
  const dispatch = useDispatch();
  const { products, selectedProduct, loading, error } = useSelector(
    (state) => state.products
  );

  const loadProducts = useCallback(
    (filters = {}) => dispatch(fetchProducts(filters)),
    [dispatch]
  );

  const loadProductById = useCallback(
    (id) => dispatch(fetchProductById(id)),
    [dispatch]
  );

  const createProduct = useCallback(
    (data) => dispatch(addProduct(data)),
    [dispatch]
  );

  const clearSelected = useCallback(
    () => dispatch(clearSelectedProduct()),
    [dispatch]
  );

  const clearProductError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  return {
    products,
    selectedProduct,
    loading,
    error,
    loadProducts,
    loadProductById,
    createProduct,
    clearSelected,
    clearProductError,
  };
}
