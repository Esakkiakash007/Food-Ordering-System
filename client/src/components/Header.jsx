import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Header = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { cartItems } = useCart();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header
      style={{
        padding: "15px 40px",
        background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "static",
        top: 0,
        zIndex: 1000,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* LEFT - LOGO + GREETING */}
      <div>
        <h2 style={{ margin: 0, color: "#e24a0b" }}>🍴 FoodZone</h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#444" }}>
          Hi <b>{userName}</b>, Welcome 👋
        </p>
      </div>

      {/* CENTER - NAV LINKS */}
      <nav
        style={{
          display: "flex",
          gap: "30px",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        <a style={linkStyle} href="#home">
          Home
        </a>
        <a style={linkStyle} href="#about">
          About Us
        </a>
        <a style={linkStyle} href="#feedback">
          Feedback
        </a>
        <a style={linkStyle} href="/reviews">
          Reviews
        </a>
      </nav>

      {/* RIGHT - CART + LOGOUT */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <button
          onClick={handleLogout}
          style={{
            background: "#e24a0b",
            color: "#fff",
            border: "none",
            padding: "10px 26px",
            borderRadius: "25px",
            cursor: "pointer",
            fontSize: "15px",
            boxShadow: "0 6px 15px rgba(226,74,11,0.4)",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

const linkStyle = {
  textDecoration: "none",
  color: "#333",
  position: "relative",
};

export default Header;
