import Razorpay from "razorpay";
import crypto from "crypto";
import users from "../Modals/Auth.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_PRICES = {
  Bronze: 1000, // ₹10
  Silver: 5000, // ₹50
  Gold: 10000, // ₹100
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const createOrder = async (req, res) => {
  try {
    if (!req.body || !req.body.plan) {
      return res
        .status(400)
        .json({ message: "Payment plan is missing from request" });
    }

    const { plan } = req.body;
    const amount = PLAN_PRICES[plan];

    if (!amount)
      return res.status(400).json({ message: "Invalid plan selected" });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Error creating Razorpay order");

    res.json(order);
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).send(error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
      email,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await users.findByIdAndUpdate(userId, {
        $set: { plan: plan },
      });

      if (email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Invoice: YouTube Clone ${plan} Plan Subscription`,
          html: `
            <h2>Thank you for your purchase!</h2>
            <p>Your payment was successful. Here is your invoice:</p>
            <table border="1" cellpadding="10" style="border-collapse: collapse;">
              <tr><th align="left">Plan</th><td>${plan}</td></tr>
              <tr><th align="left">Amount Paid</th><td>₹${PLAN_PRICES[plan] / 100}</td></tr>
              <tr><th align="left">Transaction ID</th><td>${razorpay_payment_id}</td></tr>
              <tr><th align="left">Order ID</th><td>${razorpay_order_id}</td></tr>
            </table>
            <p>You can now enjoy your upgraded watch time limits and unlimited downloads!</p>
          `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) console.error("Error sending email:", err);
        });
      }

      res.status(200).json({
        message: "Payment verified successfully",
        isPremium: true,
      });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
