import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LocationPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [foodDialog, setFoodDialog] = useState(null);

  const [popupRestaurants, setPopupRestaurants] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    const savedCity = localStorage.getItem("city");
    const savedAddress = localStorage.getItem("address");

    if (savedCity && savedAddress) {
      setCity(savedCity);
      setAddress(savedAddress);
      setStep(4);
    }

    fetchCategories();
    fetchAllFoods();
    fetchAllRestaurants();
  }, []);

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchAllFoods = async () => {
    const snap = await getDocs(collection(db, "foods"));
    setAllFoods(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchAllRestaurants = async () => {
    const snap = await getDocs(collection(db, "restaurants"));
    setAllRestaurants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const saveUserLocationToFirestore = async (cityValue, addressValue) => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "users"), where("authUid", "==", user.uid));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const userDocId = snap.docs[0].id;

      await updateDoc(doc(db, "users", userDocId), {
        location: cityValue,
        address: addressValue,
        email: user.email || "",
        name: user.displayName || user.email,
      });
    } else {
      const allUsersSnap = await getDocs(collection(db, "users"));
      const newUserNumber = allUsersSnap.size + 1;

      await addDoc(collection(db, "users"), {
        authUid: user.uid,
        userNumber: newUserNumber,
        name: user.displayName || user.email,
        email: user.email || "",
        location: cityValue,
        address: addressValue,
      });
    }
  };

  const handleCategoryClick = async (cat) => {
    setSelectedCategory(cat);

    const foodSnap = await getDocs(query(collection(db, "foods"), where("categoryId", "==", cat.id)));

    const categoryFoods = foodSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setFoods(categoryFoods);

    const menuSnap = await getDocs(collection(db, "restaurantMenus"));
    const menuList = menuSnap.docs.map((d) => d.data());

    const filteredRestaurants = allRestaurants.filter((r) => r.location === city && menuList.some((m) => m.restaurantId === r.restaurantId && categoryFoods.some((f) => f.id === m.foodId)));

    setRestaurants(filteredRestaurants);
  };

  const confirmLocation = async () => {
    if (!manualCity || !manualAddress) return alert("Enter details");

    setCity(manualCity);
    setAddress(manualAddress);

    localStorage.setItem("city", manualCity);
    localStorage.setItem("address", manualAddress);

    await saveUserLocationToFirestore(manualCity, manualAddress);

    setStep(4);
  };

  const changeLocation = () => {
    localStorage.clear();
    setStep(1);
  };

  const highlightMatch = (text) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} style={{ background: "#ffe0c7", fontWeight: "600" }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const handleFoodClick = async (food) => {
    const menuSnap = await getDocs(query(collection(db, "restaurantMenus"), where("foodId", "==", food.id), where("location", "==", city)));

    const availableRestaurants = menuSnap.docs.map((d) => d.data());

    if (availableRestaurants.length === 1) {
      navigate(`/restaurant/${availableRestaurants[0].restaurantId}/${food.categoryId}`);
      setSearch("");
    } else if (availableRestaurants.length > 1) {
      setPopupRestaurants(availableRestaurants);
      setSelectedFood(food);
    } else {
      alert("Food not available in selected location");
    }
  };

  const filteredFoodSuggestions = search.length > 0 ? allFoods.filter((f) => f.foodName.toLowerCase().includes(search.toLowerCase())) : [];

  const filteredRestaurantSuggestions = search.length > 0 ? allRestaurants.filter((r) => r.location === city).filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div style={{ fontFamily: "Poppins", background: "#f7f7f7", minHeight: "100vh" }}>
      {step === 1 && (
        <div style={overlay}>
          <div style={popup}>
            <h3>Enter Delivery Location</h3>
            <input placeholder="Enter City" value={manualCity} onChange={(e) => setManualCity(e.target.value)} style={inputStyle} />
            <input placeholder="Enter Address" value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} style={inputStyle} />
            <button style={btnStyle} onClick={confirmLocation}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <>
          <div style={header}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <FaMapMarkerAlt color="#fc8019" />
              <div>
                <b style={{ color: "#fc8019" }}>{city}</b>
                <p style={{ fontSize: "12px" }}>{address}</p>
              </div>
            </div>
            <button onClick={changeLocation} style={changeBtn}>
              Change
            </button>
          </div>

          {/* SEARCH */}
          <div style={{ position: "relative" }}>
            <div style={searchBar}>
              <FaSearch />
              <input placeholder="Search food or restaurant..." value={search} onChange={(e) => setSearch(e.target.value)} style={searchInput} />
            </div>

            {search && (
              <div style={suggestionBox}>
                {filteredFoodSuggestions.length > 0 && (
                  <>
                    <div style={groupTitle}>Foods</div>
                    {filteredFoodSuggestions.map((food) => (
                      <div
                        key={food.id}
                        style={suggestionItem}
                        onClick={async () => {
                          const menuSnap = await getDocs(collection(db, "restaurantMenus"));
                          const menuList = menuSnap.docs.map((d) => d.data());

                          const availableRestaurants = allRestaurants.filter((r) => r.location === city && menuList.some((m) => m.restaurantId === r.restaurantId && m.foodId === food.id));

                          setSearch("");

                          if (availableRestaurants.length === 1) {
                            navigate(`/restaurant/${availableRestaurants[0].restaurantId}/${food.categoryId}`);
                          } else if (availableRestaurants.length > 1) {
                            setFoodDialog({
                              food,
                              restaurants: availableRestaurants,
                            });
                          } else {
                            alert("Food not available in this location");
                          }
                        }}
                      >
                        <img src={food.imageUrl} alt={food.foodName} style={suggestionImg} />
                        <span>{food.foodName}</span>
                      </div>
                    ))}
                  </>
                )}

                {filteredRestaurantSuggestions.length > 0 && (
                  <>
                    <div style={groupTitle}>Restaurants</div>
                    {filteredRestaurantSuggestions.map((res) => (
                      <div
                        key={res.id}
                        style={suggestionItem}
                        onClick={() => {
                          setSearch("");
                          navigate(`/restaurant/${res.restaurantId}/all`);
                        }}
                      >
                        <img src={res.imageUrl} alt={res.name} style={suggestionImg} />
                        <span>{res.name}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {foodDialog && (
              <div style={overlay}>
                <div style={popup}>
                  <h3>{foodDialog.food.foodName} available in these restaurants</h3>

                  {foodDialog.restaurants.map((res) => (
                    <div
                      key={res.id}
                      style={{
                        padding: "10px",
                        marginTop: "10px",
                        background: "#f5f5f5",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/restaurant/${res.restaurantId}/${foodDialog.food.categoryId}`)}
                    >
                      {res.name}
                    </div>
                  ))}

                  <button style={{ ...btnStyle, marginTop: "15px" }} onClick={() => setFoodDialog(null)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORIES */}
          <div style={categoryScroll}>
            {categories.map((cat) => (
              <div key={cat.id} className="categoryCard" onClick={() => handleCategoryClick(cat)}>
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="categoryImg"
                  style={{
                    border: selectedCategory?.id === cat.id ? "2px solid #fc8019" : "none",
                  }}
                />
                <p className="catName">{cat.name}</p>
              </div>
            ))}
          </div>

          {selectedCategory && (
            <div style={{ padding: "20px" }}>
              <h3>{selectedCategory.name} Foods</h3>

              <div style={foodGrid}>
                {foods.map((food) => (
                  <div key={food.id} style={foodCard} onClick={() => handleFoodClick(food)}>
                    <img
                      src={food.imageUrl}
                      alt={food.foodName}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                        margin: "0 auto",
                        display: "block",
                      }}
                    />
                    <p>{food.foodName}</p>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: "25px" }}>Available Restaurants</h3>

              <div style={restaurantGrid}>
                {restaurants.map((r) => (
                  <div key={r.id} className="restaurantCard" onClick={() => navigate(`/restaurant/${r.restaurantId}/${selectedCategory.id}`)}>
                    <img src={r.imageUrl} alt={r.name} className="restaurantImg" />
                    <p style={{ marginTop: "10px" }}>{r.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* HOVER STYLES */}
      <style>{`
        .categoryCard {
          text-align:center;
          cursor:pointer;
          transition: all 0.3s ease;
        }

        .categoryImg {
          width:70px;
          height:70px;
          border-radius:50%;
          transition: all 0.3s ease;
        }

        .catName {
          font-size:14px;
          transition: all 0.3s ease;
        }

        .categoryCard:hover {
          transform: scale(1.08);
          opacity: 0.85;
        }

        .categoryCard:hover .catName {
          color:#fc8019;
          font-weight:600;
        }

        .restaurantCard {
          background:#fff;
          border-radius:18px;
          padding:15px;
          cursor:pointer;
          box-shadow:0 4px 15px rgba(0,0,0,0.08);
          text-align:center;
          transition: all 0.3s ease;
        }

        .restaurantCard:hover {
          transform: translateY(-6px);
          box-shadow:0 10px 25px rgba(0,0,0,0.15);
          opacity:0.95;
        }

        .restaurantImg {
          width:100%;
          height:140px;
          object-fit:contain;
          border-radius:12px;
          padding:15px;
          display:block;
          margin:0 auto;
        }
      `}</style>
    </div>
  );
};

const overlay = {
  position: "fixed",
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const popup = {
  background: "#fff",
  padding: "30px",
  borderRadius: "20px",
  width: "350px",
  textAlign: "center",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc",
};

const btnStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  borderRadius: "20px",
  border: "none",
  background: "#fc8019",
  color: "#fff",
  cursor: "pointer",
};

const header = {
  background: "#fff",
  padding: "15px",
  display: "flex",
  justifyContent: "space-between",
};

const changeBtn = {
  border: "none",
  background: "transparent",
  color: "#fc8019",
  cursor: "pointer",
};

const searchBar = {
  margin: "10px 15px",
  display: "flex",
  alignItems: "center",
  background: "#eee",
  padding: "10px 15px",
  borderRadius: "25px",
};

const searchInput = {
  border: "none",
  outline: "none",
  background: "transparent",
  marginLeft: "10px",
  width: "100%",
};

const categoryScroll = {
  display: "flex",
  gap: "25px",
  overflowX: "auto",
  padding: "20px",
};

const foodGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: "20px",
};

const restaurantGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "25px",
  paddingTop: "20px",
};

const foodCard = {
  background: "#fff",
  padding: "15px",
  borderRadius: "15px",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  cursor: "pointer",
};

const suggestionBox = {
  position: "absolute",
  background: "#fff",
  width: "90%",
  marginTop: "5px",
  borderRadius: "10px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
  maxHeight: "250px",
  overflowY: "auto",
  zIndex: 999,
};

const suggestionItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #eee",
};

const suggestionImg = {
  width: "40px",
  height: "40px",
  objectFit: "cover",
  borderRadius: "8px",
};

const groupTitle = {
  padding: "8px 12px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#fc8019",
  background: "#fff7f0",
  borderBottom: "1px solid #eee",
};

export default LocationPage;
