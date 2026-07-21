// src/pages/AddCategory.jsx

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryId, setNewCategoryId] = useState(null);

  const [editId, setEditId] = useState(null); // ✅ for edit mode

  const navigate = useNavigate();

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(list);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName || !imageUrl) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // ✅ UPDATE MODE
      if (editId) {
        await updateDoc(doc(db, "categories", editId), {
          name: categoryName,
          imageUrl: imageUrl,
        });

        alert("Category updated successfully ✅");
        setEditId(null);
      } else {
        // ✅ ADD MODE
        const docRef = await addDoc(collection(db, "categories"), {
          name: categoryName,
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
        });

        alert("Category added successfully ✅");
        setNewCategoryId(docRef.id);
      }

      setCategoryName("");
      setImageUrl("");
      setLoading(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Error ❌");
      setLoading(false);
    }
  };

  // ✅ EDIT CATEGORY
  const handleEdit = (cat) => {
    setCategoryName(cat.name);
    setImageUrl(cat.imageUrl);
    setEditId(cat.id);
  };

  // ✅ DELETE CATEGORY WITH FOOD CHECK
  const handleDelete = async (cat) => {
    const confirmDelete = window.confirm(`Do you want to delete this category (${cat.name})?`);
    if (!confirmDelete) return;

    // check foods under this category
    const q = query(collection(db, "foods"), where("categoryId", "==", cat.id));
    const snap = await getDocs(q);

    if (!snap.empty) {
      alert("❌ This category has food items. Please delete those food items first.");
      return;
    }

    await deleteDoc(doc(db, "categories", cat.id));
    alert("Category deleted ✅");
    fetchCategories();
  };

  return (
    <div className="page">
      {/* LEFT SIDE */}
      <div className="leftCard">
        <h2 className="title">{editId ? "Edit Category ✏️" : "Add New Category 🍽️"}</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Category Name (Eg: Biryani)" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="input" />

          <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" />

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Processing..." : editId ? "Update Category" : "Add Category"}
          </button>
        </form>

        <button onClick={() => navigate("/admin")} className="backBtn">
          ← Back to Dashboard
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="rightCard">
        <h3 className="listTitle">Categories</h3>

        <div className="categoryGrid">
          {categories.map((cat) => (
            <div key={cat.id} className={`categoryItem ${newCategoryId === cat.id ? "highlight" : ""}`}>
              <img src={cat.imageUrl} alt={cat.name} />
              <p>{cat.name}</p>

              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                <button
                  onClick={() => handleEdit(cat)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#4caf50",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Edit
                </button>

                <button className="btn1" onClick={() => handleDelete(cat)}>
                  Delete
                </button>
              </div>

              {newCategoryId === cat.id && <span className="newBadge">New</span>}
            </div>
          ))}
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .btn1 {
          padding: 4px 10px;
          border-radius: 12px;
          border: none;
          background: red;
          color: #fff;
          cursor: pointer;
          fontsize: 12px;
        }
        .page {
          min-height: 100vh;
          display: flex;
          gap: 30px;
          padding: 40px;
          background: #f3f5f7;
          font-family: "Poppins", sans-serif;
        }

        .leftCard {
          height: 350px;
          width: 380px;
          background: #fff;
          padding: 30px;
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
          margin-bottom: 20px;
        }

        .listTitle {
          margin-bottom: 15px;
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
          margin-top: 22px;
          padding: 14px;
          background: #fc8019;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          cursor: pointer;
        }

        .categoryGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 15px;
        }

        .categoryItem {
          position: relative;
          background: #fafafa;
          border-radius: 14px;
          padding: 10px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }

        .categoryItem img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 50%;
          margin-bottom: 8px;
        }

        .categoryItem p {
          font-size: 14px;
          font-weight: 600;
        }

        .highlight {
          border: 2px solid#fc8019;
          background: #fff3ed;
        }

        .newBadge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #fc8019;
          color: #fff;
          padding: 2px 8px;
          font-size: 11px;
          border-radius: 12px;
        }

        .backBtn {
          margin-top: 18px;
          padding: 10px 18px;
          border-radius: 20px;
          border: 2px solid#fc8019;
          background: transparent;
          color: #fc8019;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AddCategory;
