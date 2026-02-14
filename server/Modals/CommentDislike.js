import mongoose from "mongoose";

const commentDislikeSchema = mongoose.Schema(
  {
    commentid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      required: true,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true },
);

commentDislikeSchema.index({ commentid: 1, userid: 1 }, { unique: true });

export default mongoose.model("CommentDislike", commentDislikeSchema);
