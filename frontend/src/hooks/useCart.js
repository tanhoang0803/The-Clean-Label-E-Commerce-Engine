import { useSelector, useDispatch } from 'react-redux';
import { addItem, removeItem, updateQuantity, clearCart } from '../redux/slices/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    totalItems,
    totalPrice,
    addToCart: (item) => dispatch(addItem(item)),
    removeFromCart: (productId) => dispatch(removeItem(productId)),
    updateQuantity: (productId, quantity) => dispatch(updateQuantity({ product_id: productId, quantity })),
    clearCart: () => dispatch(clearCart()),
  };
}
