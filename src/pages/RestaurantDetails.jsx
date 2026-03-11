import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FaMapMarkerAlt, FaPhoneAlt, FaArrowLeft } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const RestaurantDetails = () => {
  const { restaurantId, categoryName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [filter, setFilter] = useState("all");

  const currentLocation = localStorage.getItem("city");

  // 🔥 Convert 24hr to 12hr format
  const formatTime = (time) => {
    if (!time) return "";

    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;

    return `${h}:${minute} ${ampm}`;
  };

  const fetchRestaurant = async () => {
    const q = query(collection(db, "restaurants"), where("restaurantId", "==", Number(restaurantId)), where("location", "==", currentLocation));

    const snap = await getDocs(q);

    if (!snap.empty) {
      setRestaurant({ id: snap.docs[0].id, ...snap.docs[0].data() });
    }
  };

  const fetchMenuFoods = async () => {
    const menuQuery = query(collection(db, "restaurantMenus"), where("restaurantId", "==", Number(restaurantId)), where("location", "==", currentLocation));

    const menuSnap = await getDocs(menuQuery);
    const menuDocs = menuSnap.docs.map((d) => d.data());

    const foodPromises = menuDocs.map(async (menuItem) => {
      const foodQuery = query(collection(db, "foods"), where("__name__", "==", menuItem.foodId));

      const foodSnap = await getDocs(foodQuery);

      if (!foodSnap.empty) {
        return {
          id: foodSnap.docs[0].id,
          ...foodSnap.docs[0].data(),
        };
      }

      return null;
    });

    const fullFoods = await Promise.all(foodPromises);
    const cleanFoods = fullFoods.filter((f) => f !== null);
    const uniqueFoods = Array.from(new Map(cleanFoods.map((item) => [item.id, item])).values());

    setFoods(uniqueFoods);
  };

  useEffect(() => {
    fetchRestaurant();
    fetchMenuFoods();
  }, [restaurantId]);

  const filteredFoods = filter === "all" ? foods : foods.filter((f) => f.type?.toLowerCase() === filter);
  const recommendedFoods = foods.filter((f) => f.categoryId?.toString() === categoryName?.toString());

  if (!restaurant) return <h2 style={{ padding: "20px" }}>Loading...</h2>;

  return (
    <div style={styles.page}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <button style={styles.cartTopBtn} onClick={() => navigate("/cart")}>
          Your Cart 🛒
        </button>
      </div>

      <div style={styles.header}>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <img src={restaurant.imageUrl} alt={restaurant.name} style={styles.headerImg} />
          <h1>{restaurant.name}</h1>
        </div>

        <p>
          <FaMapMarkerAlt /> <b>Location:</b> {restaurant.address}
        </p>
        <p>
          <b>Opens:</b> {formatTime(restaurant.openTime)}
        </p>
        <p>
          <b>Closes:</b> {formatTime(restaurant.closeTime)}
        </p>
        <p>
          <FaPhoneAlt /> <b>Contact:</b> {restaurant.contact}
        </p>
      </div>

      <h3 style={{ margin: "20px" }}>Recommended foods for this category</h3>

      <div style={styles.grid}>
        {recommendedFoods.map((food) => (
          <div key={food.id} style={styles.card}>
            <img src={food.imageUrl} alt={food.foodName} style={styles.img} />
            <h4>{food.foodName}</h4>
            <p>₹{food.price}</p>
            <p style={{ fontSize: "12px", color: "#777" }}>🚚 {food.deliveryTime || "30 mins"}</p>
            <button
              style={styles.cartBtn}
              onClick={() =>
                addToCart({
                  ...food,
                  restaurantName: restaurant.name,
                })
              }
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <div style={styles.filterRow} styles={{ margin: "20px" }}>
        <button onClick={() => setFilter("veg")} style={filter === "veg" ? styles.activeBtn : styles.btn}>
          Veg
        </button>
        <button onClick={() => setFilter("nonveg")} style={filter === "nonveg" ? styles.activeBtn : styles.btn}>
          Non-Veg
        </button>
        <button onClick={() => setFilter("juice")} style={filter === "juice" ? styles.activeBtn : styles.btn}>
          Juice
        </button>

        <button onClick={() => setFilter("cake")} style={filter === "cake" ? styles.activeBtn : styles.btn}>
          Cake
        </button>

        <button onClick={() => setFilter("icecream")} style={filter === "icecream" ? styles.activeBtn : styles.btn}>
          Ice Cream
        </button>
        <button onClick={() => setFilter("all")} style={filter === "all" ? styles.activeBtn : styles.btn}>
          All
        </button>
      </div>
      <h3 style={{ margin: "20px" }}>Also Recommended</h3>

      <div style={styles.grid}>
        {filteredFoods.map((food) => (
          <div key={food.id} style={styles.card}>
            <img src={food.imageUrl} alt={food.foodName} style={styles.img} />
            <h4>{food.foodName}</h4>
            <p>₹{food.price}</p>
            <p style={{ fontSize: "12px", color: "#777" }}>🚚 {food.deliveryTime || "30 mins"}</p>
            <button
              style={styles.cartBtn}
              onClick={() =>
                addToCart({
                  ...food,
                  restaurantName: restaurant.name,
                })
              }
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantDetails;

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: "20px",
    fontFamily: "Poppins",
    background: "#f7f7f7",
    minHeight: "100vh",
  },

  backBtn: {
    border: "none",
    background: "transparent",
    fontSize: "16px",
    cursor: "pointer",
    color: "#fc8019",
  },

  cartTopBtn: {
    border: "none",
    background: "#fc8019",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "20px",
    cursor: "pointer",
  },

  header: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginTop: "10px",
  },

  headerImg: {
    width: "80px",
    height: "80px",
    borderRadius: "12px",
    objectFit: "cover",
  },

  filterRow: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  btn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    background: "#eee",
    cursor: "pointer",
  },

  activeBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    background: "#fc8019",
    color: "#fff",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "15px",
    padding: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "10px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  img: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "10px",
  },

  cartBtn: {
    marginTop: "8px",
    padding: "6px 12px",
    borderRadius: "15px",
    border: "none",
    background: "#fc8019",
    color: "#fff",
    cursor: "pointer",
  },
};
