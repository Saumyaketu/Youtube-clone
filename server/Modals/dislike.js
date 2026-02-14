import mongoose from "mongoose";

const dislikeSchema = mongoose.Schema(
  {
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

dislikeSchema.index({ videoid: 1, viewer: 1 }, { unique: true });

export default mongoose.model("Dislike", dislikeSchema);
