import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user.userId;

    const users = await User.find(
      {
        _id: { $ne: currentUserId },
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { fullName, bio, profilePicture } = req.body;

    const updates = {};
    if (fullName && fullName.trim()) updates.fullName = fullName.trim();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (profilePicture) updates.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        isOnline: updatedUser.isOnline,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};