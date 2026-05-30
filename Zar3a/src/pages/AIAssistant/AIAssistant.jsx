import { useState, useRef, useEffect } from "react";
import Groq from "groq-sdk";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { LuSend, LuBot, LuUser, LuSprout, LuSparkles } from "react-icons/lu";
import { useLanguage } from "../../context/LanguageContext";

// 🔑 الـ API Key من متغيرات البيئة
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

let groq = null;
if (GROQ_API_KEY) {
  groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });
}

const AIAssistant = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "### أهلاً بك في **زرعة الذكي** 🌿\n\nأنا خبيرك الزراعي المدعوم بالذكاء الاصطناعي. مستعد لتقديم استشارات دقيقة حول:\n* تشخيص أمراض النباتات.\n* جداول التسميد والري.\n* تحسين جودة التربة.\n\n**كيف يمكنني مساعدة محاصيلك اليوم؟**\n\n*(You can also speak to me in English!)*"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const prevMessageCount = useRef(messages.length);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainElem = document.querySelector('main');
    if (mainElem) {
      mainElem.scrollTop = 0;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  const getMockAIResponse = (userMsg) => {
    const msg = userMsg.toLowerCase();
    const isArabic = /[\u0600-\u06FF]/.test(userMsg);

    if (isArabic) {
      if (msg.includes("طماطم") || msg.includes("مرض") || msg.includes("بقع") || msg.includes("لفحة")) {
        return `### تشخيص مرض الطماطم 🍅\n\nبناءً على وصفك، قد تكون المحاصيل مصابة بـ **اللفحة المبكرة (Early Blight)** أو تبقع الأوراق.\n\n**التوصيات العلاجية:**\n1. **التقليم:** قم بإزالة الأوراق السفلية المصابة لمنع انتشار الجراثيم.\n2. **التهوية:** تأكد من مسافات زراعة كافية بين النباتات لتحسين تهوية الهواء.\n3. **العلاج الفطري:** رش مبيد فطري نحاسي مناسب (مثل أكسي كلورور النحاس) بجرعة 250 جم / 100 لتر ماء.\n4. **الري:** تجنب الري العلوي (فوق الأوراق) واستخدم الري بالتنقيط 💧 لتقليل الرطوبة على المجموع الخضري.`;
      }
      if (msg.includes("سماد") || msg.includes("تسميد") || msg.includes("npk") || msg.includes("غذاء")) {
        return `### جدول التسميد المقترح 🌿\n\nلتحقيق أفضل نمو وإنتاجية لمحاصيلك، يرجى اتباع الإرشادات التالية:\n\n* **مرحلة النمو الخضري:** استخدم سماد متوازن **NPK 20-20-20** لتنشيط المجموع الخضري والجذور.\n* **مرحلة التزهير:** أضف سماد عالي الفوسفور (مثل 10-50-10) لتحفيز تكون الأزهار.\n* **مرحلة عقد الثمار:** ركز على سماد عالي البوتاسيوم لزيادة حجم وجودة الثمار.\n\n*نصيحة: احرص على إضافة الكالسيوم بورون لتجنب تشقق الثمار وعفن الطرف الزهري.*`;
      }
      if (msg.includes("ري") || msg.includes("ماء") || msg.includes("عطش") || msg.includes("سقي")) {
        return `### إرشادات الري الذكي 💧\n\nتنظيم مياه الري هو أساس نجاح المحصول وتجنب أعفان الجذور:\n\n1. **التوقيت:** يفضل الري دائماً في الصباح الباكر أو عند الغروب لتقليل التبخر.\n2. **الكمية:** اضبط كمية مياه الري بناءً على قراءة رطوبة التربة في لوحة التحكم (النسبة المثالية بين 50% إلى 70%).\n3. **نوع التربة:** التربة الرملية تحتاج ري متكرر بكميات قليلة، بينما التربة الطينية تحتاج ري على فترات متباعدة.`;
      }
      return `### استشارة زراعية عامة 🌱\n\nمرحباً بك! أنا مستشارك الزراعي الذكي. لقد استلمت رسالتك وسأقوم بمساعدتك:\n\n* **تشخيص أمراض النباتات:** أرسل اسم النبات والأعراض الظاهرة عليه.\n* **إدارة التربة:** اسألني عن معالجة الملوحة أو نوع السماد المناسب.\n* **تحسين الري:** يمكنني تقديم نصائح حول شبكات الري بالتنقيط.\n\n*(ملاحظة: تعمل ميزة الذكاء الاصطناعي حالياً في وضع المعاينة الأكاديمي السريع).*`;
    } else {
      if (msg.includes("tomato") || msg.includes("disease") || msg.includes("spot") || msg.includes("blight")) {
        return `### Tomato Leaf Spot / Blight Diagnosis 🍅\n\nBased on your query, the plant may be suffering from **Early Blight** or **Septoria Leaf Spot**.\n\n**Action Plan:**\n1. **Pruning:** Remove the lower infected leaves immediately to stop spores from spreading.\n2. **Watering:** Water at the base of the plant using drip irrigation. Avoid overhead watering 💧.\n3. **Fungicide:** Apply a copper-based fungicide according to label directions.\n4. **Air Circulation:** Space plants properly to ensure adequate airflow.`;
      }
      if (msg.includes("fertilizer") || msg.includes("npk") || msg.includes("feed")) {
        return `### Crop Fertilization Guidelines 🌿\n\nHere is a recommended nutrition program for your plants:\n\n* **Vegetative Stage:** Apply a balanced **NPK 20-20-20** fertilizer to promote strong roots and foliage.\n* **Flowering Stage:** Use high-phosphorus fertilizer (e.g., 10-50-10) to stimulate blooms.\n* **Fruiting Stage:** Transition to high-potassium formula to boost fruit size and sweetness.\n\n*Tip: Add Calcium-Boron to prevent blossom-end rot in vegetables.*`;
      }
      if (msg.includes("water") || msg.includes("irrigate") || msg.includes("dry")) {
        return `### Smart Irrigation Tips 💧\n\nProper water management prevents root rot and optimizes yield:\n\n1. **Schedule:** Water early in the morning to minimize evaporation.\n2. **Monitoring:** Keep soil moisture levels between 50% and 70% as indicated in your dashboard.\n3. **Soil Type:** Sandy soils require frequent, light watering, while clay soils need deeper, less frequent cycles.`;
      }
      return `### Agricultural Advisory 🌱\n\nHello! I am your AI farming assistant. How can I help you today?\n\n* Ask me about **plant diseases** and their organic/chemical treatments.\n* Ask for **fertilization schedules** program tailored for your crop.\n* Ask about **soil preparation** and salinity management.\n\n*(Note: The assistant is running in high-fidelity academic preview mode).*`;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText;
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);

    if (!groq) {
      setTimeout(() => {
        const aiText = getMockAIResponse(userMsg);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: aiText }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            // 🧠 العقل المدبر: أوامر ثنائية اللغة وتنسيق احترافي
            content: `You are an expert agricultural consultant for the 'Zar3a' project (BIS Faculty, Helwan University, Egypt). 
            
            CRITICAL LANGUAGE RULE:
            You MUST respond in the EXACT SAME LANGUAGE the user uses. 
            - If the user asks in English, reply ONLY in English.
            - If the user asks in Arabic, reply ONLY in Arabic.
            
            Formatting Rules:
            1. Be professional, accurate, and academic.
            2. Use Markdown styling (### for main headings).
            3. Use bullet points (- or *) for steps and solutions.
            4. Keep paragraphs concise and use relevant emojis (🌿, 💧, 🍅).`
          },
          {
            role: "user",
            content: userMsg
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
      });

      const aiText = chatCompletion.choices[0]?.message?.content || "عذراً، لم أتمكن من المعالجة.";
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: aiText }]);

    } catch (error) {
      console.error("Groq AI Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "ai", text: "⚠️ **خطأ في الاتصال**\n\nيوجد ضغط حالياً على خوادم الذكاء الاصطناعي. يرجى المحاولة بعد قليل." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[88vh] flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] rounded-4xl shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-white dark:border-slate-800 overflow-hidden relative mt-6 font-sans">

      {/* 🌟 Premium Header */}
      <div className="px-8 py-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-linear-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white">
            <LuSprout size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
              ZAR3A <span className="text-emerald-600 dark:text-emerald-400 font-light">{t("ai.title")}</span>
              <LuSparkles className="text-yellow-400" size={18} />
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t("ai.subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 Chat Viewport */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar scroll-smooth">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>

                {/* Avatar */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${msg.sender === "user"
                    ? "bg-linear-to-tr from-slate-800 to-slate-700 text-white"
                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-emerald-600"
                  }`}>
                  {msg.sender === "user" ? <LuUser size={22} /> : <LuBot size={24} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-7 py-5 text-[16px] leading-[1.8] shadow-sm ${msg.sender === "user"
                      ? "bg-slate-800 text-white rounded-4xl rounded-tr-sm"
                      : "bg-white dark:bg-slate-800/80 dark:text-slate-200 rounded-4xl rounded-tl-sm border border-slate-100/80 dark:border-slate-700/50 backdrop-blur-sm"
                    }`}
                  dir={msg.sender === "ai" ? "auto" : "auto"}
                >
                  {msg.sender === "user" ? (
                    <p className="font-medium">{msg.text}</p>
                  ) : (
                    /* 🎨 Pro Markdown Styling (Fixed className issue) */
                    <div className="markdown-body font-medium text-slate-700 dark:text-slate-200 
                      [&>h3]:text-xl [&>h3]:font-black [&>h3]:text-emerald-700 dark:[&>h3]:text-emerald-400 [&>h3]:mb-4 [&>h3]:mt-2
                      [&>ul]:list-disc [&>ul]:mx-5 [&>ul]:mb-4 [&>ul]:space-y-2 [&>ul>li]:pl-1
                      [&>ol]:list-decimal [&>ol]:mx-5 [&>ol]:mb-4 [&>ol]:space-y-2
                      [&>p]:mb-4 last:[&>p]:mb-0
                      [&>strong]:text-slate-900 dark:[&>strong]:text-white [&>strong]:font-bold
                      [&>hr]:border-slate-200 dark:[&>hr]:border-slate-700 [&>hr]:my-4"
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 ml-2">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
              <LuBot size={24} className="text-emerald-600" />
            </div>
            <div className="px-6 py-5 bg-white dark:bg-slate-800/80 rounded-4xl rounded-tl-sm border border-slate-100/80 shadow-sm flex items-center gap-2 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </motion.div>
        )}

      </div>

      {/* 🚀 Glass Input Section */}
      <div className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4 bg-white dark:bg-slate-800 p-2.5 px-6 rounded-4xl shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-emerald-500/40 focus-within:shadow-emerald-500/10 transition-all duration-300">
          <input
            className="flex-1 bg-transparent border-none outline-none py-3 text-lg font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
            placeholder={t("ai.placeholder")}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            dir="auto"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !inputText.trim()}
            className="w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 active:scale-90 transition-all duration-200 shrink-0"
          >
            <LuSend size={22} className={document.dir === 'rtl' ? "mr-1" : "ml-1"} />
          </button>
        </div>
        <p className="text-center text-[11px] font-semibold text-slate-400 mt-4 tracking-wide">
          ZAR3A PROJECT 2026 • CONFIDENTIAL ACADEMIC PROTOTYPE
        </p>
      </div>

    </div>
  );
};

export default AIAssistant;