// src/pages/AdminDashboard.jsx

import React, { useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const getCardStyle = (key) => ({
    ...styles.sideCard,
    opacity: hovered === key ? 1 : 0.9,
    transform: hovered === key ? "translateY(-6px) scale(1.02)" : "translateY(0)",
    boxShadow: hovered === key ? "0 18px 40px rgba(0,0,0,0.18)" : "0 10px 25px rgba(0,0,0,0.12)",
  });

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage your food app 🍔</p>
        </div>

        <div style={styles.headerBtns}>
          <button style={styles.outlineBtn} onClick={() => navigate("/admin-orders")}>
            View Orders
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* LEFT SIDE VERTICAL CARDS */}
        <div style={styles.sidebar}>
          <div style={getCardStyle("category")} onClick={() => navigate("/add-category")} onMouseEnter={() => setHovered("category")} onMouseLeave={() => setHovered(null)}>
            <h3>Add Category</h3>
            <p>Create & manage categories</p>
          </div>

          <div style={getCardStyle("food")} onClick={() => navigate("/add-food")} onMouseEnter={() => setHovered("food")} onMouseLeave={() => setHovered(null)}>
            <h3>Add Food</h3>
            <p>Add food items to menu</p>
          </div>

          {/* ✅ NEW CARD : ADD RESTAURANT */}
          <div style={getCardStyle("restaurant")} onClick={() => navigate("/add-restaurant")} onMouseEnter={() => setHovered("restaurant")} onMouseLeave={() => setHovered(null)}>
            <h3>Add Restaurant</h3>
            <p>Add restaurants by location</p>
          </div>
          <div style={getCardStyle("restaurantMenu")} onClick={() => navigate("/set-restaurant-menu")} onMouseEnter={() => setHovered("restaurantMenu")} onMouseLeave={() => setHovered(null)}>
            <h3>Set Menu For Restaurants</h3>
            <p>Assign foods to restaurants</p>
          </div>
          {/* VIEW FEEDBACK */}
          <div style={getCardStyle("feedback")} onClick={() => navigate("/view-feedback")} onMouseEnter={() => setHovered("feedback")} onMouseLeave={() => setHovered(null)}>
            <h3>View Users Feedback</h3>
            <p>Manage user reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7f9",
    fontFamily: "Poppins, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "35px 50px",
    background: "linear-gradient(135deg,#ff6a00,#ff3d00)",
    color: "#fff",
    borderBottomLeftRadius: "30px",
    borderBottomRightRadius: "30px",
  },

  title: {
    fontSize: "34px",
    marginBottom: "6px",
  },

  subtitle: {
    opacity: 0.9,
  },

  headerBtns: {
    display: "flex",
    gap: "15px",
  },

  outlineBtn: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "2px solid #fff",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  logoutBtn: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    background: "#fff",
    color: "#ff3d00",
    cursor: "pointer",
    fontWeight: 600,
  },

  main: {
    display: "flex",
    gap: "30px",
    padding: "40px 50px",
  },

  sidebar: {
    width: "100%",
    display: "flex",
    gap: "20px",
  },

  sideCard: {
    padding: "25px",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.35s ease",
    background: "#fff",
  },

  formArea: {
    flex: 1,
  },
};

export default AdminDashboard;
