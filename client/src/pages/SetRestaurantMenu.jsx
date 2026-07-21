import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SetRestaurantMenu = () => {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [restaurantMenu, setRestaurantMenu] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedRestaurantName, setSelectedRestaurantName] = useState("");
  const [setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const locSnap = await getDocs(collection(db, "locations"));
      setLocations(locSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const fetchRestaurants = async (location) => {
    const q = query(collection(db, "restaurants"), where("location", "==", location));
    const snap = await getDocs(q);
    setRestaurants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchFoods = async (categoryId) => {
    const q = query(collection(db, "foods"), where("categoryId", "==", categoryId));
    const snap = await getDocs(q);
    setFoods(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchRestaurantMenu = async (restaurantNumericId, location) => {
    const q = query(collection(db, "restaurantMenus"), where("restaurantId", "==", restaurantNumericId), where("location", "==", location));

    const snap = await getDocs(q);
    setRestaurantMenu(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addToMenu = async (food) => {
    const exists = restaurantMenu.some((f) => f.foodId === food.id);
    if (exists) return alert("Food already exists ❌");

    await addDoc(collection(db, "restaurantMenus"), {
      restaurantId: selectedRestaurantId,
      restaurantName: selectedRestaurantName,
      location: selectedLocation,
      foodId: food.id,
      foodName: food.foodName,
      imageUrl: food.imageUrl,
      price: food.price,
      type: food.type || "others",
      categoryId: food.categoryId,
    });
    alert("Food added ✅");
    fetchRestaurantMenu(selectedRestaurantId, selectedLocation);
  };

  const removeFromMenu = async (id) => {
    await deleteDoc(doc(db, "restaurantMenus", id));
    fetchRestaurantMenu(selectedRestaurantId, selectedLocation);
  };

  // 🔥 DYNAMIC TYPES
  const uniqueTypes = [...new Set(restaurantMenu.map((item) => item.type || "others"))];

  return (
    <div style={styles.page}>
      <h2>🍴 Set Restaurant Menu</h2>
      <button style={styles.backBtn} onClick={() => navigate("/admin")}>
        ← Back
      </button>

      <div style={styles.container}>
        <div style={styles.left}>
          <h3>Select Location</h3>
          <select
            style={styles.input}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              fetchRestaurants(e.target.value);
            }}
          >
            <option value="">Select Location</option>
            {locations.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </select>

          <h3>Select Restaurant</h3>
          <select
            style={styles.input}
            onChange={(e) => {
              const resObj = restaurants.find((r) => r.id === e.target.value);
              setSelectedRestaurantId(resObj.restaurantId);
              setSelectedRestaurantName(resObj.name);
              fetchRestaurantMenu(resObj.restaurantId, selectedLocation);
            }}
          >
            <option value="">Select Restaurant</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <h3>Select Category</h3>
          <select
            style={styles.input}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              fetchFoods(e.target.value);
            }}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <h3>Foods</h3>
          {foods.map((food) => (
            <div key={food.id} style={styles.foodRow}>
              <span>
                {food.foodName} ({food.type || "others"})
              </span>
              <button style={styles.addBtn} onClick={() => addToMenu(food)}>
                Add
              </button>
            </div>
          ))}
        </div>

        <div style={styles.right}>
          <h3>
            {selectedRestaurantName} Menu ({restaurantMenu.length} items)
          </h3>

          {uniqueTypes.map((type) => {
            const foodsByType = restaurantMenu.filter((f) => (f.type || "others") === type);

            return (
              <React.Fragment key={type}>
                <h4 style={{ marginTop: "20px" }}>
                  {type.toUpperCase()} ({foodsByType.length})
                </h4>

                <div style={styles.grid}>
                  {foodsByType.map((f) => (
                    <div key={f.id} style={styles.card}>
                      <img src={f.imageUrl} alt={f.foodName} style={styles.img} />
                      <p>{f.foodName}</p>
                      <p>₹{f.price}</p>
                      <button style={styles.removeBtn} onClick={() => removeFromMenu(f.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SetRestaurantMenu;

/* styles SAME */
const styles = {
  page: { padding: "30px", background: "#f4f6f8", minHeight: "100vh", fontFamily: "Poppins" },
  backBtn: { padding: "8px 16px", borderRadius: "20px", background: "transparent", color: "#fc8019", border: "2px solid #fc8019" },
  container: { display: "flex", gap: "20px", marginTop: "20px" },
  left: { width: "40%", background: "#fff", padding: "20px", borderRadius: "16px" },
  right: { width: "60%", background: "#fff", padding: "20px", borderRadius: "16px" },
  input: { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "10px" },
  foodRow: { display: "flex", justifyContent: "space-between", padding: "6px 0" },
  addBtn: { background: "#4caf50", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "10px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "8px", marginBottom: "15px" },
  card: { background: "#fafafa", borderRadius: "10px", padding: "6px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  img: { width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" },
  removeBtn: { background: "red", color: "#fff", border: "none", padding: "3px 6px", borderRadius: "8px", fontSize: "11px" },
};
