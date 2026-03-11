import React from "react";
import { useCart } from "../context/CartContext";
import { auth, db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const placeOrder = async () => {
    await addDoc(collection(db, "orders"), {
      userId: auth.currentUser.uid,
      items: cartItems,
      status: "Pending",
      createdAt: Timestamp.now(),
    });

    clearCart();
    alert("Order placed successfully!");
    navigate("/home");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Confirm Order</h2>

      <button
        onClick={placeOrder}
        style={{
          padding: "12px 40px",
          background: "#e24a0b",
          color: "#fff",
          border: "none",
          borderRadius: "25px",
        }}
      >
        Confirm & Place Order
      </button>
    </div>
  );
};

export default Checkout;
