import comment from "../Modals/comment.js";
import mongoose from "mongoose";

export const postComment = async (req, res) => {
  const commentData = req.body;
  const postComment = new comment(commentData);
  try {
    const savedData = await postComment.save();
    return res.status(200).json({ comment: true, newComment: savedData });
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllComment = async (req, res) => {
  const { videoId } = req.params;
  try {
    const commentVideo = await comment.find({ videoid: videoId });
    return res.status(200).json({ commentVideo });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteComment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
}
};

export const editComment = async (req, res) => {
    const { id: _id } = req.params;
    const { commentbody } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("Comment unavailable");
    }
    try {
        const updateComment = await comment.findByIdAndUpdate(_id, {
            $set: { commentbody: commentbody },
        }, { new: true });
        res.status(200).json({ comment: true, updatedComment: updateComment });
    } catch (error) {
      console.error("Error updating comment:", error);
      return res.status(500).json({ message: "Something went wrong" });
  }
};
