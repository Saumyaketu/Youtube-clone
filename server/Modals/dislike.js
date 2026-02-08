import mongoose from "mongoose";

const dislikeSchema = mongoose.Schema({
  viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  videoid: { type: mongoose.Schema.Types.ObjectId, ref: "videofiles" },
});

export default mongoose.model("Dislike", dislikeSchema);
