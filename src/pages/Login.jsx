import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        alert("Login Successful!");

        if (userData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        alert("User data not found. Contact admin.");
      }
    } catch (err) {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT UX SECTION */}
      <div style={styles.left}>
        <h1 style={styles.brand}>Foodify 🍔</h1>
        <p style={styles.tagline}>
          Fresh food. <br /> Fast delivery. <br /> Happy moments.
        </p>
      </div>

      {/* RIGHT LOGIN CARD */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Login</h2>
          <p style={styles.subText}>Continue to your food journey</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />

            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />

            <button type="submit" style={styles.button}>
              Login
            </button>
          </form>

          <p style={styles.footer}>
            New here?{" "}
            <Link to="/register" style={styles.link}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    fontFamily: "'Poppins', sans-serif",
  },

  /* LEFT */
  left: {
    background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    padding: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    animation: "fadeSlide 1s ease",
  },
  brand: {
    fontSize: "52px",
    fontWeight: 700,
    marginBottom: "20px",
  },
  tagline: {
    fontSize: "22px",
    lineHeight: "1.6",
    opacity: 0.95,
  },

  /* RIGHT */
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff7f0",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "40px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
    animation: "fadeUp 0.8s ease",
  },
  heading: {
    fontSize: "30px",
    fontWeight: 600,
    color: "#222",
  },
  subText: {
    color: "#777",
    fontSize: "14px",
    marginBottom: "25px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    height: "50px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    transition: "0.3s",
  },
  button: {
    marginTop: "10px",
    height: "52px",
    background: "linear-gradient(135deg,#ff6a00,#ff3c00)",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.3s",
  },
  footer: {
    marginTop: "25px",
    fontSize: "14px",
    textAlign: "center",
    color: "#555",
  },
  link: {
    color: "#ff3c00",
    fontWeight: 600,
    textDecoration: "none",
  },
};

export default Login;
