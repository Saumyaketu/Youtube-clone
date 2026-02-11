import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    commentbody: { type: String, required: true },
    usercommented: { type: String },
    commentedon: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("comment", commentSchema);
