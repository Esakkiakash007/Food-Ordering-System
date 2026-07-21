import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const getOrCreateUserNumber = async (user) => {
  const q = query(collection(db, "users"), where("authUid", "==", user.uid));
  const snap = await getDocs(q);

  if (!snap.empty) return snap.docs[0].data().userNumber;

  const allUsersSnap = await getDocs(collection(db, "users"));
  const newUserNumber = allUsersSnap.size + 1;

  await addDoc(collection(db, "users"), {
    authUid: user.uid,
    userNumber: newUserNumber,
    name: user.displayName || user.email,
  });

  return newUserNumber;
};

const getUserLocationDetails = async (user) => {
  const q = query(collection(db, "users"), where("authUid", "==", user.uid));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const userData = snap.docs[0].data();

    return {
      location: userData.location || "N/A",
      address: userData.address || "N/A",
    };
  }

  return {
    location: "N/A",
    address: "N/A",
  };
};

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart } = useCart();

  const [todayOrders, setTodayOrders] = useState([]);
  const [currentPage] = useState(1);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);

  const ordersPerPage = 5;
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const todayDateString = new Date().toLocaleDateString();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");

    const user = auth.currentUser;
    if (!user) return alert("Please login");

    const userNumber = await getOrCreateUserNumber(user);
    const userLocationDetails = await getUserLocationDetails(user);
    const restaurantName = cartItems[0]?.restaurantName || "N/A";

    if (cashOnDelivery) {
      await addDoc(collection(db, "orders"), {
        userId: userNumber,
        authUid: user.uid,
        userName: user.displayName || user.email,
        items: cartItems,
        totalAmount,
        status: "placed",
        paymentMethod: "Cash on Delivery",
        location: userLocationDetails.location,
        address: userLocationDetails.address,
        restaurantName,
        createdAt: serverTimestamp(),
      });

      await fetch(`${process.env.REACT_APP_API_URL}/api/send-order-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.displayName || user.email,
          items: cartItems,
          totalAmount,
          location: userLocationDetails.location,
          address: userLocationDetails.address,
          restaurantName,
          paymentMethod: "Cash On Delivery",
        }),
      });

      alert("Order Placed Successfully ✅ (Cash on Delivery)");
      clearCart();
      fetchTodayOrders();
      return;
    }

    const amount = totalAmount;

    const res = fetch(`${process.env.REACT_APP_API_URL}/api/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const order = await res.json();

    const options = {
      key: "rzp_test_SA7BFjQIRuFxI3",
      amount: order.amount,
      currency: "INR",
      name: "Food App",
      description: "Food Order Payment",
      order_id: order.id,

      handler: async function () {
        const userNumber = await getOrCreateUserNumber(user);
        const userLocationDetails = await getUserLocationDetails(user);

        await addDoc(collection(db, "orders"), {
          userId: userNumber,
          authUid: user.uid,
          userName: user.displayName || user.email,
          items: cartItems,
          totalAmount,
          status: "placed",
          paymentMethod: "UPI",
          location: userLocationDetails.location,
          address: userLocationDetails.address,
          restaurantName: cartItems[0]?.restaurantName || "N/A",
          createdAt: serverTimestamp(),
        });

        await fetch(`${process.env.REACT_APP_API_URL}/api/send-order-mail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: user.displayName || user.email,
            items: cartItems,
            totalAmount,
            location: userLocationDetails.location,
            address: userLocationDetails.address,
            restaurantName: cartItems[0]?.restaurantName || "N/A",
            paymentMethod: "UPI",
          }),
        });

        alert("Payment Successful & Order Placed ✅");
        clearCart();
        fetchTodayOrders();
      },

      prefill: {
        name: user.displayName,
        email: user.email,
      },

      theme: {
        color: "#e24a0b",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const fetchTodayOrders = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "orders"), where("authUid", "==", user.uid));
    const snap = await getDocs(q);

    const todayList = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((o) => o.createdAt && o.createdAt.toDate().toLocaleDateString() === todayDateString);

    setTodayOrders(todayList);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchTodayOrders();
    }, []);

    return () => unsubscribe();
  }, [fetchTodayOrders]);

  const handleCancelOrder = async (order) => {
    const confirm = window.confirm("Do you want to cancel this order?");
    if (!confirm) return;

    await updateDoc(doc(db, "orders", order.id), {
      status: "cancelled",
    });

    await fetch(`${process.env.REACT_APP_API_URL}/api/send-order-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: order.userName + " (Order Cancelled)",
        items: order.items,
        totalAmount: order.totalAmount,
        location: order.location || "N/A",
        address: order.address || "N/A",
        restaurantName: order.restaurantName || order.items?.[0]?.restaurantName || "N/A",
        paymentMethod: order.paymentMethod || "N/A",
      }),
    });

    alert("Order cancelled ❌");
    fetchTodayOrders();
  };

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = todayOrders.slice(indexOfFirst, indexOfLast);

  return (
    <div className="cartPage">
      <div className="container">
        <div className="topBar">
          <button className="backBtn" onClick={() => navigate("/home")}>
            ← Back to Menu
          </button>

          <button className="historyBtn" onClick={() => navigate("/order-history")}>
            Order History
          </button>
        </div>

        <h2 className="cartTitle">Your Cart 🛒</h2>

        {cartItems.map((item) => (
          <div key={item.id} className="cartItem">
            <div className="foodInfo">
              <img src={item.imageUrl} alt={item.foodName} className="foodIcon" />
              <div>
                <h4>{item.foodName}</h4>
                <p className="price">₹{item.price}</p>
              </div>
            </div>

            <div className="qtyControls">
              <button onClick={() => decreaseQty(item.id)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => increaseQty(item.id)}>+</button>
            </div>

            <button className="deleteBtn" onClick={() => removeFromCart(item.id)}>
              ✕
            </button>
          </div>
        ))}

        <div className="summary">
          <div>
            <h3>Total: ₹{totalAmount}</h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <input type="checkbox" checked={cashOnDelivery} onChange={(e) => setCashOnDelivery(e.target.checked)} />
              <label>Cash on Delivery</label>
            </div>
          </div>

          <button className="placeBtn" onClick={handlePlaceOrder}>
            Place Order
          </button>
        </div>

        <div className="todayOrders">
          <h3>
            Today Orders <span className="dateBadge">{todayDateString}</span>
          </h3>

          {currentOrders.map((order) => (
            <div key={order.id} className="orderCard">
              {order.status === "cancelled" && <span className="cancelledBadge">Cancelled</span>}

              <p className="orderTime">Time: {order.createdAt ? order.createdAt.toDate().toLocaleTimeString() : "N/A"}</p>

              {order.items.map((i, idx) => (
                <div key={idx}>
                  {i.foodName} × {i.qty}
                </div>
              ))}

              <p className="orderTotal">₹{order.totalAmount}</p>

              <p style={{ fontSize: "12px", color: "#777" }}>Paid through {order.paymentMethod || "UPI"}</p>

              {order.status !== "cancelled" && (
                <button className="cancelBtn" onClick={() => handleCancelOrder(order)}>
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .cartPage {
          padding: 30px;
          background: #f3f5f7;
          min-height: 100vh;
          font-family: "Poppins", sans-serif;
        }

        .container {
          max-width: 900px;
          margin: auto;
        }

        .topBar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .backBtn,
        .historyBtn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 2px solid #e24a0b;
          background: transparent;
          color: #e24a0b;
          font-weight: 600;
          cursor: pointer;
        }

        .cartItem {
          background: #fff;
          padding: 15px 18px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .foodInfo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .foodIcon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          object-fit: cover;
        }

        .price {
          color: #e24a0b;
          font-weight: 600;
        }

        .qtyControls button {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: #e24a0b;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .summary {
          margin-top: 20px;
          padding: 18px;
          background: #fff;
          border-radius: 18px;
          display: flex;
          justify-content: space-between;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .placeBtn {
          padding: 10px 24px;
          border-radius: 30px;
          background: #e24a0b;
          color: #fff;
          border: none;
          font-size: 16px;
          cursor: pointer;
        }

        .todayOrders {
          margin-top: 30px;
        }

        .orderCard {
          background: #fff;
          padding: 14px;
          border-radius: 14px;
          margin-top: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          max-width: 600px;
        }

        .orderTime {
          display: inline-block;
          font-size: 11px;
          background: #ffe7db;
          color: #e24a0b;
          padding: 3px 8px;
          border-radius: 12px;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .todayFoodItem {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }

        .todayFoodIcon {
          width: 35px;
          height: 35px;
          border-radius: 8px;
          object-fit: cover;
        }

        .orderTotal {
          font-weight: 700;
          color: #e24a0b;
          margin-top: 8px;
        }

        .pagination {
          margin-top: 15px;
        }

        .pagination button {
          margin-right: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          border: none;
          background: #e24a0b;
          color: #fff;
          cursor: pointer;
        }

        .pagination .active {
          background: #333;
        }

        .emptyText {
          color: #777;
          margin-top: 10px;
        }
        .dateBadge {
          font-size: 12px;
          background: linear-gradient(135deg, #ff6a00, #ff3d00);
          color: #fff;
          padding: 3px 10px;
          border-radius: 20px;
          margin-left: 10px;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        .orderCard {
          position: relative;
          background: #fff;
          padding: 14px;
          border-radius: 14px;
          margin-top: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          max-width: 600px;
        }

        .cancelBtn {
          margin-top: 10px;
          padding: 8px 22px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, #ff4b2b, #ff416c);
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .cancelBtn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 65, 108, 0.4);
        }

        .cancelledBadge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff3b3b;
          color: #fff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        .deleteBtn {
          color: white;
          background: #e24a0b;
          border: none;
          border-radius: 330%;
        }
      `}</style>
    </div>
  );
};

export default Cart;
