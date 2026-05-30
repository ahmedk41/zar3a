import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  LuLeaf,
  LuMail,
  LuPhone,
  LuMapPin,
  LuArrowRight,
  LuArrowUp,
  LuSun,
  LuMoon,
} from "react-icons/lu";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "Light");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }, 1500);
  };

  const scrollToTop = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "Light" ? "Dark" : "Light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "Dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="relative mt-20 pt-16 pb-8 overflow-hidden bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800 font-sans transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 max-w-350 mx-auto px-6 md:px-8"
      >
        {/* Newsletter Section */}
        <motion.div
          variants={itemVariants}
          className="mb-16 p-8 md:p-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm"
        >
          <div className="max-w-md text-center md:text-start">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t("footer.newsletter.title")}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t("footer.newsletter.sub")}</p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder={t("footer.newsletter.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-emerald-500/50 outline-none w-full text-slate-900 dark:text-white font-medium transition-all"
            />
            <button
              type="submit"
              disabled={isSubscribing || subscribed}
              className={`px-8 py-4 font-bold rounded-xl text-white transition-all shadow-lg flex items-center justify-center gap-2 min-w-35 ${
                subscribed ? "bg-emerald-500" : "bg-slate-900 dark:bg-emerald-600 hover:opacity-90"
              }`}
            >
              {isSubscribing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : subscribed ? t("footer.newsletter.done") : <>{t("footer.newsletter.btn")} <LuArrowRight /></>}
            </button>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group w-fit">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <LuLeaf size={28} />
              </div>
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">ZAR3A</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
              Egypt's premier integrated agricultural management platform. Empowering farmers with IoT and AI.
            </p>
          </motion.div>

          {/* Platform Links */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-slate-900 dark:text-white font-black text-lg mb-6 uppercase tracking-wider">{t("footer.platform")}</h3>
            <ul className="space-y-4">
              {[{ name: "Dashboard", path: "/dashboard" }, { name: "Marketplace", path: "/marketplace" }, { name: "Experts", path: "/experts" }].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} onClick={scrollToTop} className="group flex items-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-bold transition-colors">
                    <LuArrowRight className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 transition-all" size={16} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-slate-900 dark:text-white font-black text-lg mb-6 uppercase tracking-wider">{t("footer.resources")}</h3>
            <ul className="space-y-4">
              {[{ name: "AI Assistant", path: "/chatbot" }, { name: "Notifications", path: "/notifications" }, { name: "Settings", path: "/settings" }, { name: "Login", path: "/login" }].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} onClick={scrollToTop} className="group flex items-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-bold transition-colors">
                    <LuArrowRight className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 transition-all" size={16} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <h3 className="text-slate-900 dark:text-white font-black text-lg mb-6 uppercase tracking-wider">{t("footer.contact")}</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4 text-slate-500 dark:text-slate-400 hover:text-emerald-600 group cursor-pointer">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <LuMapPin size={20} className="shrink-0" />
                </div>
                <div className="pt-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Zamalek, Cairo</p>
                  <p className="text-sm">BIS Program - Foreign Trade</p>
                </div>
              </div>
              
              <a href="mailto:hello@zar3a.com" className="flex items-center gap-4 text-slate-500 dark:text-slate-400 hover:text-emerald-600 group">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <LuMail size={20} className="shrink-0" />
                </div>
                <span className="font-bold">hello@zar3a.com</span>
              </a>

              <a href="tel:+201234567890" className="flex items-center gap-4 text-slate-500 dark:text-slate-400 hover:text-emerald-600 group">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <LuPhone size={20} className="shrink-0" />
                </div>
                <span className="font-bold">+20 123 456 7890</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar (Clean Version) */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 dark:text-slate-400 font-bold text-sm text-center">
            {t("footer.rights")} {t("footer.tagline")}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase"
            >
              {theme === "Light" ? (
                <><LuMoon size={16} /> {t("footer.darkMode")}</>
              ) : (
                <><LuSun size={16} /> {t("footer.lightMode")}</>
              )}
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              to="/settings"
              onClick={scrollToTop}
              className="text-sm font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t("footer.privacy")}
            </Link>

            <button onClick={scrollToTop} className="ml-4 w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-500 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90">
              <LuArrowUp size={20} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;