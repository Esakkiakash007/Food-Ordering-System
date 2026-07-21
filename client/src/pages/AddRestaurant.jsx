// src/pages/AddRestaurant.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddRestaurant = () => {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");

  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [contact, setcontact] = useState("");

  const [restaurants, setRestaurants] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const snap = await getDocs(collection(db, "locations"));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLocations(list);
  };

  const handleAddLocation = async () => {
    if (!newLocation) return alert("Enter location name");

    await addDoc(collection(db, "locations"), { name: newLocation });

    alert("Location added ✅");
    setNewLocation("");
    fetchLocations();
  };

  const fetchRestaurants = async (locationName) => {
    const q = query(collection(db, "restaurants"), where("location", "==", locationName));
    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setRestaurants(list);
  };

  const handleAddRestaurant = async () => {
    if (!selectedLocation || !restaurantName || !imageUrl || !address || !openTime || !closeTime || !contact) {
      return alert("Fill all fields");
    }

    if (contact.length !== 10) {
      return alert("Contact number must be 10 digits");
    }

    const q = query(collection(db, "restaurants"), where("location", "==", selectedLocation));
    const snap = await getDocs(q);

    let newRestaurantId = 1;

    if (!snap.empty) {
      const ids = snap.docs.map((d) => d.data().restaurantId || 0);
      const maxId = Math.max(...ids);
      newRestaurantId = maxId + 1;
    }

    if (editId) {
      await updateDoc(doc(db, "restaurants", editId), {
        name: restaurantName,
        imageUrl,
        address,
        location: selectedLocation,
        openTime,
        closeTime,
        contact,
      });

      alert("Restaurant updated ✅");
      setEditId(null);
    } else {
      await addDoc(collection(db, "restaurants"), {
        restaurantId: newRestaurantId,
        name: restaurantName,
        imageUrl,
        address,
        location: selectedLocation,
        openTime,
        closeTime,
        contact,
        createdAt: new Date(),
      });

      alert("Restaurant added ✅");
    }

    setRestaurantName("");
    setImageUrl("");
    setAddress("");
    setOpenTime("");
    setCloseTime("");
    setcontact("");

    fetchRestaurants(selectedLocation);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this restaurant?");
    if (!confirm) return;

    await deleteDoc(doc(db, "restaurants", id));
    fetchRestaurants(selectedLocation);
  };

  const handleEdit = (res) => {
    setEditId(res.id);
    setRestaurantName(res.name);
    setImageUrl(res.imageUrl);
    setAddress(res.address);
    setOpenTime(res.openTime);
    setCloseTime(res.closeTime);
    setcontact(res.contact);
  };

  const handleLocationChange = (e) => {
    const loc = e.target.value;
    setSelectedLocation(loc);
    fetchRestaurants(loc);
  };

  return (
    <div style={styles.page}>
      <h2>🍴 Add Restaurant</h2>

      <button style={styles.backBtn} onClick={() => navigate("/admin")}>
        ← Back to Dashboard
      </button>

      <div style={styles.container}>
        <div style={styles.left}>
          <h3>Add Location</h3>

          <input type="text" placeholder="Enter city" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} style={styles.input} />

          <button style={styles.btn} onClick={handleAddLocation}>
            Add Location
          </button>

          <hr />

          <h3>{editId ? "Edit Restaurant" : "Add Restaurant"}</h3>

          <select value={selectedLocation} onChange={handleLocationChange} style={styles.input}>
            <option value="">Select City</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>

          <input type="text" placeholder="Restaurant Name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} style={styles.input} />

          <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={styles.input} />

          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />

          {/* ✅ 12 HOUR TIME PICKER */}
          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} style={styles.input} />

          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} style={styles.input} />

          {/* ✅ ONLY NUMBERS + 10 DIGITS */}
          <input type="tel" placeholder="Contact Number" value={contact} maxLength={10} onChange={(e) => setcontact(e.target.value.replace(/\D/g, ""))} style={styles.input} />

          <button style={styles.btn} onClick={handleAddRestaurant}>
            {editId ? "Update Restaurant" : "Add Restaurant"}
          </button>
        </div>

        <div style={styles.right}>
          <h3>Restaurants in {selectedLocation || "Select City"}</h3>

          <div style={styles.grid}>
            {restaurants.map((res) => (
              <div key={res.id} style={styles.card}>
                <img src={res.imageUrl} alt={res.name} style={styles.img} />
                <h4>{res.name}</h4>
                <p style={styles.addr}>📍 {res.address}</p>
                <p style={styles.addr}>
                  🕒 {res.openTime} - {res.closeTime}
                </p>
                <p style={styles.addr}>📞 {res.contact}</p>

                <div style={styles.actions}>
                  <button style={styles.editBtn} onClick={() => handleEdit(res)}>
                    Edit
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(res.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "30px",
    background: "#f4f6f8",
    minHeight: "100vh",
    fontFamily: "Poppins, sans-serif",
  },
  backBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "2px solid #fc8019",
    background: "transparent",
    color: "#fc8019",
    cursor: "pointer",
    marginBottom: "15px",
  },
  container: { display: "flex", gap: "25px" },
  left: {
    width: "35%",
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
  },
  right: {
    width: "65%",
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: "20px",
    border: "none",
    background: "#fc8019",
    color: "#fff",
    cursor: "pointer",
    marginTop: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginTop: "15px",
  },
  card: {
    background: "#fafafa",
    borderRadius: "14px",
    padding: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  img: {
    width: "100%",
    height: "140px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  addr: { fontSize: "12px", color: "#666", margin: "3px 0" },
  actions: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "8px",
  },
  editBtn: {
    padding: "6px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#4caf50",
    color: "#fff",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#f44336",
    color: "#fff",
    cursor: "pointer",
  },
};

export default AddRestaurant;
