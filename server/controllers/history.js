import video from "../Modals/Video.js";
import history from "../Modals/history.js";

export const handleHistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;

  try {
    await history.findOneAndUpdate(
      { viewer: userId, videoid: videoId },
      { $set: { watchedon: new Date() } },
      { upsert: true, new: true },
    );
    return res.status(200).json({ history: true });
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const handleView = async (req, res) => {
  const { videoId } = req.params;
  try {
    await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    return res.status(200).json({ message: "View counted" });
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllHistoryVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const historyVideo = await history
      .find({ viewer: userId })
      .sort({ watchedon: -1 })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(historyVideo);
  } catch (error) {
    console.error("Error fetching history videos:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const removeHistory = async (req, res) => {
  const { id } = req.params;
  try {
    await history.findByIdAndDelete(id);
    return res.status(200).json({ message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error" });
  }
};
