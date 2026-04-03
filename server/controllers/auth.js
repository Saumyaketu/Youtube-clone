import mongoose from "mongoose";
import users from "../Modals/Auth.js";

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

    const isSouthIndia =
      state && SOUTH_INDIAN_STATES.includes(state.toLowerCase());
    if (state && isSouthIndia) {
      const otpCode = "123456";
      otpStore.set(email, { otpCode, name, image, state, phone });

      console.log(`[OTP SYSTEM] EMAIL OTP: ${otpCode} sent to ${email}`);
      return res
        .status(200)
        .json({ requiresOtp: true, message: "Email OTP sent" });
    }
    return res.status(400).json({ message: "Invalid auth flow state" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore.has(email))
    return res.status(400).json({ message: "OTP expired or invalid" });

  const storedData = otpStore.get(email);

  if (storedData.otpCode !== otp) {
    return res.status(400).json({ message: "Incorrect OTP" });
  }

  try {
    const existingUser = await users.findOne({ email });
    otpStore.delete(email);

    if (!existingUser) {
      const newUser = await users.create({
        email,
        name: storedData.name,
        image: storedData.image,
        phone: storedData.phone || null,
      });
      return res
        .status(200)
        .json({ result: newUser, message: "Login successful" });
    } else {
      if (storedData.phone && !existingUser.phone) {
        existingUser.phone = storedData.phone;
        await existingUser.save();
      }
      return res
        .status(200)
        .json({ result: existingUser, message: "Login successful" });
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
