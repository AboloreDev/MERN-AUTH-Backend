import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  console.log("Cookies received:", req.cookies);
  // get the token from the cookie
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Not Authorized. Please Login again" });
  }

  try {
    // decode the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.id) {
      req.body.userId = decodedToken.id;
    } else {
      return res.status(403).json({
        success: false,
        message: "Not Authorized. Please Login again",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

export default userAuth;
