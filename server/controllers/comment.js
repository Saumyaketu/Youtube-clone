import comment from "../Modals/comment.js";
import CommentLike from "../Modals/CommentLike.js";
import CommentDislike from "../Modals/CommentDislike.js";
import mongoose from "mongoose";

export const postComment = async (req, res) => {
  const commentData = req.body;

  const regex = /[^\p{L}\p{N}\s.,!?'"-]/u;
  if (regex.test(commentData.commentbody)) {
    return res
      .status(400)
      .json({ message: "Comments cannot contain special characters (@, #, $, etc)." });
  }

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
    const commentVideo = await comment.find({ videoid: videoId }).sort({ commentedon: -1 });
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
    await CommentLike.deleteMany({ commentid: _id });
    await CommentDislike.deleteMany({ commentid: _id });
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editComment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;

  const regex = /[^\p{L}\p{N}\s.,!?'"-]/u;
  if (regex.test(commentbody)) {
    return res
      .status(400)
      .json({ message: "Comments cannot contain special characters (@, #, $, etc)." });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Comment unavailable");
  }
  try {
    const updateComment = await comment.findByIdAndUpdate(
      _id,
      {
        $set: { commentbody: commentbody },
      },
      { new: true },
    );
    res.status(200).json({ comment: true, updatedComment: updateComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const existingLike = await CommentLike.findOne({
      commentid: commentId,
      userid: userId,
    });
    const existingDislike = await CommentDislike.findOne({
      commentid: commentId,
      userid: userId,
    });

    let updateQuery = {};

    if (existingLike) {
      await CommentLike.findByIdAndDelete(existingLike._id);
      updateQuery = { $inc: { likes: -1 } };
    } else {
      await CommentLike.create({ commentid: commentId, userid: userId });
      updateQuery = { $inc: { likes: 1 } };
      if (existingDislike) {
        await CommentDislike.findByIdAndDelete(existingDislike._id);
        updateQuery.$inc.dislikes = -1;
      }
    }

    const updatedComment = await comment.findByIdAndUpdate(
      commentId,
      updateQuery,
      { new: true }
    );

    res.status(200).json({ updatedComment });
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const existingDislike = await CommentDislike.findOne({
      commentid: commentId,
      userid: userId,
    });
    const existingLike = await CommentLike.findOne({
      commentid: commentId,
      userid: userId,
    });

    let updateQuery = {};

    if (existingDislike) {
      await CommentDislike.findByIdAndDelete(existingDislike._id);
      updateQuery = { $inc: { dislikes: -1 } };
    } else {
      await CommentDislike.create({ commentid: commentId, userid: userId });
      updateQuery = { $inc: { dislikes: 1 } };
      if (existingLike) {
        await CommentLike.findByIdAndDelete(existingLike._id);
        updateQuery.$inc.likes = -1;
      }
    }

    const updatedComment = await comment.findByIdAndUpdate(
      commentId,
      updateQuery,
      { new: true }
    );

    if (updatedComment.dislikes >= 2) {
      await comment.findByIdAndDelete(commentId);
      CommentLike.deleteMany({ commentid: commentId }).catch(console.error);
      CommentDislike.deleteMany({ commentid: commentId }).catch(console.error);
      return res.status(200).json({ commentDeleted: true, commentId });
    }

    return res.status(200).json({ updatedComment });
  } catch (error) {
    console.error("Dislike comment error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
