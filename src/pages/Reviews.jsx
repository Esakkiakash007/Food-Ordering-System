import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, "feedbacks"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(data);
    };

    fetchReviews();
  }, []);

  // 📄 Pagination logic
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Customer Reviews 💬</h2>

      <div style={styles.grid}>
        {currentReviews.map((item) => (
          <div key={item.id} style={styles.card}>
            <h4>{item.name}</h4>
            <p style={styles.email}>{item.email}</p>

            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} size={18} color={star <= item.rating ? "#ff9529" : "#ccc"} />
              ))}
            </div>

            <p style={styles.message}>"{item.message}"</p>

            <p style={styles.date}>
              Submitted on: <span>{item.submittedOn || (item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "")}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 🔁 PAGINATION */}
      <div style={styles.pagination}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} style={styles.pageBtn}>
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} style={styles.pageBtn}>
          Next
        </button>
      </div>

      {/* 🔙 BACK TO HOME */}
      <div style={{ marginTop: "30px" }}>
        <button onClick={() => navigate("/home")} style={styles.backBtn}>
          ⬅ Back to Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "60px 30px",
    background: "#f9f9f9",
    minHeight: "100vh",
    textAlign: "center",
  },
  heading: {
    color: "#ff3c00",
    marginBottom: "40px",
  },

  // ✅ CHANGED TO 3x3 GRID
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
    gap: "25px",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    textAlign: "left",
  },
  email: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px",
  },
  stars: {
    display: "flex",
    gap: "5px",
    marginBottom: "10px",
  },
  message: {
    fontStyle: "italic",
    marginBottom: "12px",
  },
  date: {
    fontSize: "13px",
    color: "#777",
  },
  pagination: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    alignItems: "center",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    background: "#ff6a00",
    color: "#fff",
    cursor: "pointer",
  },
  backBtn: {
    padding: "12px 30px",
    borderRadius: "30px",
    border: "none",
    background: "#ff3c00",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Reviews;
