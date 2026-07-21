import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaStar } from "react-icons/fa";

const Feedback = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const starsText = "⭐".repeat(rating);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!user) {
      alert("Please login to submit feedback");
      return;
    }

    if (!rating) {
      alert("Please select rating");
      return;
    }

    if (!message.trim()) {
      alert("Please write feedback");
      return;
    }

    try {
      setLoading(true);

      const submittedOn = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      await addDoc(collection(db, "feedbacks"), {
        name: user.displayName || "User",
        email: user.email,
        message,
        rating,
        submittedOn,
        createdAt: serverTimestamp(),
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/send-feedback-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.displayName || "User",
          email: user.email,
          message,
          rating,
          stars: starsText,
          submittedOn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Mail API error:", data);
        alert("Mail sending failed ❌");
        return;
      }

      alert("✅ Thanks for your feedback! Mail sent successfully.");
      setMessage("");
      setRating(0);
    } catch (err) {
      console.error("Feedback submit error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Your Feedback Matters 💬</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" value={user?.displayName || ""} readOnly style={styles.readonly} />

          <input type="email" value={user?.email || ""} readOnly style={styles.readonly} />

          <textarea placeholder="Write your feedback" value={message} onChange={(e) => setMessage(e.target.value)} style={styles.textarea} />

          <div>
            <p style={{ fontWeight: 600 }}>Rating</p>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} size={28} style={{ cursor: "pointer" }} color={(hover || rating) >= star ? "#ff9529" : "#ccc"} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => setRating(star)} />
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "60px 20px",
    background: "#f9f9f9",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#fff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
  },
  heading: {
    textAlign: "center",
    color: "#ff3c00",
    marginBottom: "25px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  readonly: {
    height: "48px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    padding: "0 15px",
    background: "#f2f2f2",
  },
  textarea: {
    minHeight: "120px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "12px 15px",
  },
  stars: {
    display: "flex",
    gap: "10px",
  },
  button: {
    marginTop: "10px",
    height: "50px",
    borderRadius: "30px",
    background: "#ff6a00",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
  },
};

export default Feedback;
