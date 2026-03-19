import { createContext, useContext, useEffect, useMemo, useState } from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const data = await cartService.getCart();
      setItems(data.items || []);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    const data = await cartService.addToCart({ productId, quantity });
    await refreshCart();
    return data;
  };

  const updateItem = async (id, quantity) => {
    const data = await cartService.updateCartItem(id, quantity);
    await refreshCart();
    return data;
  };

  const removeItem = async (id) => {
    const data = await cartService.removeCartItem(id);
    await refreshCart();
    return data;
  };

  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.product?.retailPrice || 0),
    0
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      totalItems,
      totalPrice,
      refreshCart,
      addToCart,
      updateItem,
      removeItem,
    }),
    [items, loading, totalItems, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
