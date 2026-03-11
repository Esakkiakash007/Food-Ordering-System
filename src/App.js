// src/App.js

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AddCategory from "./pages/AddCategory";
import AddFood from "./pages/AddFood";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import ViewOrders from "./pages/ViewOrders";
import Reviews from "./pages/Reviews";
import OrderHistory from "./pages/OrderHistory";
import ViewFeedback from "./pages/ViewFeedback";
import LocationPage from "./pages/LocationPage";
import AddRestaurant from "./pages/AddRestaurant";
import SetRestaurantMenu from "./pages/SetRestaurantMenu";
import RestaurantDetails from "./pages/RestaurantDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* User Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/restaurant/:restaurantId/:categoryName" element={<RestaurantDetails />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/add-food" element={<AddFood />} />
        <Route path="/admin-orders" element={<ViewOrders />} />
        <Route path="/view-feedback" element={<ViewFeedback />} />
        <Route path="/add-restaurant" element={<AddRestaurant />} />
        <Route path="/set-restaurant-menu" element={<SetRestaurantMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
