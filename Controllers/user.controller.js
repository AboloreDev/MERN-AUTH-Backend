import User from "../Models/User.js";

export const getUserData = async (req, res) => {
  try {
    // Get the User Id from the body
    const { userId } = req.body;

    // Find the user Id
    const user = await User.findById(userId);

    // If no userId is found
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If user is found
    res.json({
      success: true,
      userData: {
        name: user.username,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
      error: error.message,
    });
  }
};
