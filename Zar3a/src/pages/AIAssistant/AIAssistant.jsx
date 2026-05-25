import { useState, useRef, useEffect } from "react";
import Groq from "groq-sdk";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { LuSend, LuBot, LuUser, LuSprout, LuActivity, LuSparkles } from "react-icons/lu";

// 🔑 الـ API Key من متغيرات البيئة
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; 

if (!GROQ_API_KEY) {
  console.warn('Warning: VITE_GROQ_API_KEY environment variable is not set');
}

const groq = new Groq({ 
  apiKey: GROQ_API_KEY, 
  dangerouslyAllowBrowser: true 
});

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: "ai", 
      text: "### أهلاً بك في **زرعة الذكي** 🌿\n\nأنا خبيرك الزراعي المدعوم بالذكاء الاصطناعي. مستعد لتقديم استشارات دقيقة حول:\n* تشخيص أمراض النباتات.\n* جداول التسميد والري.\n* تحسين جودة التربة.\n\n**كيف يمكنني مساعدة محاصيلك اليوم؟**\n\n*(You can also speak to me in English!)*" 
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;
    
    const userMsg = inputText;
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);

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
              ZAR3A <span className="text-emerald-600 dark:text-emerald-400 font-light">Intelligence</span>
              <LuSparkles className="text-yellow-400" size={18} />
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Llama 3.3 Engine Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 Chat Viewport */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar scroll-smooth">
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
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  msg.sender === "user" 
                  ? "bg-linear-to-tr from-slate-800 to-slate-700 text-white" 
                  : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-emerald-600"
                }`}>
                  {msg.sender === "user" ? <LuUser size={22}/> : <LuBot size={24}/>}
                </div>
                
                {/* Message Bubble */}
                <div 
                  className={`px-7 py-5 text-[16px] leading-[1.8] shadow-sm ${
                    msg.sender === "user" 
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
              <LuBot size={24} className="text-emerald-600"/>
            </div>
            <div className="px-6 py-5 bg-white dark:bg-slate-800/80 rounded-4xl rounded-tl-sm border border-slate-100/80 shadow-sm flex items-center gap-2 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 🚀 Glass Input Section */}
      <div className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4 bg-white dark:bg-slate-800 p-2.5 px-6 rounded-4xl shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-emerald-500/40 focus-within:shadow-emerald-500/10 transition-all duration-300">
          <input 
            className="flex-1 bg-transparent border-none outline-none py-3 text-lg font-medium text-slate-800 dark:text-white placeholder:text-slate-400" 
            placeholder="صف مشكلة محصولك أو استشر الخبير الزرعي..." 
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