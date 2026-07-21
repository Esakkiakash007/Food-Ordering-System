// src/pages/ViewFeedback.jsx

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 5;

  const fetchFeedbacks = async () => {
    const snap = await getDocs(collection(db, "feedbacks"));

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setFeedbacks(list);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this feedback?");
    if (!confirm) return;

    await deleteDoc(doc(db, "feedbacks", id));
    fetchFeedbacks();
  };

  // Pagination logic
  const totalPages = Math.ceil(feedbacks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFeedbacks = feedbacks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div style={{ padding: "40px", fontFamily: "Poppins, sans-serif" }}>
      <button
        onClick={() => navigate("/admin")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          borderRadius: "20px",
          border: "none",
          background: "transparent",
          color: "#fc8019",
          cursor: "pointer",
          border: "2px solid #fc8019",
        }}
      >
        ← Back to Dashboard
      </button>

      <h2 style={{ color: "#fc8019", marginBottom: "10px" }}>Users Feedback 💬</h2>

      {/* TOTAL COUNT */}
      <p style={{ marginBottom: "20px", color: "#555" }}>
        Total Feedbacks: <b>{feedbacks.length}</b>
      </p>

      {currentFeedbacks.length === 0 && <p>No feedback found</p>}

      {currentFeedbacks.map((fb) => (
        <div
          key={fb.id}
          style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h4 style={{ margin: 0 }}>{fb.name || "User"}</h4>
            <p style={{ margin: "6px 0", color: "#444" }}>{fb.message || fb.feedback}</p>
            <small style={{ color: "#777" }}>{fb.createdAt?.toDate().toLocaleString()}</small>
          </div>

          <button
            onClick={() => handleDelete(fb.id)}
            style={{
              background: "red",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}

      {/* PAGINATION BUTTONS */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          <button style={{ background: "#fc8019", color: "white", borderRadius: "6px", border: "none", padding: "6px 12px", cursor: "pointer" }} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Prev
          </button>

          <span style={{ alignSelf: "center" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button style={{ background: "#fc8019", color: "white", borderRadius: "6px", border: "none", padding: "6px 12px", cursor: "pointer" }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const pageBtnStyle = {
  padding: "8px 16px",
  borderRadius: "20px",
  border: "none",
  background: "#fc8019",
  color: "#fff",
  cursor: "pointer",
};

export default ViewFeedback;
