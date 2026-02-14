import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String },
    channelName: { type: String },
    description: { type: String },
    image: { type: String },
    joinedOn: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("user", userSchema);
