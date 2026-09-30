import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import videos from "../Modals/Video.js";

const hasValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getUserWithSubscriptions = (userId) =>
  users.findById(userId).populate(
    "subscriptions",
    "name channelName image description",
  );

export const subscribe = async (req, res) => {
  const { userId, channelId } = req.params;

  if (!hasValidId(userId) || !hasValidId(channelId)) {
    return res.status(400).json({ message: "Invalid user or channel ID" });
  }

  if (userId === channelId) {
    return res.status(400).json({ message: "You cannot subscribe to yourself" });
  }

  try {
    const [user, channel] = await Promise.all([
      users.findById(userId),
      users.findById(channelId),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!channel || !channel.channelName) {
      return res.status(404).json({ message: "Channel not found" });
    }

    await users.findByIdAndUpdate(userId, {
      $addToSet: { subscriptions: channelId },
    });

    return res.status(200).json({
      message: "Subscribed successfully",
      isSubscribed: true,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const unsubscribe = async (req, res) => {
  const { userId, channelId } = req.params;

  if (!hasValidId(userId) || !hasValidId(channelId)) {
    return res.status(400).json({ message: "Invalid user or channel ID" });
  }

  try {
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await users.findByIdAndUpdate(userId, {
      $pull: { subscriptions: channelId },
    });

    return res.status(200).json({
      message: "Unsubscribed successfully",
      isSubscribed: false,
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriptions = async (req, res) => {
  const { userId } = req.params;

  if (!hasValidId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await getUserWithSubscriptions(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ subscriptions: user.subscriptions || [] });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriptionVideos = async (req, res) => {
  const { userId } = req.params;

  if (!hasValidId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await getUserWithSubscriptions(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const channelNames = (user.subscriptions || [])
      .map((channel) => channel.channelName)
      .filter(Boolean);

    const subscriptionVideos = channelNames.length
      ? await videos
          .find({ videochannel: { $in: channelNames } })
          .sort({ createdAt: -1 })
      : [];

    return res.status(200).json({ videos: subscriptionVideos });
  } catch (error) {
    console.error("Get subscription videos error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  const { userId, channelId } = req.params;

  if (!hasValidId(userId) || !hasValidId(channelId)) {
    return res.status(400).json({ message: "Invalid user or channel ID" });
  }

  try {
    const user = await users.findById(userId).select("subscriptions");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      isSubscribed: (user.subscriptions || []).some(
        (subscriptionId) => subscriptionId.toString() === channelId,
      ),
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriberCount = async (req, res) => {
  const { channelId } = req.params;

  if (!hasValidId(channelId)) {
    return res.status(400).json({ message: "Invalid channel ID" });
  }

  try {
    const subscriberCount = await users.countDocuments({
      subscriptions: channelId,
    });

    return res.status(200).json({ subscriberCount });
  } catch (error) {
    console.error("Get subscriber count error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};