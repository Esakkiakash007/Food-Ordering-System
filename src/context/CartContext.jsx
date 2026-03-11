import React, { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Load cart when user changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);

      if (user) {
        const savedCart = localStorage.getItem(`cart_${user.uid}`);
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      } else {
        setCartItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Save cart whenever cartItems changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`cart_${currentUser.uid}`, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser]);

  const addToCart = (food) => {
    const existing = cartItems.find((item) => item.id === food.id);

    if (existing) {
      setCartItems(cartItems.map((item) => (item.id === food.id ? { ...item, qty: item.qty + 1 } : item)));
    } else {
      setCartItems([...cartItems, { ...food, qty: 1 }]);
    }

    alert(`${food.foodName} added to your cart 🛒`);
  };

  const increaseQty = (id) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
  };

  const decreaseQty = (id) => {
    setCartItems(cartItems.map((item) => (item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item)));
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    if (currentUser) {
      localStorage.removeItem(`cart_${currentUser.uid}`);
    }
  };

  // ✅ PLACE ORDER FUNCTION (unchanged logic)
  const placeOrder = async () => {
    const user = auth.currentUser;
    if (!user || cartItems.length === 0) return;

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      userName: user.displayName || "User",
      date: Timestamp.now(),
      items: cartItems,
      totalAmount,
    });

    clearCart();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
