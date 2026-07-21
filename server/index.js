import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ================= RAZORPAY SETUP =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= NODEMAILER SETUP =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer error:", error);
  } else {
    console.log("✅ Nodemailer ready to send emails");
  }
});

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// ================= RAZORPAY CREATE ORDER API =================
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ ok: false, msg: "Error creating Razorpay order" });
  }
});

// ================= SEND ORDER EMAIL (UPDATED) =================
app.post("/api/send-order-mail", async (req, res) => {
  try {
    const { userName, items, totalAmount, location, address, restaurantName, paymentMethod } = req.body;

    if (!userName || !items || !totalAmount) {
      return res.status(400).json({ ok: false, msg: "Missing fields" });
    }

    const isCancelled = userName.includes("Order Cancelled");

    const subject = isCancelled ? "❌ Order Cancelled" : "🛒 New Order Placed";
    const heading = isCancelled ? "❌ Order Cancelled" : "🛒 New Food Order Received";

    const userDisplay = isCancelled
      ? `<h2 style="color:red;">${userName.replace("(Order Cancelled)", "")}</h2>
         <span style="background:red;color:white;padding:6px 14px;border-radius:20px;font-weight:bold;">CANCELLED</span>`
      : `<h2 style="color:#e24a0b;">${userName}</h2>
         <span style="background:green;color:white;padding:6px 14px;border-radius:20px;font-weight:bold;">NEW ORDER</span>`;

    let rows = items
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.foodName}</td>
          <td>${item.qty}</td>
          <td>₹${item.price}</td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <h1>${heading}</h1>
      <hr/>
      <div>${userDisplay}</div>

      <p><b>Location:</b> ${location || "N/A"}</p>
      <p><b>Address:</b> ${address || "N/A"}</p>
      <p><b>From the Restaurant Name:</b> ${restaurantName || "N/A"}</p>
      <p><b>Payment Status:</b> Paid through ${paymentMethod || "N/A"}</p>

      <br/>

      <table border="1" cellpadding="8" cellspacing="0" width="100%">
        <tr style="background:#f2f2f2;">
          <th>S.No</th>
          <th>Food Item</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
        ${rows}
      </table>

      <h3>Total Amount: ₹${totalAmount}</h3>
      <br/>
      <p>– Food Zone System 🍽️</p>
    `;

    await transporter.sendMail({
      from: `"Food Zone Orders" <${process.env.EMAIL_USER}>`,
      to: "foodorderingsystem93@gmail.com",
      subject,
      html,
    });

    res.json({ ok: true, msg: "Order mail sent successfully" });
  } catch (error) {
    console.error("Order Mail Error:", error);
    res.status(500).json({ ok: false, msg: "Mail sending failed" });
  }
});

// ================= SEND FEEDBACK EMAIL =================
app.post("/api/send-feedback-mail", async (req, res) => {
  try {
    const { name, email, message, rating, stars, submittedOn } = req.body;

    if (!name || !email || !message || !rating) {
      return res.status(400).json({ ok: false, msg: "Missing fields" });
    }

    const adminHtml = `
      <h1 style="color:#ff6a00;">New Feedback Received 💬</h1>
      <hr/>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Rating:</b> ${rating} / 5</p>
      <p><b>Stars:</b> ${stars || ""}</p>
      <p><b>Submitted On:</b> ${submittedOn || "N/A"}</p>
      <br/>
      <p><b>Message:</b></p>
      <div style="padding:12px;border:1px solid #ddd;border-radius:8px;background:#f9f9f9;">
        ${message}
      </div>
      <br/>
      <p>– Food Zone Feedback System ⭐</p>
    `;

    await transporter.sendMail({
      from: `"Food Zone Feedback" <${process.env.EMAIL_USER}>`,
      to: "foodorderingsystem93@gmail.com",
      subject: "💬 New Feedback Submitted",
      html: adminHtml,
    });

    const thankYouHtml = `
      <h2 style="color:#ff6a00;">Thank You for Your Feedback ❤️</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>Thank you for sharing your feedback with us.</p>
      <p>We have received your feedback successfully.</p>
      <p><b>Your Rating:</b> ${rating} / 5 ${stars || ""}</p>
      <p><b>Your Feedback:</b> ${message}</p>
      <p><b>Submitted On:</b> ${submittedOn || "N/A"}</p>
      <br/>
      <p>We appreciate your support 🙏</p>
      <p>– Food Zone Team 🍽️</p>
    `;

    await transporter.sendMail({
      from: `"Food Zone Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Thank you for your feedback",
      html: thankYouHtml,
    });

    res.json({ ok: true, msg: "Feedback mail sent successfully" });
  } catch (error) {
    console.error("Feedback Mail Error:", error);
    res.status(500).json({ ok: false, msg: "Feedback mail sending failed" });
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});