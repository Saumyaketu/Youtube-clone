import mongoose from "mongoose";
import users from "../Modals/Auth.js";

export const login = async (req, res) => {
  const { email, name, image } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      try {
        const newUser = await users.create({ email, name, image });
        return res.status(200).json({ result: newUser });
      } catch (error) {
        console.error("User creation error:", error);
        return res.status(500).json({ message: "Error creating user" });
      }
    } else {
      return res.status(200).json({ result: existingUser });
    }
  } catch (error) {
    console.error("Database search error:", error);
    return res.status(500).json({ message: "Something went wrong" });
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

    if (user.isPremium) {
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
    if (user && !user.isPremium) {
      user.downloadsToday += 1;
      user.lastDownloadDate = new Date();
      await user.save();
    }
    res.status(200).json({ message: "Download tracked" });
  } catch (error) {
    res.status(500).json({ message: "Error tracking download" });
  }
};
