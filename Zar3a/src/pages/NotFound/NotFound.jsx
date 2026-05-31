import { motion } from "framer-motion";
import { Link } from "react-router-dom";
// استبدلنا Lu بـ Fi عشان نضمن وجود الأيقونات وتجنب الـ SyntaxError
import { FiHome, FiArrowLeft } from "react-icons/fi"; 
import { LuSprout } from "react-icons/lu"; // دي عادة بتكون موجودة، لو عملت مشكلة استبدلها بـ GiSprout
import { useLanguage } from "../../context/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.8, 
        staggerChildren: 0.2 
      } 
    },
  };

  const sproutVariants = {
    hidden: { opacity: 0, scale: 0, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, delay: 0.8 } 
    },
    hover: { scale: 1.1, rotate: [0, 5, -5, 0] }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen relative flex flex-col items-center justify-center bg-[#fdfcf8] dark:bg-[#020617] font-sans overflow-hidden transition-colors duration-500"
    >
      {/* 🌟 Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-100/20 dark:bg-green-900/10 blur-[120px] pointer-events-none" />

      {/* 🏠 Back Button */}
      <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-800 rounded-2xl shadow-sm text-text-subtle dark:text-slate-300 font-bold hover:text-primary-base transition-all group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        {t("notFound.backHome")}
      </Link>

      <div className="relative z-10 text-center px-4">
        <div className="flex items-center justify-center gap-4 font-black text-text-main dark:text-white mb-8">
          <h1 className="text-[120px] sm:text-[180px] md:text-[200px] leading-none tracking-tighter">4</h1>
          
          <div className="relative flex items-center justify-center w-25 sm:w-37.5 md:w-45 aspect-square">
            <div className="absolute inset-0 bg-primary-light dark:bg-emerald-900/20 rounded-full border-4 border-emerald-500/20 shadow-inner" />
            <motion.div variants={sproutVariants} whileHover="hover" className="relative text-primary-base dark:text-emerald-500">
              <LuSprout size={100} className="sm:w-30 sm:h-30" />
            </motion.div>
          </div>

          <h1 className="text-[120px] sm:text-[180px] md:text-[200px] leading-none tracking-tighter">4</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-3xl md:text-5xl font-black text-text-main dark:text-white mb-4">
            {t("notFound.fieldNotFound").split(" ")[0]} <span className="text-primary-base">{t("notFound.fieldNotFound").split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-text-muted dark:text-text-disabled text-lg md:text-xl max-w-md mx-auto mb-10 font-medium">
            {t("notFound.notCultivated")}
          </p>
          
          <Link to="/">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-primary-base dark:bg-emerald-500 text-white px-10 py-5 rounded-4xl font-black text-xl shadow-lg shadow-emerald-500/30 hover:bg-primary-hover transition-all"
            >
              <FiHome /> {t("notFound.return")}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;