import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null },   // null for Google-only users
    googleId: { type: String, default: null },   // null for local users
    image:    { type: String, default: null },   // Google profile picture
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
