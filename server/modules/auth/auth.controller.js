import User from "../user/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { jwtConfig } from "../../config/jwt.js";



import { Settings } from "../settings/settings.model.js";
import { sendOtpEmail } from "../auth/auth-email.service.js";
import { getOrCreateWallet } from "../wallet/wallet.service.js";

/**
 * Helper: generate 6-digit OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateCustomerId = () => {
  return "CUST-" + crypto.randomUUID();
};

/**
 * Helper: generate JWT
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id
    },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );

  return { accessToken, refreshToken };
};


/**
 * ===============================
 * REGISTER USER (WITH EMAIL OTP)
 * ===============================
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Generate unique referral code (e.g., AD1234)
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 5️⃣ Check if referred by someone (if ref code provided in req.body)
    let referredBy = null;
    if (req.body.ref) {
        const referrer = await User.findOne({ referralCode: req.body.ref });
        if (referrer) referredBy = referrer._id;
    }

    // 6️⃣ Check Settings (Mandatory OTP for Signup now)
    console.log("DEBUG: Signup - Generating mandatory OTP...");
    const otp = generateOtp();
    const otpData = {
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    };

    // Send Email
    console.log("DEBUG: Sending Signup OTP email to:", email, "Code:", otp);
    await sendOtpEmail(email, otp);

    // 7️⃣ Create user
    const user = await User.create({
      customerId: generateCustomerId(),
      name,
      email,
      passwordHash,
      referralCode,
      referredBy,
      isEmailVerified: false,
      emailOtp: otpData
    });

    console.log("DEBUG: User created. ID:", user._id);

    // 7.5 Create Wallet immediately
    await getOrCreateWallet(user._id);

    // 8️⃣ Create tokens for immediate login (auto-login after signup)
    const accessToken = jwt.sign(
        { userId: user._id, customerId: user.customerId, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    // Send refresh token as secure cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production"
    });

    console.log("DEBUG: Signup complete. Auto-login tokens created for user:", user._id);

    // 8️⃣ Response with tokens for immediate login
    return res.status(200).json({
        message: "Registration successful. Please verify your email.",
        requiresOtp: true,
        email: user.email,
        accessToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            customerId: user.customerId,
            role: user.role,
            is2faEnabled: user.is2faEnabled
        }
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Registration failed"
    });
  }
};

/**
 * ===============================
 * VERIFY EMAIL OTP
 * ===============================
 */
 // /api/auth/verify-otp
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.emailOtp) {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    // 1️⃣ Validate OTP
    if (
      user.emailOtp.code !== otp ||
      user.emailOtp.expiresAt < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    // 2️⃣ Mark email verified
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    await user.save();

    // 3️⃣ Issue JWT (Same logic as login) - Issue tokens so they are logged in immediately
    const accessToken = jwt.sign(
        { userId: user._id, customerId: user.customerId, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
      
    // Refresh token stored securely for React usage
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json({
      message: "Email verified successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        customerId: user.customerId,
        is2faEnabled: user.is2faEnabled
      }
    });
    

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      message: "Verification failed"
    });
  }
};
/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.isActive === false) {
    return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
  }

  // 1. Check if email is verified (Account Lock until verified)
  if (!user.isEmailVerified) {
    console.log("DEBUG LOGIN: Account not verified. Triggering OTP verification...");
    const otp = generateOtp();
    user.emailOtp = {
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    };
    await user.save();
    
    try {
      await sendOtpEmail(user.email, otp);
    } catch (err) {
      console.error("DEBUG LOGIN: Failed to send OTP:", err);
    }

    return res.status(403).json({ 
        message: "Email verification required. OTP sent to email.",
        requiresOtp: true,
        email: user.email 
    });
  }

  const settings = await Settings.getSingleton();

  // Requirement: 
  // 1. Mandatory if settings.emailVerificationRequired is true (Global Force 2FA)
  // 2. Optional if user has it enabled personally AND it is allowed by admin (settings.enable2FA)
  const isMandatory = settings.emailVerificationRequired && user.role !== "ADMIN";
  const isPersonalEnabled = settings.enable2FA && user.is2faEnabled;

  if (isMandatory || isPersonalEnabled) {
      console.log("DEBUG LOGIN: 2FA challenge triggered. Mandatory:", isMandatory, "Personal:", isPersonalEnabled);
      console.log("DEBUG LOGIN: 2FA is ON. Generating OTP..."); // LOG
      // Generate and send new OTP
      const otp = generateOtp();
      user.emailOtp = {
          code: otp,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
      };
      await user.save();
      console.log("DEBUG LOGIN: OTP generated and saved to user:", user.email); // LOG
      
      try {
        await sendOtpEmail(user.email, otp);
        console.log("DEBUG LOGIN: Email sent to", user.email); // LOG
      } catch (err) {
        console.error("DEBUG LOGIN: Failed to send OTP:", err);
      }

      return res.status(403).json({ 
          message: "Email verification required. OTP sent to email.",
          requiresOtp: true,
          email: user.email 
      });
  }
  console.log("DEBUG LOGIN: 2FA is OFF. Proceeding to token generation."); // LOG

  const accessToken = jwt.sign(
    { userId: user._id, customerId: user.customerId, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Refresh token stored securely for React usage
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production"
  });

  res.json({
    message: "Login successful",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      customerId: user.customerId,
      role: user.role,
      is2faEnabled: user.is2faEnabled
    }
  });
};


export const refreshToken = async (req, res) => {
    const refreshCookie = req.cookies.refreshToken;
    const authHeader = req.headers.authorization;
    console.log("DEBUG: Refresh request - Cookie:", !!refreshCookie, "Auth Header:", !!authHeader);
  
    let decoded;
    let triedRefresh = false;

    if (refreshCookie) {
      triedRefresh = true;
      try {
        decoded = jwt.verify(refreshCookie, process.env.JWT_REFRESH_SECRET);
        console.log("✅ DEBUG: Refresh token verified from cookie");
      } catch (error) {
        console.warn("⚠️  DEBUG: Refresh cookie invalid or expired:", error.message);
      }
    }

    if (!decoded) {
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const accessToken = authHeader.split(" ")[1];
        console.log("DEBUG: No valid refresh cookie; trying access token fallback");
        try {
          const accessDecoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
          decoded = { userId: accessDecoded.userId || accessDecoded.id };
          console.log("✅ DEBUG: Access token valid! Will issue new tokens for user:", decoded.userId);
        } catch (error) {
          console.warn("⚠️  DEBUG: Access token fallback failed:", error.message);
        }
      } else {
        console.warn("⚠️  DEBUG: No authorization header found in request");
      }
    }

    if (!decoded) {
      if (triedRefresh) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      console.warn("❌ DEBUG: Cannot refresh - no valid refresh cookie or access token available");
      return res.status(401).json({ message: "Refresh token missing" });
    }

    try {
      const user = await User.findById(decoded.userId || decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.isActive === false) {
        return res.status(403).json({ message: "Account is suspended" });
      }

      const newAccessToken = jwt.sign(
        { userId: user._id, customerId: user.customerId, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production"
      });

      console.log("✅ DEBUG: New tokens created and sent successfully for user:", user.email);

      res.json({
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      return res.status(500).json({ message: "Failed to refresh token" });
    }
  };


export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "JWT is valid",
            user
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none"
    });
  
    return res.json({
      success: true,
      message: "Logged out successfully"
    });
};

/**
 * ===============================
 * FORGOT PASSWORD (SEND OTP)
 * ===============================
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security, or keep it simple for now as per app style
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    user.emailOtp = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    };
    await user.save();

    await sendOtpEmail(email, otp, "Password Reset");

    res.json({ message: "Reset OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send reset OTP" });
  }
};

/**
 * ===============================
 * RESET PASSWORD (VERIFY & UPDATE)
 * ===============================
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.emailOtp) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.emailOtp.code !== otp || user.emailOtp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.emailOtp = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
  