import video from "../Modals/Video.js";
import like from "../Modals/liked.js";
import dislike from "../Modals/dislike.js";

export const handleLike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existingLike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });
    const existingDislike = await dislike.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (existingLike) {
      await like.findByIdAndDelete(existingLike._id);
    } else {
      await like.create({ viewer: userId, videoid: videoId });

      if (existingDislike) {
        await dislike.findByIdAndDelete(existingDislike._id);
      }
      const likeCount = await like.countDocuments({ videoid: videoId });
      const dislikeCount = await dislike.countDocuments({ videoid: videoId });

      await video.findByIdAndUpdate(videoId, {
        Like: likeCount,
        Dislike: dislikeCount,
      });

      return res.status(200).json({
        liked: !existingLike,
        disliked: false,
        likeCount,
        dislikeCount,
      });
    }
  } catch (error) {
    console.error("Like error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const handleDislike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existingDislike = await dislike.findOne({
      viewer: userId,
      videoid: videoId,
    });
    const existingLike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });

    if (existingDislike) {
      await dislike.findByIdAndDelete(existingDislike._id);
    } else {
      await dislike.create({ viewer: userId, videoid: videoId });

      if (existingLike) {
        await like.findByIdAndDelete(existingLike._id);
      }
      const likeCount = await like.countDocuments({ videoid: videoId });
      const dislikeCount = await dislike.countDocuments({ videoid: videoId });

      await video.findByIdAndUpdate(videoId, {
        Like: likeCount,
        Dislike: dislikeCount,
      });

      return res.status(200).json({
        liked: false,
        disliked: !existingDislike,
        likeCount,
        dislikeCount,
      });
    }
  } catch (error) {
    console.error("Dislike error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllLikedVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const likedVideo = await like
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(likedVideo);
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getLikeStatus = async (req, res) => {
  const { videoId, userId } = req.params;
  try {
    const isLiked = await like.findOne({ viewer: userId, videoid: videoId });
    const isDisliked = await dislike.findOne({
      viewer: userId,
      videoid: videoId,
    });
    const videoData = await video.findById(videoId);

    return res.status(200).json({
      isLiked: !!isLiked,
      isDisliked: !!isDisliked,
      likes: videoData.Like || 0,
      dislikes: videoData.Dislike || 0,
    });
  } catch (error) {
    console.error("Status error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
