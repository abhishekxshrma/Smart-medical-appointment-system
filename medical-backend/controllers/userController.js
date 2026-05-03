const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Get the logged in user's profile
 */
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return sendError(res, "NOT_FOUND", "User not found", 404);
    }
    return sendSuccess(res, user, "Profile fetched successfully");
  } catch (err) {
    console.error("[getProfile]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

/**
 * Update the logged in user's profile
 */
async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, "NOT_FOUND", "User not found", 404);
    }

    const {
      name,
      age,
      gender,
      phone,
      address,
      bloodGroup,
      allergies,
      medicalHistory,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age ? Number(age) : null;
    if (gender !== undefined) user.gender = gender;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (allergies !== undefined) user.allergies = allergies;
    if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;

    // Handle file upload if present
    if (req.file) {
      // Save the relative URL to the database
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Return the updated user (excluding password)
    const updatedUser = user.toObject();
    delete updatedUser.password;

    return sendSuccess(res, updatedUser, "Profile updated successfully");
  } catch (err) {
    console.error("[updateProfile]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
