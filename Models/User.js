import mongoose from "mongoose";

// User schema for the current user
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpiresAt: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    resetPasswordOtp: { type: String, default: "" },
    resetPasswordOtpExpiresAt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create a model
const User = mongoose.model("User", userSchema);

// Export the User model
export default User;
