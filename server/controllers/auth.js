import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];
const otpStore = new Map();

export const login = async (req, res) => {
  const { email, name, image, state, phone, skipOtp } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    if (skipOtp) {
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        if (phone && !existingUser.phone) {
          existingUser.phone = phone;
          await existingUser.save();
        }
        return res.status(200).json({ result: existingUser });
      } else {
        const newUser = await users.create({
          email,
          name,
          image,
          phone: phone || null,
        });
        return res.status(200).json({ result: newUser });
      }
    }

    if (state) {
      const isSouthIndia = SOUTH_INDIAN_STATES.includes(state.toLowerCase());

      if (isSouthIndia) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otpCode, name, image, phone });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your YouTube Clone Login OTP",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Login Verification</h2>
              <p>Hello ${name || "User"},</p>
              <p>Your OTP for login is: <b style="font-size: 24px; color: #ff0000;">${otpCode}</b></p>
              <p>This OTP is valid for 10 minutes.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[OTP SYSTEM] EMAIL OTP sent to ${email}`);

        return res.status(200).json({
          requiresOtp: true,
          authMethod: "email",
          message: "Email OTP sent successfully",
        });
      } else {
        if (!phone) {
          return res
            .status(400)
            .json({
              message:
                "Phone number is required for OTP verification in your region.",
            });
        }

        return res.status(200).json({
          requiresOtp: true,
          authMethod: "firebase_phone",
          message: "Please complete Mobile OTP via Firebase",
        });
      }
    }

    return res
      .status(400)
      .json({ message: "State/Location data is required for login." });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp, phone, name, image, isFirebaseVerified } = req.body;

  try {
    if (isFirebaseVerified) {
      let existingUser = await users.findOne({ email });
      if (!existingUser) {
        existingUser = await users.create({ email, name, image, phone });
      } else if (phone && !existingUser.phone) {
        existingUser.phone = phone;
        await existingUser.save();
      }
      return res.status(200).json({ result: existingUser, message: "Firebase Mobile Login successful" });
    }

    if (!otpStore.has(email)) return res.status(400).json({ message: "OTP expired or invalid" });

    const storedData = otpStore.get(email);
    if (storedData.otpCode !== otp) return res.status(400).json({ message: "Incorrect OTP" });

    let existingUser = await users.findOne({ email });
    otpStore.delete(email); 

    if (!existingUser) {
      const newUser = await users.create({
        email,
        name: storedData.name,
        image: storedData.image,
        phone: storedData.phone || null,
      });
      return res.status(200).json({ result: newUser, message: "Email Login successful" });
    } else {
      if (storedData.phone && !existingUser.phone) {
        existingUser.phone = storedData.phone;
        await existingUser.save();
      }
      return res.status(200).json({ result: existingUser, message: "Email Login successful" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

export const updateProfile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelName, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: " User unavailable..." });
  }
  try {
    const updatedData = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelName: channelName,
          description: description,
        },
      },
      { new: true },
    );
    return res.status(200).json({ updatedData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkDownloadEligibility = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await users.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.plan !== "Free") {
      return res.status(200).json({ allowed: true, message: "Premium User" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDownload = user.lastDownloadDate
      ? new Date(user.lastDownloadDate)
      : null;
    if (lastDownload) lastDownload.setHours(0, 0, 0, 0);

    if (!lastDownload || lastDownload < today) {
      user.downloadsToday = 0;
      user.lastDownloadDate = today;
      await user.save();
    }

    if (user.downloadsToday < 1) {
      return res.status(200).json({ allowed: true });
    } else {
      return res
        .status(403)
        .json({ allowed: false, message: "Daily limit reached" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const trackDownload = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await users.findById(id);
    if (user && user.plan === "Free") {
      user.downloadsToday += 1;
      user.lastDownloadDate = new Date();
      await user.save();
    }
    res.status(200).json({ message: "Download tracked" });
  } catch (error) {
    res.status(500).json({ message: "Error tracking download" });
  }
};

export const syncWatchTime = async (req, res) => {
  const { id } = req.params;
  const { timeWatched } = req.body;

  try {
    const user = await users.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.plan === "Gold") return res.status(200).json({ allowed: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWatch = user.lastWatchDate ? new Date(user.lastWatchDate) : null;
    if (lastWatch) lastWatch.setHours(0, 0, 0, 0);

    if (!lastWatch || lastWatch < today) {
      user.watchTimeToday = 0;
      user.lastWatchDate = today;
    }

    user.watchTimeToday += timeWatched;
    user.lastWatchDate = new Date();
    await user.save();

    res.status(200).json({ watchTimeToday: user.watchTimeToday });
  } catch (error) {
    console.error("Sync watch time error:", error);
    res.status(500).json({ message: "Error syncing watch time" });
  }
};
