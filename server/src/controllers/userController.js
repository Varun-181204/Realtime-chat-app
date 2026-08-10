import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(
      {
        _id: { $ne: req.user.userId },
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