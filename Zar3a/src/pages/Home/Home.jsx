import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LuBot,
  LuActivity,
  LuStore,
  LuArrowRight,
  LuCheck,
  LuTrendingUp,
  LuShield,
  LuCpu,
  LuCalendar,
} from "react-icons/lu";

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الساعة حياً
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="p-6 md:p-8 max-w-350 mx-auto font-sans bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen">
      {/* 🌟 1. HERO SECTION (UPGRADED) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 md:p-20 text-center border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden mb-12"
      >
        {/* Glow Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[100%] blur-3xl pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-slate-900 dark:bg-white/5 text-white dark:text-slate-300 font-bold text-xs mb-8 border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 border-r border-white/20 pr-4">
              <LuCalendar size={14} className="text-emerald-400" />
              {currentTime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            Smart Agriculture <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-400">
              For Modern Farmers.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            The ultimate AI-driven ecosystem for smart agriculture. Monitor
            sensors, consult experts, and trade in a unified digital landscape.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg group">
                Get Started{" "}
                <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg shadow-sm">
                Explore Marketplace
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* 📊 2. SYSTEM STATS STRIP */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        {[
          {
            icon: <LuActivity />,
            label: "Uptime",
            value: "99.9%",
            color: "emerald",
          },
          {
            icon: <LuBot />,
            label: "AI Prediction",
            value: "94.2%",
            color: "blue",
          },
          {
            icon: <LuTrendingUp />,
            label: "Yield Increase",
            value: "+28%",
            color: "emerald",
          },
          {
            icon: <LuShield />,
            label: "Security",
            value: "SSL-Enc",
            color: "blue",
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-sm hover:border-emerald-500/50 transition-colors group"
          >
            <div
              className={`mb-2 transition-transform group-hover:scale-110 ${stat.color === "emerald" ? "text-emerald-500" : "text-blue-500"}`}
            >
              {stat.icon}
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              {stat.value}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* 🍱 3. BENTO GRID CAPABILITIES */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-8 px-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Core Modules
          </h2>
          <Link
            to="/settings"
            className="text-sm font-bold text-emerald-600 hover:underline"
          >
            System Preferences
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]"
        >
          {/* AI Module (Large) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-slate-900 dark:bg-emerald-950/20 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110">
              <LuBot size={220} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
                  <LuBot size={28} />
                </div>
                <h3 className="text-4xl font-black mb-4">Zar3a AI Engine</h3>
                <p className="text-slate-400 font-medium max-w-md text-lg leading-relaxed">
                  Identify crop diseases and get expert treatment plans
                  instantly using our neural-link vision system.
                </p>
              </div>
              <Link
                to="/chatbot"
                className="flex items-center gap-2 text-emerald-400 font-black text-lg hover:gap-4 transition-all w-fit"
              >
                Open AI Hub <LuArrowRight />
              </Link>
            </div>
          </motion.div>

          {/* Telemetry Module (Tall) */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <LuActivity size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                Live <br /> Telemetry
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                Review tracked market items, order state, and product flow from producers.
              </p>
            </div>
            <Link
              to="/track-orders"
              className="w-full py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center font-black text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all shadow-inner"
            >
              Track Orders
            </Link>
          </motion.div>

          {/* Marketplace Module */}
          <motion.div
            variants={itemVariants}
            className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] p-8 border border-emerald-100 dark:border-emerald-800/30 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <LuStore size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Smart Store
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                Order seeds, tools, and fertilizers from verified suppliers.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="font-black text-emerald-700 dark:text-emerald-400 hover:gap-3 transition-all flex items-center gap-2 text-sm mt-4"
            >
              Explore Store <LuArrowRight />
            </Link>
          </motion.div>

          {/* Experts Module (Wide) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-[10px] uppercase tracking-widest mb-4">
                <LuCpu /> Expert Concierge
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Consultation Hub
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-md">
                Connect with the best agricultural engineers for specialized
                guidance on your crop health.
              </p>
            </div>
            <Link to="/experts">
              <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-md">
                Find Expert
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
