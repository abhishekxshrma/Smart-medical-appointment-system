const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "compounder", "admin"],
    default: "patient",
  },
  // ── User Profile ───────────────────────────────────────────────
  name: { type: String, default: "" },
  age: { type: Number, default: null },
  gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  bloodGroup: { type: String, default: "" },
  allergies: { type: String, default: "" },
  medicalHistory: { type: String, default: "" },
  profileImage: { type: String, default: "" }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
