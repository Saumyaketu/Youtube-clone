import Razorpay from "razorpay";
import crypto from "crypto";
import users from "../Modals/Auth.js";
import dotenv from "dotenv";

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 50000, // Amount 50000 = ₹500
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
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await users.findByIdAndUpdate(userId, {
        $set: { isPremium: true },
      });

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
