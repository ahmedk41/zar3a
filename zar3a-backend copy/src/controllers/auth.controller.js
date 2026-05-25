// src/controllers/auth.controller.js
import { OAuth2Client } from "google-auth-library";
import { Op } from "sequelize";
import { User, FarmerProfile, AgroExpertProfile, SupplierProfile, BuyerProfile, RefreshToken, VerificationToken, PasswordResetOTP } from "../models/index.js";
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  decodeRefreshToken,
  generateToken,
} from "../utils/auth.js";
import { sendMail } from "../utils/mail.js";
import { generateOTP, hashOTP, verifyOTP, generateVerificationToken, isOTPExpired } from "../utils/otp.js";
import { otpEmailTemplate } from "../utils/emailTemplates.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: mint + store token pair ──────────────────────────────────────────

const issueTokens = async (user) => {
  const accessToken = createAccessToken(user.id, user.role);
  const { token: refreshToken, expiresAt } = createRefreshToken(user.id);

  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

// ── Strip passwordHash before sending to client ───────────────────────────────

const safeUser = (user) => {
  if (!user) return user;
  const userData = user.toJSON ? user.toJSON() : user;
  const { passwordHash, ...rest } = userData;
  return rest;
};

const sendVerificationEmail = async (user) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await VerificationToken.create({
    userId: user.id,
    token,
    type: 'EMAIL_VERIFY',
    expiresAt,
  });

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Zar3a Account</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 Welcome to Zar3a!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.fullName},</h2>
          <p>Thank you for joining Zar3a - your trusted agricultural platform! We're excited to help you grow your farming business.</p>
          <p>Please verify your email address to complete your registration:</p>
          <a href="${verifyUrl}" class="button">Verify My Email</a>
          <p><small>If the button doesn't work, copy and paste this link into your browser:<br>${verifyUrl}</small></p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with Zar3a, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 Zar3a. All rights reserved.</p>
          <p>Empowering farmers, connecting markets.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendMail({
    to: user.email,
    subject: '🌱 Verify Your Zar3a Account',
    html,
    text: `Hello ${user.fullName}, please verify your email by visiting: ${verifyUrl}`,
  });
};

const sendPasswordResetEmail = async (user) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await VerificationToken.create({
    userId: user.id,
    token,
    type: 'PASSWORD_RESET',
    expiresAt,
  });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Zar3a Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.fullName},</h2>
          <p>We received a request to reset your Zar3a account password. If you made this request, click the button below to set a new password:</p>
          <a href="${resetUrl}" class="button">Reset My Password</a>
          <p><small>If the button doesn't work, copy and paste this link into your browser:<br>${resetUrl}</small></p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email - your password will remain unchanged.
          </div>
          <p>For your security, never share this email or the reset link with anyone.</p>
        </div>
        <div class="footer">
          <p>© 2024 Zar3a. All rights reserved.</p>
          <p>Empowering farmers, connecting markets.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendMail({
    to: user.email,
    subject: '🔐 Reset Your Zar3a Password',
    html,
    text: `Hello ${user.fullName}, reset your password by visiting: ${resetUrl}. This link expires in 1 hour.`,
  });
};

// ── POST /auth/register ───────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { fullName, username, email, phone, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    if (await User.findOne({ where: { email: normalizedEmail } }))
      return res.status(409).json({ message: "Email already registered" });

    if (await User.findOne({ where: { username: normalizedUsername } }))
      return res.status(409).json({ message: "Username already taken" });

    const user = await User.create({
      fullName,
      username: normalizedUsername,
      email: normalizedEmail,
      phone,
      passwordHash: await hashPassword(password),
      role: null,
      isApproved: false,
    });

    try {
      await sendVerificationEmail(user);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Don't fail registration if email sending fails
    }

    // Frontend uses this ID to call the next profile endpoint
    res.status(201).json({ userId: user.id, message: 'Registration successful. Verification email sent.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
};

// ── POST /auth/choose-role/:userId ─────────────────────────────────────

export const chooseRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['FARMER', 'BUYER', 'SUPPLIER', 'AGRO_EXPERT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role || user.pendingRole) return res.status(400).json({ message: "Role already chosen" });

    if (role === 'AGRO_EXPERT') {
      // Create empty AgroExpertProfile immediately so approval can reference it
      await AgroExpertProfile.create({ userId });
      await User.update({ pendingRole: role, isApproved: false }, { where: { id: userId } });
    } else {
      await User.update({ role, isApproved: true }, { where: { id: userId } });
    }

    const updatedUser = await User.findByPk(userId, {
      include: [AgroExpertProfile]
    });
    res.json({ 
      message: "Role chosen successfully", 
      user: safeUser(updatedUser),
      status: role === 'AGRO_EXPERT' ? 'pending_approval' : 'active'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /auth/complete/expert/:userId  (multipart — CV file optional) ────────────────

export const completeExpertProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { academicDegree, experienceYears, bio } = req.body;
    const cvFile = req.file || req.files?.cv?.[0] || req.files?.cv_file?.[0] || (Array.isArray(req.files) ? req.files[0] : undefined);
    const cvFilePath = cvFile?.path ?? null;

    const user = await User.findByPk(userId);
    if (!user || (user.role !== 'AGRO_EXPERT' && user.pendingRole !== 'AGRO_EXPERT')) {
      return res.status(400).json({ message: "Invalid user or role" });
    }

    const existingProfile = await AgroExpertProfile.findOne({ where: { userId: user.id } });
    let profile;

    if (existingProfile) {
      await existingProfile.update({
        academicDegree,
        experienceYears: Number(experienceYears),
        cvFilePath,
        bio,
      });
      profile = existingProfile;
    } else {
      profile = await AgroExpertProfile.create({
        userId: user.id,
        academicDegree,
        experienceYears: Number(experienceYears),
        cvFilePath,
        bio,
      });
    }

    return res.status(201).json({ user: safeUser(user), profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /auth/complete/farmer/:userId ─────────────────────────────────────────

export const completeFarmerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { farmSize, soilType, location } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'FARMER') {
      return res.status(400).json({ message: "Invalid user or role" });
    }

    const profile = await FarmerProfile.create({ farmSize, soilType, location, userId: Number(userId) });
    res.json({ message: "Farmer setup complete", profile });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to complete profile" });
  }
};
// استكمال بيانات المشتري (Buyer)
export const  completeBuyerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    // هنا ممكن تضيف موديل BuyerProfile لو حابب تفصل بياناته
    // أو تحدث جدول الـ User مباشرة لو البيانات بسيطة
    res.json({ message: "Buyer profile updated" });
  } catch (err) {
    res.status(400).json({ error: "Failed to update buyer profile" });
  }
};

// استكمال بيانات المورد (Supplier)
export const completeSupplierProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { tradeLicense, location } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'SUPPLIER') {
      return res.status(400).json({ message: "Invalid user or role" });
    }

    const profile = await SupplierProfile.create({ tradeLicense, location, userId: Number(userId) });
    res.json({ message: "Supplier profile updated", profile });
  } catch (err) {
    res.status(400).json({ error: "Failed to update supplier profile" });
  }
};
// ── POST /auth/login ──────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const identifier = email.trim();
    const isEmail = identifier.includes("@");
    const normalizedEmail = identifier.toLowerCase();

    const whereClause = isEmail
      ? { email: normalizedEmail }
      : { username: identifier };

    const user = await User.findOne({
      where: whereClause,
      include: [FarmerProfile, AgroExpertProfile, SupplierProfile, BuyerProfile],
    });

    if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash)))
      return res.status(401).json({ message: "Invalid email/username or password" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account deactivated" });

    return res.json({ user: safeUser(user), ...(await issueTokens(user)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /auth/google ─────────────────────────────────────────────────────────

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name, email_verified } = ticket.getPayload();

    let user = await User.findOne({
      where: { [Op.or]: [{ googleId }, { email }] },
      include: [FarmerProfile, AgroExpertProfile, SupplierProfile, BuyerProfile],
    });

    if (!user) {
      user = await User.create({
        fullName: name ?? email.split("@")[0],
        email,
        googleId,
        role: "FARMER",
        authProvider: "GOOGLE",
        isVerified: !!email_verified,
      });
      // Create empty profile
      await FarmerProfile.create({ userId: user.id });
    } else if (!user.googleId) {
      await User.update(
        { googleId, authProvider: "GOOGLE" },
        { where: { id: user.id } }
      );
      user = await User.findOne({
        where: { id: user.id },
        include: [FarmerProfile, AgroExpertProfile, SupplierProfile, BuyerProfile],
      });
    }

    return res.json({ user: safeUser(user), ...(await issueTokens(user)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /auth/refresh ────────────────────────────────────────────────────────

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: "Refresh token required" });

    const payload = decodeRefreshToken(token);
    if (!payload || payload.type !== "refresh")
      return res.status(401).json({ message: "Invalid refresh token" });

    const stored = await RefreshToken.findOne({ where: { token } });
    if (!stored || stored.revoked || stored.expiresAt < new Date())
      return res.status(401).json({ message: "Refresh token expired or revoked" });

    // Rotate
    await RefreshToken.update({ revoked: true }, { where: { id: stored.id } });

    const user = await User.findByPk(stored.userId);
    return res.json(await issueTokens(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────

export const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token)
      await RefreshToken.update({ revoked: true }, { where: { token } });
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────

export const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: FarmerProfile, required: false },
        { model: AgroExpertProfile, required: false },
        { model: SupplierProfile, required: false },
        { model: BuyerProfile, required: false },
      ],
    });
    return res.json(safeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /auth/dashboard ───────────────────────────────────────────────────────

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: FarmerProfile, required: false },
        { model: AgroExpertProfile, required: false },
        { model: SupplierProfile, required: false },
        { model: BuyerProfile, required: false },
      ],
    });
    res.json(safeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, phone, email, tradeLicense, location, farmSize, soilType, specialty, academicDegree, experienceYears, bio } = req.body;
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: FarmerProfile, required: false },
        { model: AgroExpertProfile, required: false },
        { model: SupplierProfile, required: false },
        { model: BuyerProfile, required: false },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.update({ fullName, username, phone, email }, { where: { id: req.user.id } });

    if (user.role === 'SUPPLIER') {
      if (user.SupplierProfile) {
        await SupplierProfile.update({ tradeLicense, location }, { where: { userId: req.user.id } });
      } else {
        await SupplierProfile.create({ userId: req.user.id, tradeLicense, location });
      }
    }

    if (user.role === 'FARMER') {
      if (user.FarmerProfile) {
        await FarmerProfile.update({ farmSize, soilType, location }, { where: { userId: req.user.id } });
      } else {
        await FarmerProfile.create({ userId: req.user.id, farmSize, soilType, location });
      }
    }

    if (user.role === 'AGRO_EXPERT' || user.pendingRole === 'AGRO_EXPERT') {
      if (user.AgroExpertProfile) {
        await AgroExpertProfile.update({ academicDegree, experienceYears, bio }, { where: { userId: req.user.id } });
      } else {
        await AgroExpertProfile.create({ userId: req.user.id, academicDegree, experienceYears, bio });
      }
    }

    const updatedUser = await User.findByPk(req.user.id, {
      include: [
        { model: FarmerProfile, required: false },
        { model: AgroExpertProfile, required: false },
        { model: SupplierProfile, required: false },
        { model: BuyerProfile, required: false },
      ],
    });

    return res.json({ message: 'Profile updated successfully', user: safeUser(updatedUser) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.passwordHash) return res.status(400).json({ message: 'Password change unavailable for this account' });
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    await User.update({ passwordHash: await hashPassword(newPassword) }, { where: { id: req.user.id } });
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });

    try {
      await sendPasswordResetEmail(user);
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Still return success to prevent email enumeration attacks
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const record = await VerificationToken.findOne({ where: { token, type: 'PASSWORD_RESET', used: false } });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' });
    }
    const user = await User.findByPk(record.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.update({ passwordHash: await hashPassword(newPassword) }, { where: { id: user.id } });
    await VerificationToken.update({ used: true }, { where: { id: record.id } });
    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const record = await VerificationToken.findOne({ where: { token, type: 'EMAIL_VERIFY', used: false } });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification token is invalid or expired' });
    }
    await User.update({ isVerified: true }, { where: { id: record.userId } });
    await VerificationToken.update({ used: true }, { where: { id: record.id } });
    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN ONLY: Approve Expert ────────────────────────────────────────────────

export const getPendingExperts = async (req, res) => {
  try {
    const pendingExperts = await User.findAll({
      where: {
        pendingRole: 'AGRO_EXPERT',
        role: null,
      },
      include: [AgroExpertProfile],
    });

    return res.json(pendingExperts.map(safeUser));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const approveExpert = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [AgroExpertProfile]
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.pendingRole !== 'AGRO_EXPERT' || user.isApproved || user.role !== null) return res.status(400).json({ message: "User is not pending approval" });
    if (!user.AgroExpertProfile) return res.status(400).json({ message: "Expert profile not found" });

    await User.update({ role: 'AGRO_EXPERT', pendingRole: null, isApproved: true }, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      include: [AgroExpertProfile]
    });

    return res.json({
      message: "Expert approved successfully",
      user: safeUser(updatedUser)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rejectExpert = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.pendingRole !== 'AGRO_EXPERT' || user.isApproved || user.role !== null) return res.status(400).json({ message: "User is not pending approval" });

    await User.update({ pendingRole: null, role: null, isApproved: false }, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId);
    return res.json({
      message: "Expert request rejected successfully",
      user: safeUser(updatedUser)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── ADMIN ONLY: Promote User to Admin ─────────────────────────────────────────

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.update({ role: 'ADMIN', isApproved: true }, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId);
    return res.json({
      message: "User promoted to admin successfully",
      user: safeUser(updatedUser)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// ── OTP-BASED PASSWORD RESET FLOW (New Implementation)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /auth/forgot-password/request-otp
 * Request OTP for password reset
 * 
 * Flow:
 * 1. User provides email
 * 2. Check if email exists (don't reveal whether it does for security)
 * 3. Generate 6-digit OTP & store with 10-minute expiry
 * 4. Send OTP via email
 */
export const requestPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    
    // Security: Don't reveal if email exists (prevent email enumeration)
    const genericMessage = 'If an account with this email exists, an OTP has been sent.';
    
    if (!user) {
      // Log for potential abuse detection, but don't reveal to user
      console.log(`OTP requested for non-existent email: ${email}`);
      return res.status(200).json({ message: genericMessage });
    }

    // Invalidate previous OTPs for this user
    await PasswordResetOTP.update(
      { expiresAt: new Date() },
      { where: { userId: user.id, isVerified: false } }
    );

    // Generate OTP
    const plainOTP = generateOTP();
    const hashedOTP = await hashOTP(plainOTP);
    
    // Calculate expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP record
    const otpRecord = await PasswordResetOTP.create({
      userId: user.id,
      email: user.email,
      otp: hashedOTP,
      expiresAt,
      otpAttempts: 0,
      isVerified: false,
    });

    // Send OTP via email
    try {
      const emailTemplate = otpEmailTemplate(user.fullName, plainOTP);
      await sendMail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
      console.log(`✅ OTP sent to ${user.email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Still return success to prevent enumeration, but log the error
      // In production, you might want to store this failed attempt
    }

    return res.status(200).json({ 
      message: genericMessage,
      // Optional: Return for frontend tracking (remove in strict security mode)
      requestId: otpRecord.id,
    });
  } catch (err) {
    console.error('requestPasswordResetOTP error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /auth/forgot-password/verify-otp
 * Verify the 6-digit OTP
 * 
 * Flow:
 * 1. User provides email and OTP
 * 2. Check if OTP matches and hasn't expired
 * 3. If valid, mark as verified and issue temporary token
 * 4. User can now proceed to reset password
 */
export const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Find user
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    // Find active OTP record
    const otpRecord = await PasswordResetOTP.findOne({
      where: {
        userId: user.id,
        email: user.email,
        isVerified: false,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    // Check expiration
    if (isOTPExpired(otpRecord.expiresAt)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check max attempts (prevent brute force)
    const MAX_ATTEMPTS = 5;
    if (otpRecord.otpAttempts >= MAX_ATTEMPTS) {
      // Invalidate the OTP
      await otpRecord.update({ expiresAt: new Date() });
      return res.status(429).json({ 
        message: "Too many failed attempts. Please request a new OTP." 
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(otp.trim(), otpRecord.otp);
    
    if (!isValidOTP) {
      // Increment attempts
      await otpRecord.increment('otpAttempts');
      const attemptsLeft = MAX_ATTEMPTS - otpRecord.otpAttempts - 1;
      return res.status(400).json({ 
        message: `Invalid OTP. ${attemptsLeft} attempts remaining.` 
      });
    }

    // OTP is valid! Generate temporary verification token
    const verificationToken = generateVerificationToken();
    await otpRecord.update({
      isVerified: true,
      verificationToken,
    });

    return res.status(200).json({
      message: "OTP verified successfully. Proceed to reset password.",
      verificationToken, // Frontend must send this with new password
      expiresIn: 15 * 60, // 15 minutes to reset password
    });
  } catch (err) {
    console.error('verifyPasswordResetOTP error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /auth/forgot-password/reset-password
 * Reset password using verification token (issued after OTP verification)
 * 
 * Flow:
 * 1. User provides new password and verification token
 * 2. Verify token is valid and OTP was verified
 * 3. Hash new password and update user
 * 4. Clear OTP record (cleanup)
 */
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { verificationToken, newPassword, confirmPassword } = req.body;

    if (!verificationToken || !newPassword) {
      return res.status(400).json({ message: "Verification token and password are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Find OTP record by verification token
    const otpRecord = await PasswordResetOTP.findOne({
      where: { verificationToken, isVerified: true },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Get user
    const user = await User.findByPk(otpRecord.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await User.update(
      { passwordHash: hashedPassword },
      { where: { id: user.id } }
    );

    // Clean up: Delete the OTP record (password successfully reset)
    await PasswordResetOTP.destroy({
      where: { id: otpRecord.id }
    });

    console.log(`✅ Password reset successfully for user ${user.email}`);

    return res.status(200).json({
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (err) {
    console.error('resetPasswordWithOTP error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
