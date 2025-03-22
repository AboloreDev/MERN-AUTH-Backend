import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import transporter from "../Config/nodemailer.js";

export const register = async (req, res) => {
  // get the name, email, password from the body
  const { email, username, password } = req.body;

  // Validation checks
  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, username, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    // Generate a JSON Web Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // send a welcome email notification
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Authentication",
      text: `Hello, you have successfully registered with MyApp! Here is your email id: ${email}`,
    };

    // send the mail
    await transporter.sendMail(mailOptions);

    // SEND THE JSON Web Token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    // Send a response
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create a new user",
      error: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  // get the email and password from the body
  const { email, password } = req.body;

  //   validation check
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Password are required" });
  }

  try {
    // check for user
    const user = await User.findOne({ email });
    // check for user in database
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // check for passeword
    const isMatch = await bcryptjs.compare(password, user.password);
    // IF IT DOESNT MATCH
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    // if the user exist in the database and password is a match then generate a token for userAuthentication
    // Generate a JSON Web Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // SEND THE JSON Web Token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    // Send a response
    return res
      .status(200)
      .json({ success: true, message: "User Logged in successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // /CLEAR COOKIES
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    // Send a response to the server
    return res
      .status(200)
      .json({ success: true, message: "User Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error... Logout Failed",
      error: error.message,
    });
  }
};

// verification otp to user email address
export const verifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    // find user by Id in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // check if user is verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }
    // if user is not verified,
    // generate a random 6 digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // save the OTP and expiry time in database
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 1000; // 1 hour

    await user.save();

    // send OTP to user's email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your email",
      text: `Your OTP is: ${otp}. Do not share with anyone.`,
    };

    // send the mail
    await transporter.sendMail(mailOptions);

    // Send a response
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// get the OTP and verify the account
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  // validation check
  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    // find the user by id in the database
    const user = await User.findById(userId);

    // check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // check if OTP is valid and not expired
    if (
      user.verifyOtp?.toString() === otp.trim() &&
      Date.now() < new Date(user.verifyOtpExpiresAt).getTime()
    ) {
      // if OTP is valid, mark the user as verified
      user.isVerified = true;
      // reset the otp
      user.verifyOtp = "";
      user.verifyOtpExpiresAt = 0;
      await user.save();

      // Send a response
      return res
        .status(200)
        .json({ success: true, message: "Email verified successfully" });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or OTP expired",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify email",
      error: error.message,
    });
  }
};

// check if user isAuthenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: "Unauthorized", error: error.message });
  }
};

// PASSWORD RESET OTP
export const sendPasswordOtp = async (req, res) => {
  // get the email from the body
  const { email } = req.body;
  // validation check
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    // check if the email exist in the database
    const user = await User.findOne({ email });

    // if user does not exist, return error
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // generate a random 6 digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // save the OTP and expiry time in database
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiresAt = Date.now() + 24 * 60 * 1000; // 1 hour
    await user.save();

    // send OTP to user's email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password",
      text: `Your Password Reset  OTP is: ${otp}. Use this OTP to proceed with resetting your password.`,
    };

    // send the mail
    await transporter.sendMail(mailOptions);

    // Send a response
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Can't send link, Server Error: ",
      error: error.message,
    });
  }
};

// verify otp and reset user password
export const resetUserPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(401).json({
      message: "Email, OTP nad New Password is required",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    if ((user.resetPasswordOtp = "" || user.resetPasswordOtp !== otp)) {
      return res.status(403).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetUserPassword < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "OTP expired",
      });
    }

    // If all is clear, hash the password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    // Update password in database
    user.password = hashedPassword;

    // reset all values
    user.resetPasswordOtp = "";
    user.resetPasswordOtpExpiresAt = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password... Server error: ",
      message: error.message,
    });
  }
};
