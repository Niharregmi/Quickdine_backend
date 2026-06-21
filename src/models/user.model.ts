import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: null },
    phoneNumber: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);