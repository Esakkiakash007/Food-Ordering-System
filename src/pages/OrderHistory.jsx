import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const itemsPerPage = 5;

  const fetchOrders = async () => {
    const user = auth.currentUser;

    const q = query(collection(db, "orders"), where("authUid", "==", user.uid));
    const snap = await getDocs(q);

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // ✅ Sort in JS (no Firestore orderBy → no index error)
    const sorted = list.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });

    setOrders(sorted);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    let dateMatch = true;
    let statusMatch = true;

    if (selectedDate && o.createdAt) {
      dateMatch = o.createdAt.toDate().toLocaleDateString() === new Date(selectedDate).toLocaleDateString();
    }

    if (statusFilter) {
      statusMatch = o.status === statusFilter;
    }

    return dateMatch && statusMatch;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="historyPage">
      <button className="backBtn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>Your Orders 📦</h2>

      <div className="filters">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="placed">Placed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {currentOrders.map((order) => (
        <div key={order.id} className="orderCard">
          <p className="date">{order.createdAt ? order.createdAt.toDate().toLocaleDateString() : "N/A"}</p>

          {order.items.map((i, idx) => (
            <p key={idx}>
              {i.foodName} × {i.qty}
            </p>
          ))}

          <p>
            <b>Total:</b> ₹{order.totalAmount}
          </p>

          <p className="status">{order.status === "cancelled" ? "❌ Cancelled" : "✅ Placed"}</p>
        </div>
      ))}

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>

      <style jsx>{`
        .historyPage {
          padding: 40px;
          background: #f3f5f7;
          min-height: 100vh;
          font-family: "Poppins", sans-serif;
        }
        .backBtn {
          margin-bottom: 15px;
          padding: 10px 18px;
          border-radius: 20px;
          border: 2px solid #e24a0b;
          background: transparent;
          color: #e24a0b;
          cursor: pointer;
        }
        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .filters input,
        .filters select {
          padding: 10px;
          border-radius: 12px;
          border: 1px solid #ccc;
        }
        .orderCard {
          background: #fff;
          padding: 18px;
          border-radius: 16px;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        .date {
          font-size: 13px;
          color: #666;
        }
        .status {
          font-weight: 600;
        }
        .pagination button {
          margin-right: 8px;
          padding: 8px 14px;
          border-radius: 10px;
          border: none;
          background: #e24a0b;
          color: #fff;
          cursor: pointer;
        }
        .pagination .active {
          background: #333;
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
