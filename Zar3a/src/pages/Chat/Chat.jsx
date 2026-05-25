import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSend,
  LuArrowLeft,
  LuInfo,
  LuPaperclip,
  LuImage,
  LuCheckCheck,
  LuUser,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

const Chat = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const { user, loading, getChatHistory, sendChatMessage } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (!expertId) {
      setMessages([]);
      setChatLoading(false);
      return;
    }

    const loadChat = async () => {
      setChatLoading(true);
      try {
        const data = await getChatHistory(expertId);
        setMessages(
          (data.messages || []).map((msg) => ({
            id: msg.id,
            sender: msg.senderId === user.id ? 'user' : 'expert',
            text: msg.message,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          })),
        );
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError(err?.response?.data?.message || 'Unable to load conversation.');
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [expertId, getChatHistory, navigate, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !expertId) return;

    try {
      const result = await sendChatMessage(expertId, message.trim());
      const createdMsg = result.data.data || result.data;
      const newMessage = {
        id: createdMsg?.id || Date.now(),
        sender: 'user',
        text: createdMsg?.message || message.trim(),
        time: new Date(createdMsg?.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage('');
      setError('');
    } catch (err) {
      console.error('Send message failed:', err);
      setError(err?.response?.data?.message || 'Unable to send message.');
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100dvh-140px)] flex flex-col bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-500">
      
      {/* 1. Header */}
      <header className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-5">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-3 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 rounded-2xl transition-colors shadow-sm"
          >
            <LuArrowLeft size={20} />
          </motion.button>

          <div className="relative">
            <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-700 rounded-[1.2rem] p-0.5 shadow-lg">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${expertId}`}
                className="w-full h-full rounded-[1.1rem] bg-white dark:bg-slate-800"
                alt="Expert"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-slate-950 rounded-full animate-pulse"></div>
          </div>

          <div>
            <h2 className="font-black text-gray-900 dark:text-white text-lg tracking-tight leading-none">
              Expert Chat
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest transition-colors">
                Active Now
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-3 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <LuInfo size={22} />
          </button>
          <button className="p-3 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <LuUser size={22} />
          </button>
        </div>
      </header>

      {/* 2. Chat Workspace */}
      {/* 👈 أضفنا chatContainerRef هنا وقمنا بمسح الديف الوهمي من الأسفل */}
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 dark:bg-slate-950/30 relative">
        <div className="flex justify-center mb-4">
          <span className="px-5 py-2 bg-white dark:bg-slate-900 shadow-sm rounded-2xl text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border border-gray-100 dark:border-slate-800">
            Today • Consultation Started
          </span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`group max-w-[75%] md:max-w-[60%] flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-6 py-4 rounded-[2.2rem] shadow-sm relative transition-all duration-300 ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white rounded-tr-none hover:shadow-green-200/50"
                      : "bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-800"
                  }`}
                >
                  <p className="text-[15px] font-medium leading-relaxed">
                    {msg.text}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2 px-2 opacity-60">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-tighter">
                    {msg.time}
                  </span>
                  {msg.sender === "user" && (
                    <LuCheckCheck size={14} className="text-green-500" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* 3. Input Console */}
      <footer className="p-8 bg-white dark:bg-slate-950 border-t border-gray-50 dark:border-slate-900">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-4 bg-gray-100/50 dark:bg-slate-900/50 p-2.5 pl-6 rounded-[2.5rem] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-500 shadow-inner border border-transparent focus-within:border-green-500/30"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,.pdf,.doc"
            onChange={(e) => console.log("File chosen:", e.target.files[0])}
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleFileClick}
              className="p-2.5 text-gray-400 hover:text-green-600 transition-colors"
            >
              <LuImage size={22} />
            </button>
            <button
              type="button"
              onClick={handleFileClick}
              className="p-2.5 text-gray-400 hover:text-green-600 transition-colors"
            >
              <LuPaperclip size={22} />
            </button>
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-medium py-3"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-[1.8rem] font-black shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center gap-2"
          >
            <span className="hidden sm:inline">SEND</span>
            <LuSend size={18} />
          </motion.button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;