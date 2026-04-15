import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

 const addToCart = async (productId) => {
  const res = await cartService.addToCart({
    product_id: productId,
    quantity: 1,
  });

  
  setCart(res.data);  
};

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartService.updateCartItem({ item_id: itemId, quantity });
      await fetchCart();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart({ item_id: itemId });
      await fetchCart();
    } catch (err) {
      console.error("Failed to remove from cart", err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
