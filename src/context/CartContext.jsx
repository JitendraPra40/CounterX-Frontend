import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(menuItem) {
    setItems((current) => {
      const existing = current.find((item) => item.id === menuItem.id);
      if (existing) {
        return current.map((item) => (item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...menuItem, quantity: 1 }];
    });
  }

  function updateQuantity(id, quantity) {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.id !== id);
      }
      return current.map((item) => (item.id === id ? { ...item, quantity } : item));
    });
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ items, total, count, addItem, updateQuantity, clearCart }), [items, total, count]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
