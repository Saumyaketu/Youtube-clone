import watchlater from "../Modals/watchlater.js";

export const handleWatchlater = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existingWatchlater = await watchlater.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (existingWatchlater) {
      await watchlater.findByIdAndDelete(existingWatchlater._id);
      return res.status(200).json({watchlater: false});
    } else {
      await watchlater.create({ viewer: userId, videoid: videoId });
      return res.status(200).json({watchlater: true});
    }
  } catch (error) {
    console.error("Watchlater error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllWatchlaterVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const watchlaterVideo = await watchlater
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(watchlaterVideo);
  } catch (error) {
    console.error("Error fetching watchlater videos:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getWatchLaterStatus = async (req, res) => {
  const { videoId, userId } = req.params;
  try {
    const existing = await watchlater.findOne({
      viewer: userId,
      videoid: videoId,
    });
    return res.status(200).json({ watchlater: !!existing });
  } catch (error) {
    console.error("Status error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
