import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String },
    channelName: { type: String },
    description: { type: String },
    image: { type: String },
    phone: { type: String },
    state: { type: String },
    joinedOn: { type: Date, default: Date.now },
    plan: {
      type: String,
      enum: ["Free", "Bronze", "Silver", "Gold"],
      default: "Free",
    },
    downloadsToday: { type: Number, default: 0 },
    lastDownloadDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("user", userSchema);
