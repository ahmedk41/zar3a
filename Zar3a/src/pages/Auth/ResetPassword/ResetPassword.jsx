import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiHome,
  FiSun,
  FiMoon,
  FiUserPlus,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Logo2 from "../../../assets/Logo2.png";
import { useAuth } from "../../../context/AuthContext";

const resetSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setApiError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  // Sync dark mode class on mount and when isDarkMode changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    if (!token) return;
    setApiError("");
    try {
      await resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to reset password. Please try again.";
      setApiError(msg);
    }
  };

  const FloatingLeaf = ({ className, delay, size = "140" }) => (
    <motion.div
      animate={{ y: [0, -25, 0], rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
      transition={{
        duration: 10 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`absolute text-emerald-600/10 dark:text-emerald-400/5 hidden lg:block pointer-events-none ${className}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,3 14,3.5 9,9C8.44,9.62 8,10.3 7.65,11C11.3,7.64 15.5,6.11 15.5,6.11C15.5,6.11 11,8.5 7.65,12.3C7.2,13.2 6.88,14.23 6.7,15.3C6.1,13.6 5.33,12.14 4.54,11.26C4.06,10.71 3.56,10.23 3,9.81C3,9.81 7,2 14,2C17,2 20,3 22,3C22,3 20.19,6.03 17,8Z" />
      </svg>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#fdfcf8] dark:bg-[#020617] font-sans transition-colors duration-500">
      
      {/* 🏠 Home Button */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-slate-300 font-bold hover:text-emerald-600 transition-all"
      >
        <FiHome /> Home
      </motion.button>

      {/* 🌗 Right Side Controls (Theme & Register) */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
        {/* ✨ زر التسجيل الجديد */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/register")}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
        >
          <FiUserPlus /> Register
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-yellow-400 transition-all"
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </motion.button>
      </div>

      {/* 🍃 The Floating Leaves */}
      <FloatingLeaf className="top-20 right-[10%]" delay={0} size="160" />
      <FloatingLeaf className="bottom-20 left-[8%] -scale-x-100" delay={2} size="130" />
      <FloatingLeaf className="top-1/2 left-[5%] opacity-50" delay={4} size="100" />

      {/* Background Aura */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-200/20 dark:bg-green-900/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-120 z-10"
      >
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white dark:border-slate-800 rounded-[3rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 via-green-500 to-lime-400" />

          <header className="text-center mb-10">
            <div
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl mb-6 shadow-inner border border-emerald-100 dark:border-emerald-800 cursor-pointer"
            >
              <img
                src={Logo2}
                alt="Logo"
                className="object-contain transform scale-400 w-full h-6"
              />
            </div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
              New <span className="text-emerald-600">Password</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm">
              Enter your new password
            </p>
          </header>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-600 dark:text-green-400 text-sm font-semibold mb-6"
              >
                <FiCheck className="shrink-0" />
                Password reset successfully! Redirecting to login...
              </motion.div>
            )}
          </AnimatePresence>

          {/* API Error */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold mb-6"
              >
                <FiAlertCircle className="shrink-0" />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          {!success && token && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <FiLock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${errors.password ? "text-red-400" : "text-slate-400 group-focus-within:text-emerald-500"}`}
                  />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-slate-50 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors z-10"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs font-bold ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <FiLock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${errors.confirmPassword ? "text-red-400" : "text-slate-400 group-focus-within:text-emerald-500"}`}
                  />
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-slate-50 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors z-10"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-bold ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <motion.button
                disabled={isSubmitting}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4.5 rounded-2xl font-black text-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all mt-4"
              >
                {isSubmitting ? (
                  "Resetting..."
                ) : (
                  <>
                    Reset Password <FiArrowRight />
                  </>
                )}
              </motion.button>
            </form>
          )}

          <footer className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
            <p className="text-slate-400 text-sm font-bold">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-emerald-600 font-black hover:underline"
              >
                Sign In
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}