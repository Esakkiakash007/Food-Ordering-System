import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // 1️⃣ Create Auth User
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ Set display name
      await updateProfile(userCred.user, {
        displayName: name,
      });

      // 3️⃣ Store user in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role: "user",
        createdAt: Timestamp.now(),
      });

      alert("Registration Successful! Please login 🚀");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT */}
      <div style={styles.left}>
        <h1 style={styles.brand}>Foodify 🍕</h1>
        <p style={styles.tagline}>
          Join us today. <br />
          Taste happiness. <br />
          Delivered fresh.
        </p>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.subText}>Let’s get you started 🚀</p>

          <form onSubmit={handleRegister} style={styles.form}>
            <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />

            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />

            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? <span style={styles.loader}></span> : "Register"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login
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
  left: {
    background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1499028344343-cd173ffc68a9')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    padding: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brand: { fontSize: "52px", fontWeight: 700 },
  tagline: { fontSize: "22px", lineHeight: "1.6" },

  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff7f0",
  },
  card: {
    width: "420px",
    padding: "40px",
    borderRadius: "20px",
    background: "#fff",
    boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
    animation: "fadeUp 0.6s ease",
  },
  heading: { fontSize: "30px" },
  subText: { color: "#777", marginBottom: "25px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  input: {
    height: "50px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },
  button: {
    height: "52px",
    background: "linear-gradient(135deg,#ff6a00,#ff3c00)",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: "10px",
  },
  loader: {
    width: "22px",
    height: "22px",
    border: "3px solid #fff",
    borderTop: "3px solid transparent",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  footer: { marginTop: "25px", textAlign: "center" },
  link: { color: "#ff3c00", fontWeight: 600 },
};

export default Register;
