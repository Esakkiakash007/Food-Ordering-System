import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddFood = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);

  const [foodName, setFoodName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");

  const [editFoodId, setEditFoodId] = useState(null);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(list);
  };

  const fetchFoods = async () => {
    const snapshot = await getDocs(collection(db, "foods"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFoods(list);
  };

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const showTypeField = selectedCategory;

  const handleAddFood = async (e) => {
    e.preventDefault();

    if (!foodName || !price || !imageUrl || !categoryId || !deliveryTime) {
      alert("Please fill all fields");
      return;
    }

    if (showTypeField && !type) {
      alert("Please select food type");
      return;
    }

    try {
      if (editFoodId) {
        await updateDoc(doc(db, "foods", editFoodId), {
          foodName,
          price: Number(price),
          imageUrl,
          deliveryTime,
          categoryId,
          type: showTypeField ? type : "",
        });

        alert("Food updated successfully ✅");
        setEditFoodId(null);
      } else {
        await addDoc(collection(db, "foods"), {
          foodName,
          price: Number(price),
          imageUrl,
          deliveryTime,
          categoryId,
          createdAt: new Date(),
          type: showTypeField ? type : "",
        });

        alert("Food added successfully ✅");
      }

      setFoodName("");
      setPrice("");
      setImageUrl("");
      setDeliveryTime("");
      setCategoryId("");
      setType("");

      fetchFoods();
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  // ✅ UPDATED DELETE LOGIC (DELETE FROM BOTH COLLECTIONS)
  const handleDelete = async (food) => {
    const confirmDelete = window.confirm(`Do you want to delete this food item (${food.foodName})?`);
    if (!confirmDelete) return;

    try {
      // 1️⃣ Delete from foods collection
      await deleteDoc(doc(db, "foods", food.id));

      // 2️⃣ Delete from restaurantMenus collection
      const menuQuery = query(collection(db, "restaurantMenus"), where("foodId", "==", food.id));

      const menuSnap = await getDocs(menuQuery);

      const deletePromises = menuSnap.docs.map((docSnap) => deleteDoc(doc(db, "restaurantMenus", docSnap.id)));

      await Promise.all(deletePromises);

      alert("Food deleted everywhere ❌");
      fetchFoods();
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  const handleEdit = (food) => {
    setEditFoodId(food.id);
    setFoodName(food.foodName);
    setPrice(food.price);
    setImageUrl(food.imageUrl);
    setDeliveryTime(food.deliveryTime);
    setCategoryId(food.categoryId);
    setType(food.type || "");
  };

  const filteredFoods = foods.filter((food) => food.categoryId === categoryId);

  return (
    <div className="page">
      {/* LEFT SIDE */}
      <div className="leftCard">
        <button onClick={() => navigate("/admin")} className="backBtn">
          ← Back to Dashboard
        </button>

        <h2 className="title">{editFoodId ? "Edit Food ✏️" : "Add New Food 🍔"}</h2>

        <form onSubmit={handleAddFood}>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input type="text" placeholder="Food Name" value={foodName} onChange={(e) => setFoodName(e.target.value)} className="input" />

          <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" />

          <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className="input" />

          {showTypeField && (
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              <option value="">Select Type</option>
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
              <option value="juice">Juice</option>
              <option value="cake">Cake</option>
              <option value="icecream">Ice Cream</option>
            </select>
          )}

          <input type="text" placeholder="Delivery Time (eg: 30 mins)" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="input" />

          <button type="submit" className="btn">
            {editFoodId ? "Update Food" : "Add Food"}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE */}
      <div className="rightCard">
        <h3 className="categoryTitle">{selectedCategory ? selectedCategory.name : "Select a category"}</h3>

        <div className="foodGrid">
          {filteredFoods.map((food) => (
            <div key={food.id} className="foodItem">
              <img src={food.imageUrl} alt={food.foodName} />
              <p className="foodName">{food.foodName}</p>
              <p className="price">₹{food.price}</p>
              {food.type && <p style={{ fontSize: "12px", color: "#555" }}>{food.type}</p>}

              <div className="actionBtns">
                <button className="editBtn" onClick={() => handleEdit(food)}>
                  Edit
                </button>
                <button className="deleteBtn" onClick={() => handleDelete(food)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          gap: 30px;
          padding: 40px;
          background: #f3f5f7;
          font-family: "Poppins", sans-serif;
        }

        .leftCard {
          width: 380px;
          background: #fff;
          padding: 25px;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .rightCard {
          flex: 1;
          background: #fff;
          padding: 25px;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .title {
          text-align: center;
          color: #fc8019;
          margin-bottom: 15px;
        }

        .categoryTitle {
          margin-bottom: 15px;
          font-size: 20px;
          color: #333;
        }

        .input {
          width: 93%;
          padding: 12px 14px;
          margin-top: 15px;
          border-radius: 12px;
          border: 1px solid #ccc;
          font-size: 15px;
        }

        .btn {
          width: 100%;
          margin-top: 20px;
          padding: 14px;
          background: #fc8019;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          cursor: pointer;
        }

        .backBtn {
          margin-bottom: 10px;
          padding: 8px 16px;
          border-radius: 20px;
          border: 2px solid#fc8019;
          background: transparent;
          color: #fc8019;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .foodGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .foodItem {
          background: #fafafa;
          border-radius: 14px;
          padding: 10px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }

        .foodItem img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .foodName {
          font-size: 14px;
          font-weight: 600;
        }

        .price {
          font-size: 13px;
          color: #fc8019;
          font-weight: 600;
        }

        .actionBtns {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }

        .editBtn {
          background: #4caf50;
          color: #fff;
          border: none;
          padding: 5px 10px;
          border-radius: 12px;
          cursor: pointer;
        }

        .deleteBtn {
          background: red;
          color: #fff;
          border: none;
          padding: 5px 10px;
          border-radius: 12px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AddFood;
