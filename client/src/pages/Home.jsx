// src/pages/Home.jsx
import Header from "../components/Header";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaTimes, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaPhoneAlt, FaEnvelope, FaStar } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import Feedback from "../components/Feedback";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(list);
    };
    fetchCategories();
  }, []);

  const handleClose = () => {
    setModalOpen(false);
    setSelectedCategory("");
  };

  return (
    <>
      <Header />
      <div style={{ fontFamily: "'Poppins', sans-serif", scrollBehavior: "smooth" }}>
        {/* HERO */}
        <section
          id="home"
          style={{
            minHeight: "100vh",
            backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://img.freepik.com/premium-photo/salsa-sauce-ingredients-latin-american-mexican-traditional-sauce-top-view-black-background-free-space-text_187166-35043.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: "700px" }}>
            <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>Delicious Food, Delivered Fast 🍽️</h1>
            <p style={{ fontSize: "18px", lineHeight: "1.8", marginBottom: "35px" }}>Welcome to Food Zone – where taste meets convenience and every bite brings happiness.</p>
            <button
              onClick={() => navigate("/location")}
              style={{
                background: "#e24a0b",
                color: "#fff",
                border: "none",
                padding: "14px 40px",
                borderRadius: "30px",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Explore Menu
            </button>
          </div>
        </section>

        {/* ABOUT US */}
        <section id="about" style={{ padding: "80px 40px", background: "#fff" }}>
          <h2 style={{ textAlign: "center", fontSize: "36px", marginBottom: "50px" }}>About Us</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "center",
              gap: "50px",
              maxWidth: "1100px",
              margin: "auto",
            }}
          >
            {/* LEFT */}
            <div>
              <p style={{ fontSize: "17px", lineHeight: "1.9", color: "#555" }}>
                At <b>Food Zone</b>, we believe food is more than just a meal – it’s an experience. From spicy street-style favorites to creamy desserts and refreshing beverages, we bring together the best flavors from your favorite restaurants and deliver them straight to your doorstep.
                <br />
                <br />
                Our mission is simple: <b>fast delivery, fresh ingredients, and unforgettable taste.</b> Whether you’re craving comfort food, snacks, or a full-course meal, Food Zone ensures quality, hygiene, and satisfaction every single time.
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div>
              <img
                src="https://img.freepik.com/free-photo/group-friends-eating-restaurant_23-2148006645.jpg"
                alt="About Food Zone"
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          </div>

          {/* CUSTOMER REVIEWS */}
          <div style={{ marginTop: "100px" }}>
            <h2 style={{ textAlign: "center", fontSize: "32px", marginBottom: "50px" }}>What Our Customers Says</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "30px",
                maxWidth: "1100px",
                margin: "auto",
              }}
            >
              {[
                {
                  name: "Shan",
                  msg: "The food offered on this website looks fresh, delicious, and well presented. The variety of food items available caters to different tastes and preferences.",
                },
                {
                  name: "Nuhman",
                  msg: "The food served through this website is tasty and prepared with good quality ingredients. There is a wide variety of options to suit both vegetarian and non-vegetarian customers.",
                },
                {
                  name: "Akash",
                  msg: "Best food ordering experience ever. Smooth process and great restaurant options.",
                },
              ].map((review, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f4f6f8",
                    padding: "25px",
                    borderRadius: "18px",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
                    textAlign: "center",
                  }}
                >
                  <h4 style={{ marginBottom: "10px" }}>{review.name}</h4>
                  <div style={{ color: "#ffb400", marginBottom: "10px" }}>
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <p style={{ fontSize: "14px", color: "#555" }}>{review.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEEDBACK */}
        <section id="feedback" style={{ padding: "70px 20px" }}>
          <Feedback />
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#1c1c1c", color: "#fff", padding: "50px 30px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "30px",
              maxWidth: "1100px",
              margin: "auto",
            }}
          >
            <div>
              <h3 style={{ color: "#e24a0b" }}>Food Zone</h3>
              <p style={{ color: "#ccc" }}>Fresh & tasty food delivered at your doorstep.</p>
            </div>

            <div>
              <h4>Contact</h4>
              <p>
                <FaPhoneAlt /> +91 98765 43210
              </p>
              <p>
                <FaEnvelope /> foodorderingsystem93@gmail.com
              </p>
            </div>

            <div>
              <h4>Follow Us</h4>
              <div style={{ display: "flex", gap: "15px", fontSize: "20px", marginTop: "10px" }}>
                <FaFacebook />
                <FaInstagram />
                <FaTwitter />
                <FaLinkedin />
              </div>
            </div>
          </div>
        </footer>

        {/* MODAL */}
        {modalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "35px",
                borderRadius: "18px",
                width: "90%",
                maxWidth: "600px",
                position: "relative",
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "transparent",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#ff3c00",
                }}
              >
                <FaTimes />
              </button>

              <h2 style={{ textAlign: "center", color: "#ff3c00" }}>{selectedCategory}</h2>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
