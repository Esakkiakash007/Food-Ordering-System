import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ORDERS_PER_PAGE = 5;

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();

  // ================= REAL-TIME FETCH =================
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });

    return () => unsub();
  }, []);

  // ================= FILTER LOGIC =================
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.createdAt ? order.createdAt.toDate().toISOString().split("T")[0] : "";

    const matchStatus = statusFilter === "all" ? true : order.status === statusFilter;
    const matchDate = dateFilter ? orderDate === dateFilter : true;
    const matchName = searchName ? order.userName?.toLowerCase().includes(searchName.toLowerCase()) : true;

    return matchStatus && matchDate && matchName;
  });

  // ================= STATS =================
  const totalOrders = orders.length;
  const totalRevenue = orders.filter((o) => o.status === "placed").reduce((sum, o) => sum + o.totalAmount, 0);

  // ================= PAGINATION =================
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  // ================= DETAILS VIEW =================
  if (selectedOrder) {
    return (
      <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>
        <button
          onClick={() => setSelectedOrder(null)}
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            borderRadius: "20px",

            background: "transparent",
            color: "#fc8019",
            cursor: "pointer",
            border: "2px solid #fc8019",
          }}
        >
          ⬅ Back to All Orders
        </button>

        <h2>📦 Order Details</h2>

        <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", maxWidth: "600px" }}>
          <p>
            <b>User ID:</b> {selectedOrder.userId}
          </p>
          <p>
            <b>Name:</b> {selectedOrder.userName}
          </p>

          <p>
            <b>Date & Time:</b> {selectedOrder.createdAt ? selectedOrder.createdAt.toDate().toLocaleString() : "N/A"}
          </p>

          <hr />

          <h4>🍽 Food Items</h4>
          {selectedOrder.items.map((item, idx) => (
            <p key={idx}>
              {item.foodName} × {item.qty}
            </p>
          ))}

          <hr />
          <h3>Total: ₹ {selectedOrder.totalAmount}</h3>

          {/* ✅ PAYMENT METHOD DISPLAY */}
          <p>
            <b>Payment:</b> {selectedOrder.paymentMethod === "Cash on Delivery" ? "Pay Through On Delivery" : "Pay Through UPI"}
          </p>

          <p>
            <b>Status:</b> {selectedOrder.status === "cancelled" ? "❌ Cancelled" : "✅ Placed"}
          </p>
        </div>
      </div>
    );
  }

  // ================= TABLE VIEW =================
  return (
    <div style={{ padding: "40px", background: "#f4f6f8", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
        <h2>📊 Admin – View Orders</h2>
        <button
          onClick={() => navigate("/admin")}
          style={{
            padding: "8px 16px",
            marginTop: "5px",
            borderRadius: "20px",
            background: "transparent",
            color: "#fc8019",
            cursor: "pointer",
            border: "2px solid #fc8019",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: "30px", margin: "20px 0", flexWrap: "wrap" }}>
        <h4>📦 Total Orders: {totalOrders}</h4>
        <h4>💰 Total Revenue: ₹ {totalRevenue}</h4>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Search by name"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "8px", width: "220px" }}
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "8px" }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "8px" }}
        >
          <option value="all">All Orders</option>
          <option value="placed">Placed Orders</option>
          <option value="cancelled">Cancelled Orders</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fc8019", color: "#fff" }}>
            <tr>
              <th style={th}>User ID</th>
              <th style={th}>Name</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
              <th style={th}>Payment</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{order.userId}</td>
                <td style={td}>{order.userName}</td>
                <td style={td}>{order.createdAt ? order.createdAt.toDate().toLocaleDateString() : "N/A"}</td>

                <td style={td}>{order.status === "cancelled" ? <span style={{ color: "red" }}>Cancelled</span> : <span style={{ color: "green" }}>Placed</span>}</td>

                {/* ✅ PAYMENT COLUMN */}
                <td style={td}>{order.paymentMethod === "Cash on Delivery" ? "On Delivery" : "UPI"}</td>

                <td style={td}>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      background: "#fc8019",
                      border: "none",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ marginTop: "30px" }}>
          <button style={{ background: "#fc8019", color: "white", borderRadius: "6px", border: "none", padding: "6px 12px", cursor: "pointer" }} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            ⬅ Prev
          </button>

          <span style={{ margin: "0 15px" }}>
            Page {currentPage} / {totalPages}
          </span>

          <button style={{ background: "#fc8019", color: "white", borderRadius: "6px", border: "none", padding: "6px 12px", cursor: "pointer" }} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
};

const th = { padding: "14px", textAlign: "left" };
const td = { padding: "14px" };

export default ViewOrders;
