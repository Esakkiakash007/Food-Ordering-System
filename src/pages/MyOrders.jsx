import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "../components/Header";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, "orders"), where("userId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      setOrders(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    };
    fetchOrders();
  }, []);

  return (
    <>
      <Header />
      <div style={{ padding: "40px" }}>
        <h2>📦 My Orders</h2>

        {orders.map((order, i) => (
          <div key={i} style={{ marginBottom: "25px", padding: "20px", background: "#fff", borderRadius: "15px" }}>
            <p>
              <b>Date:</b> {order.createdAt ? order.createdAt.toDate().toLocaleDateString() : "N/A"}
            </p>

            {order.items.map((item, idx) => (
              <p key={idx}>
                {item.foodName} × {item.qty}
              </p>
            ))}

            <h4>Total: ₹ {order.totalAmount}</h4>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyOrders;
