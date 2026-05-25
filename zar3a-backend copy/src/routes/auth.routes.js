// src/routes/auth.routes.js
import { Router } from "express";
import { body, validationResult } from "express-validator";

import { uploadCV }   from "../middlewares/upload.js";
import authenticate   from "../middlewares/authenticate.js";
import adminOnly      from "../middlewares/adminOnly.js";
import {
  register,
  chooseRole,
  completeExpertProfile,
  completeFarmerProfile,
  completeBuyerProfile,
  completeSupplierProfile,
  login,
  googleLogin,
  refreshToken,
  logout,
  me,
  getDashboard,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  approveExpert,
  rejectExpert,
  getPendingExperts,
  promoteToAdmin,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithOTP,
} from "../controllers/auth.controller.js";

const router = Router();

// ── Validation runner ────────────────────────────────────────────────────────

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

// ── Reusable field rules ─────────────────────────────────────────────────────

const baseRules = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }).withMessage("Valid email required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be ≥ 8 characters"),
  body("confirmPassword").custom((val, { req }) => {
    if (val !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
];

const registerRules = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("email").isEmail().normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }).withMessage("Valid email required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be ≥ 8 characters"),
];

const chooseRoleRules = [
  body("role").isIn(['FARMER', 'BUYER', 'SUPPLIER', 'AGRO_EXPERT']).withMessage("Invalid role"),
];

// ── Routes ───────────────────────────────────────────────────────────────────

// POST /auth/register
router.post("/register",
  registerRules, validate, register
);

// POST /auth/choose-role/:userId
router.post("/choose-role/:userId",
  chooseRoleRules, validate,
  chooseRole
);

// POST /auth/complete/expert/:userId  (multipart/form-data)
router.post("/complete/expert/:userId",
  uploadCV,
  [
    body("academicDegree").trim().notEmpty().withMessage("Academic degree is required"),
    body("experienceYears").isInt({ min: 0 }).withMessage("Experience years must be ≥ 0"),
  ],
  validate,
  completeExpertProfile
);

// POST /auth/complete/farmer/:userId
router.post("/complete/farmer/:userId",
  [
    body("farmSize").optional().trim(),
    body("soilType").optional().trim(),
    body("location").optional().trim(),
  ],
  validate,
  completeFarmerProfile
);

// استكمال بيانات المشتري (Buyer)
router.post("/complete/buyer/:userId", completeBuyerProfile);

// استكمال بيانات المورد (Supplier)
router.post("/complete/supplier/:userId",
  [
    body("tradeLicense").optional().trim(),
    body("location").optional().trim(),
  ],
  validate,
  completeSupplierProfile
);

// ── ADMIN ONLY: Expert approval routes ───────────────────────────────────────

// GET /auth/admin/pending-experts (ADMIN ONLY)
router.get("/admin/pending-experts",
  authenticate,
  adminOnly,
  getPendingExperts
);

// POST /auth/admin/approve-expert/:userId (ADMIN ONLY)
router.post("/admin/approve-expert/:userId",
  authenticate,
  adminOnly,
  approveExpert
);

// POST /auth/admin/reject-expert/:userId (ADMIN ONLY)
router.post("/admin/reject-expert/:userId",
  authenticate,
  adminOnly,
  rejectExpert
);

// POST /auth/admin/promote/:userId (ADMIN ONLY)
router.post("/admin/promote/:userId",
  authenticate,
  adminOnly,
  promoteToAdmin
);

// POST /auth/login
router.post("/login",
  [
    body("email")
      .trim()
      .notEmpty().withMessage("Email or username is required")
      .custom((value) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernamePattern = /^[a-zA-Z0-9._-]{3,}$/;
        if (emailPattern.test(value) || usernamePattern.test(value)) return true;
        throw new Error("Enter a valid email or username");
      }),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// POST /auth/google
router.post("/google",
  [body("idToken").notEmpty().withMessage("Google id token is required")],
  validate,
  googleLogin
);

// POST /auth/refresh
router.post("/refresh", refreshToken);

// POST /auth/logout
router.post("/logout", logout);

// GET  /auth/me
router.get("/me", authenticate, me);

// PUT /auth/me
router.put(
  "/me",
  authenticate,
  [
    body("fullName").optional().trim(),
    body("username").optional().trim(),
    body("email").optional().isEmail().normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
    body("phone").optional().trim(),
  ],
  validate,
  updateProfile
);

// PUT /auth/me/password
router.put(
  "/me/password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  validate,
  changePassword
);

// POST /auth/forgot-password
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }).withMessage("Valid email required")],
  validate,
  forgotPassword
);

// POST /auth/reset-password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  validate,
  resetPassword
);

// POST /auth/verify-email
router.post(
  "/verify-email",
  [body("token").notEmpty().withMessage("Verification token is required")],
  validate,
  verifyEmail
);

// GET  /auth/dashboard
router.get("/dashboard", authenticate, getDashboard);

// ══════════════════════════════════════════════════════════════════════════════
// ── NEW: OTP-Based Password Reset Flow
// ══════════════════════════════════════════════════════════════════════════════

// POST /auth/forgot-password/request-otp
// Request OTP for password reset
// Body: { email }
router.post(
  "/forgot-password/request-otp",
  [body("email").isEmail().normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }).withMessage("Valid email required")],
  validate,
  requestPasswordResetOTP
);

// POST /auth/forgot-password/verify-otp
// Verify OTP and get temporary verification token
// Body: { email, otp }
router.post(
  "/forgot-password/verify-otp",
  [
    body("email").isEmail().normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }).withMessage("Valid email required"),
    body("otp").trim().notEmpty().withMessage("OTP is required"),
  ],
  validate,
  verifyPasswordResetOTP
);

// POST /auth/forgot-password/reset-password
// Reset password using verification token (issued after OTP verification)
// Body: { verificationToken, newPassword, confirmPassword }
router.post(
  "/forgot-password/reset-password",
  [
    body("verificationToken").notEmpty().withMessage("Verification token is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("confirmPassword").notEmpty().withMessage("Please confirm password"),
  ],
  validate,
  resetPasswordWithOTP
);

export default router;
