import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuThermometer,
  LuSprout,
  LuInfo,
  LuMapPin,
  LuCalendar,
  LuZap,
  LuWaves,
  LuTrendingUp,
  LuPower,
  LuSearch,
  LuCloudSun,
  LuBell,
  LuWallet,
  LuDroplet,
  LuLayoutGrid,
  LuX,
  LuWind,
  LuSettings2,
  LuFlaskConical,
  LuChevronDown,
} from "react-icons/lu";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Restrict dashboard access: only Admin and Farmer can access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const allowedRoles = ['ADMIN', 'FARMER'];
    if (!allowedRoles.includes(user.role)) {
      navigate('/');
    }
  }, [user, navigate]);
  const cropsData = {
    Cotton: {
      icon: "☁️",
      min: 50,
      max: 70,
      duration: "180 days",
      nutrients: "Ammonium Nitrate",
      irrigation: "Every 10-15 days",
      season: "Summer",
      yieldTons: 1.5,
      pricePerTon: 45000,
      soilPh: "6.0 - 7.5",
      sunlight: "Full Sun",
      diseases: "Boll Rot",
      info: "Requires deep soil preparation.",
    },
    Wheat: {
      icon: "🌾",
      min: 40,
      max: 60,
      duration: "150 days",
      nutrients: "Urea",
      irrigation: "4-5 times/season",
      season: "Winter",
      yieldTons: 3,
      pricePerTon: 13000,
      soilPh: "6.0 - 7.0",
      sunlight: "Full Sun",
      diseases: "Rust",
      info: "Critical moisture needed during flowering.",
    },
    "Sugar Cane": {
      icon: "🎋",
      min: 70,
      max: 90,
      duration: "360 days",
      nutrients: "Potassium Sulfate",
      irrigation: "High frequency",
      season: "Year-round",
      yieldTons: 40,
      pricePerTon: 1500,
      soilPh: "6.0 - 8.5",
      sunlight: "Full Sun",
      diseases: "Smut",
      info: "Requires excellent drainage.",
    },
    Tomato: {
      icon: "🍅",
      min: 60,
      max: 80,
      duration: "90 days",
      nutrients: "NPK 15-15-15",
      irrigation: "Daily early morning",
      season: "All seasons",
      yieldTons: 20,
      pricePerTon: 6000,
      soilPh: "6.0 - 6.8",
      sunlight: "Full Sun",
      diseases: "Blight",
      info: "Consistent moisture prevents fruit cracking.",
    },
    Citrus: {
      icon: "🍊",
      min: 60,
      max: 75,
      duration: "Perennial",
      nutrients: "Zinc, Iron",
      irrigation: "Regular cycles",
      season: "Winter",
      yieldTons: 15,
      pricePerTon: 8000,
      soilPh: "5.5 - 6.5",
      sunlight: "Full/Partial Sun",
      diseases: "Citrus Canker",
      info: "Prefers sandy-loamy Delta soils.",
    },
  };

  const locationDB = {
    "Cairo, Greater Cairo": {
      lat: 30.0444,
      lng: 31.2357,
      bestCrop: "Tomato",
      region: "Capital",
    },
    "Dakahlia, Mansoura": {
      lat: 31.0364,
      lng: 31.3801,
      bestCrop: "Cotton",
      region: "Delta",
    },
    "Minya, Upper Egypt": {
      lat: 28.1099,
      lng: 30.7503,
      bestCrop: "Wheat",
      region: "Middle Egypt",
    },
    "Aswan, Deep South": {
      lat: 24.0889,
      lng: 32.8998,
      bestCrop: "Sugar Cane",
      region: "South Upper Egypt",
    },
    "Alexandria, Coast": {
      lat: 31.2001,
      lng: 29.9187,
      bestCrop: "Wheat",
      region: "Coastal",
    },
  };

  const [sectors, setSectors] = useState([
    {
      id: 1,
      name: "Sector A: Greenhouse",
      location: "Cairo, Greater Cairo",
      crop: "Tomato",
      isAuto: true,
      moisture: 62,
    },
    {
      id: 2,
      name: "Sector B: Open Field",
      location: "Dakahlia, Mansoura",
      crop: "Cotton",
      isAuto: false,
      moisture: 45,
    },
  ]);
  const [activeSectorId, setActiveSectorId] = useState(1);
  const activeSector = sectors.find((s) => s.id === activeSectorId);

  const [searchQuery, setSearchQuery] = useState(activeSector.location);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const cropDropdownRef = useRef(null);

  const [hardware, setHardware] = useState({
    pump: false,
    vent: false,
    fertilizer: false,
  });
  const [logs, setLogs] = useState([
    { time: "08:30 AM", msg: "System Booted Successfully", type: "info" },
  ]);
  const [data, setData] = useState([{ time: "08:00", moisture: 60 }]);

  const [weather, setWeather] = useState({
    temp: "--",
    condition: "Loading...",
    bestCrop: "Tomato",
    region: "Egypt",
  });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const getWeatherCondition = (code) => {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    return "Sunny";
  };

  useEffect(() => {
    const fetchRealWeather = async () => {
      const locInfo = locationDB[activeSector.location];
      if (!locInfo) return;
      setIsWeatherLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${locInfo.lat}&longitude=${locInfo.lng}&current_weather=true`,
        );
        const result = await response.json();
        setWeather({
          temp: Math.round(result.current_weather.temperature),
          condition: getWeatherCondition(result.current_weather.weathercode),
          bestCrop: locInfo.bestCrop,
          region: locInfo.region,
        });
      } catch (error) {
        setWeather({
          temp: 30,
          condition: "Offline",
          bestCrop: locInfo.bestCrop,
          region: locInfo.region,
        });
      } finally {
        setIsWeatherLoading(false);
      }
    };
    fetchRealWeather();
  }, [activeSector.location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowSuggestions(false);
      if (
        cropDropdownRef.current &&
        !cropDropdownRef.current.contains(event.target)
      )
        setIsCropDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addLog = (msg, type) =>
    setLogs((prev) =>
      [
        {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          msg,
          type,
        },
        ...prev,
      ].slice(0, 15),
    );
  const updateActiveSector = (updates) =>
    setSectors(
      sectors.map((s) => (s.id === activeSectorId ? { ...s, ...updates } : s)),
    );

  const handleSelectLocation = (locName) => {
    updateActiveSector({ location: locName });
    setSearchQuery(locName);
    setShowSuggestions(false);
  };

  const toggleHardware = (device) => {
    if (activeSector.isAuto) return;
    const newState = !hardware[device];
    setHardware((prev) => ({ ...prev, [device]: newState }));
    addLog(
      `[MANUAL] ${device.toUpperCase()} turned ${newState ? "ON" : "OFF"}`,
      "action",
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const lastVal = prev[prev.length - 1]?.moisture || 50;
        const cropMin = cropsData[activeSector.crop].min;
        let change = 0;
        if (activeSector.isAuto) {
          if (lastVal < cropMin) {
            change = 4;
            setHardware((h) => ({ ...h, pump: true }));
          } else {
            change = Math.random() * 4 - 2;
            setHardware((h) => ({ ...h, pump: false }));
          }
        } else {
          if (hardware.pump) change = 5;
          else change = Math.random() * 4 - 2.5;
        }
        const newVal = Math.round(Math.max(10, Math.min(95, lastVal + change)));
        const nextData = [
          ...prev,
          {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            moisture: newVal,
          },
        ];
        return nextData.length > 12 ? nextData.slice(1) : nextData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSector.isAuto, activeSector.crop, hardware.pump]);

  const currentMoisture = data[data.length - 1]?.moisture || 0;
  const crop = cropsData[activeSector.crop];
  const filteredLocs = Object.keys(locationDB).filter((loc) =>
    loc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const analyzeStatus = () => {
    let advice = "";
    let color = "text-green-500";
    let pumpStatus = "Idle";
    if (currentMoisture < crop.min) {
      color = "text-red-500";
      pumpStatus = hardware.pump ? "Active" : "Critical (Needs Pump)";
      advice = hardware.pump
        ? `Irrigating to reach ${crop.min}%.`
        : `CRITICAL: Dry soil. At ${weather.temp}°C, evaporation is fast. Turn on pumps!`;
    } else if (currentMoisture > crop.max) {
      color = "text-orange-500";
      pumpStatus = "Halted";
      advice = `WARNING: Waterlogging detected. Stop irrigation.`;
    } else {
      advice = `Optimal conditions for ${activeSector.crop}. Environment is balanced.`;
      pumpStatus = hardware.pump ? "Active (Consider Stopping)" : "Standby";
    }
    return {
      color,
      advice: (activeSector.isAuto ? "[AI] " : "[MANUAL] ") + advice,
      pumpStatus,
    };
  };
  const aiRes = analyzeStatus();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-4 text-left relative z-10">
      {/* Top Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setActiveSectorId(sector.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-bold text-sm transition-all whitespace-nowrap ${activeSectorId === sector.id ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none" : "bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100"}`}
            >
              <LuLayoutGrid /> {sector.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsLogOpen(true)}
          className="relative p-4 bg-gray-50 dark:bg-slate-800 hover:text-green-600 rounded-full transition-colors hidden md:block"
        >
          <LuBell size={20} className="dark:text-white" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Search */}
            <div
              ref={searchRef}
              className="relative z-40 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 flex items-center p-3"
            >
              <div className="p-3 bg-green-50 text-green-600 rounded-3xl">
                <LuMapPin size={22} />
              </div>
              <div className="flex-1 px-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Zone Location
                </p>
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="bg-transparent border-none outline-none font-black text-lg w-full dark:text-white"
                />
              </div>
              <AnimatePresence>
                {showSuggestions && filteredLocs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[110%] left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-[2.5rem] shadow-2xl z-50 p-2 max-h-75 overflow-y-auto custom-scrollbar"
                  >
                    {filteredLocs.map((loc) => (
                      <div
                        key={loc}
                        onClick={() => handleSelectLocation(loc)}
                        className="p-4 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-3xl cursor-pointer flex justify-between items-center border-b border-transparent"
                      >
                        <div>
                          <h4 className="font-bold dark:text-white text-sm">
                            {loc.split(",")[0]}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-green-600 font-bold uppercase">
                            Best: {locationDB[loc].bestCrop}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dropdown & Mode */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div
                ref={cropDropdownRef}
                className="relative w-1/2 border-r border-gray-100 dark:border-slate-800 pr-2 z-30"
              >
                <div
                  onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-3xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{crop.icon}</span>
                    <span className="font-black text-gray-800 dark:text-white truncate">
                      {activeSector.crop}
                    </span>
                  </div>
                  <LuChevronDown
                    className={`text-gray-400 transition-transform ${isCropDropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <AnimatePresence>
                  {isCropDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-full min-w-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl z-50 overflow-hidden p-2"
                    >
                      {Object.keys(cropsData).map((c) => (
                        <div
                          key={c}
                          onClick={() => {
                            updateActiveSector({ crop: c });
                            setIsCropDropdownOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${activeSector.crop === c ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"}`}
                        >
                          <span className="text-2xl">{cropsData[c].icon}</span>
                          <span className="font-bold">{c}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-1/2 flex items-center justify-between px-4">
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  {activeSector.isAuto ? "Auto" : "Manual"}
                </p>
                <div
                  onClick={() => {
                    updateActiveSector({ isAuto: !activeSector.isAuto });
                    addLog(`Mode changed`, "info");
                  }}
                  className="w-14 h-7 bg-gray-200 dark:bg-slate-700 rounded-full p-1 cursor-pointer flex"
                >
                  <motion.div
                    animate={{ x: activeSector.isAuto ? 28 : 0 }}
                    className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center ${activeSector.isAuto ? "bg-green-500 text-white" : "bg-white text-gray-400"}`}
                  >
                    <LuPower size={10} />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware Panel */}
          <div
            className={`p-6 rounded-[2.5rem] border transition-all ${activeSector.isAuto ? "bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 opacity-60" : "bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/50 shadow-lg"}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black dark:text-white flex items-center gap-2">
                <LuSettings2 className="text-gray-400" /> Hardware Control
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => toggleHardware("pump")}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all border ${hardware.pump ? "bg-blue-500 border-blue-600 text-white" : "bg-gray-50 dark:bg-slate-800 text-gray-400"}`}
              >
                <LuDroplet
                  size={24}
                  className={hardware.pump ? "animate-bounce" : ""}
                />
                <span className="text-[10px] font-black uppercase mt-2">
                  Pump
                </span>
              </button>
              <button
                onClick={() => toggleHardware("vent")}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all border ${hardware.vent ? "bg-emerald-500 border-emerald-600 text-white" : "bg-gray-50 dark:bg-slate-800 text-gray-400"}`}
              >
                <LuWind
                  size={24}
                  className={hardware.vent ? "animate-spin-slow" : ""}
                />
                <span className="text-[10px] font-black uppercase mt-2">
                  Vent
                </span>
              </button>
              <button
                onClick={() => toggleHardware("fertilizer")}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all border ${hardware.fertilizer ? "bg-purple-500 border-purple-600 text-white" : "bg-gray-50 dark:bg-slate-800 text-gray-400"}`}
              >
                <LuFlaskConical
                  size={24}
                  className={hardware.fertilizer ? "animate-pulse" : ""}
                />
                <span className="text-[10px] font-black uppercase mt-2">
                  Fertilizer
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 NEW: PREMIUM WEATHER CARD 🌟 */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
          <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl shadow-indigo-200/40 dark:shadow-none relative overflow-hidden h-full">
            {/* Abstract Glass Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

            {/* Background Icon */}
            <LuCloudSun
              size={180}
              className="absolute -right-12 -bottom-12 opacity-10 text-white"
              style={{ mixBlendMode: "overlay" }}
            />

            {/* Top Row: Label & Spinner */}
            <div className="relative z-10 flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/90">
                  Live Climate
                </p>
              </div>
              {isWeatherLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </div>

            {/* Middle Row: Big Temp */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <div className="flex items-start gap-1">
                <h4 className="text-[5.5rem] font-black tracking-tighter leading-none drop-shadow-lg">
                  {weather.temp}
                </h4>
                <div className="flex flex-col pt-2">
                  <span className="text-4xl font-black text-white/80">°C</span>
                </div>
              </div>
              <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest mt-2">
                {weather.condition}
              </p>
            </div>

            {/* Bottom Row: Location & Bento AI Pill */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-1">
                  Region
                </p>
                <p className="font-bold text-sm truncate max-w-25">
                  {weather.region}
                </p>
              </div>

              {/* Premium Glassmorphic AI Pill */}
              <div className="bg-white/10 hover:bg-white/20 transition-all cursor-default border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-xl">
                <div className="flex flex-col text-right">
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200">
                    AI Suggested
                  </span>
                  <span className="text-sm font-black text-white">
                    {weather.bestCrop}
                  </span>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-[10px] flex items-center justify-center text-2xl shadow-inner border border-white/10">
                  {cropsData[weather.bestCrop]?.icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CHARTS & AI --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black dark:text-white tracking-tight">
                Moisture Telemetry
              </h3>
              <p className="text-sm font-bold text-gray-400 uppercase mt-1">
                Pump Status:{" "}
                <span className={aiRes.color}>{aiRes.pumpStatus}</span>
              </p>
            </div>
          </div>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.1}
                />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ borderRadius: "20px", border: "none" }}
                />
                <ReferenceLine
                  y={crop.min}
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  label={{
                    value: "Min",
                    position: "left",
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  y={crop.max}
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  label={{
                    value: "Max",
                    position: "left",
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  stroke="#10b981"
                  strokeWidth={5}
                  fill="url(#g)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl border-t-4 border-t-green-500 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
                  <LuZap size={20} className="fill-yellow-600" />
                </div>
                <h3 className="font-black dark:text-white uppercase text-sm tracking-widest">
                  AI Engine
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic mb-8 border-l-2 border-green-500 pl-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-r-2xl">
                "{aiRes.advice}"
              </p>
            </div>
            <button
              onClick={() => setIsReportOpen(true)}
              className="w-full mt-auto py-4 bg-gray-900 dark:bg-green-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-lg"
            >
              View Profile & Revenue
            </button>
            rounded-3xl
          </motion.div>
        </div>
      </div>

      {/* --- NOTIFICATIONS --- */}
      <AnimatePresence>
        {isLogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-90"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-100 p-6 overflow-y-auto border-l border-gray-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
                <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                  <LuBell className="text-green-600" /> System Logs
                </h2>
                <button
                  onClick={() => setIsLogOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:text-red-500"
                >
                  <LuX size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex gap-4 items-start border border-gray-100 dark:border-slate-700/50"
                  >
                    <div
                      className={`p-2 rounded-full mt-1 ${log.type === "action" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                    >
                      {log.type === "action" ? (
                        <LuSettings2 size={14} />
                      ) : (
                        <LuInfo size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white leading-tight mb-1">
                        {log.msg}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- CROP PROFILE MODAL --- */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3.5rem] p-8 md:p-12 relative overflow-y-auto max-h-[90vh] shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-end mb-8 border-b border-gray-100 dark:border-slate-800 pb-6">
                <div>
                  <h2 className="text-4xl font-black dark:text-white">
                    {crop.icon} {activeSector.crop} Profile
                  </h2>
                </div>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-3 bg-gray-100 dark:bg-slate-800 rounded-full hover:text-red-500"
                >
                  <LuX size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <section className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-4xl">
                  <h4 className="font-black dark:text-white mb-4 uppercase text-xs tracking-widest border-l-4 border-green-500 pl-4">
                    Financial Projection
                  </h4>
                  <p className="text-sm dark:text-gray-300 mb-2">
                    <strong>Expected Yield:</strong> {crop.yieldTons} Tons/Acre
                  </p>
                  <p className="text-sm dark:text-gray-300 mb-2">
                    <strong>Market Price:</strong> EGP{" "}
                    {crop.pricePerTon.toLocaleString()} / Ton
                  </p>
                  <p className="text-xl text-green-600 font-black mt-4">
                    Revenue: EGP{" "}
                    {(crop.yieldTons * crop.pricePerTon).toLocaleString()}
                  </p>
                </section>
                <section className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-4xl">
                  <h4 className="font-black dark:text-white mb-4 uppercase text-xs tracking-widest border-l-4 border-blue-500 pl-4">
                    Care & Threats
                  </h4>
                  <p className="text-sm dark:text-blue-200 font-bold text-blue-900 mb-2">
                    Nutrients: {crop.nutrients}
                  </p>
                  <p className="text-sm dark:text-blue-200 font-bold text-red-500 mb-2">
                    Common Diseases: {crop.diseases}
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
