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
  LuX,
  LuFileText,
  LuDownload,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import api from "../../API/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";

const isImageUrl = (url) => {
  if (!url) return false;
  return /\.(png|jpg|jpeg|webp|gif)$/i.test(url);
};

const Chat = () => {
  const { t } = useLanguage();
  const { expertId } = useParams();

  const navigate = useNavigate();
  const { user, loading, getChatHistory, sendChatMessage } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [expertInfo, setExpertInfo] = useState(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    if (!expertId) { setMessages([]); setChatLoading(false); return; }

    const loadChat = async () => {
      setChatLoading(true);
      try {
        const data = await getChatHistory(expertId);
        setMessages(
          (data.messages || []).map((msg) => ({
            id: msg.id,
            sender: msg.senderId === user.id ? 'user' : 'expert',
            text: msg.message,
            attachmentUrl: msg.attachmentUrl || null,
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
  }, [expertId, getChatHistory, navigate, user, loading]);

  // Load expert info for the info panel
  useEffect(() => {
    if (!expertId) return;
    const loadExpertInfo = async () => {
      try {
        const { data } = await api.get('/marketplace/expert-listings');
        const listings = Array.isArray(data) ? data : [];
        const match = listings.find(l => String(l.userId) === String(expertId));
        if (match) {
          setExpertInfo({
            name: match.User?.fullName || 'Expert',
            email: match.User?.email || '',
            specialty: match.specialty || match.title || '',
            hourlyRate: match.hourlyRate || 0,
            description: match.description || '',
            location: match.location || '',
          });
        }
      } catch (err) {
        console.error('Failed to load expert info:', err);
      }
    };
    loadExpertInfo();
  }, [expertId]);

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
    if ((!message.trim() && !selectedFile) || !expertId) return;

    setSending(true);
    try {
      const result = await sendChatMessage(expertId, message.trim() || null, selectedFile);
      const createdMsg = result.data || result;
      const newMessage = {
        id: createdMsg?.id || Date.now(),
        sender: 'user',
        text: createdMsg?.message || message.trim(),
        attachmentUrl: createdMsg?.attachmentUrl || null,
        time: new Date(createdMsg?.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage('');
      setSelectedFile(null);
      setError('');
    } catch (err) {
      console.error('Send message failed:', err);
      setError(err?.response?.data?.message || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100dvh-140px)] flex flex-col bg-surface-card dark:bg-slate-950 rounded-[3rem] shadow-2xl border border-border-default dark:border-slate-800 overflow-hidden transition-all duration-500">
      
      {/* 1. Header */}
      <header className="px-8 py-5 border-b border-border-default dark:border-slate-800 flex items-center justify-between bg-surface-card/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-5">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-3 bg-surface-secondary dark:bg-slate-900 text-text-subtle dark:text-gray-300 rounded-2xl transition-colors shadow-sm"
          >
            <LuArrowLeft size={20} />
          </motion.button>

          <div className="relative">
            <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-700 rounded-[1.2rem] p-0.5 shadow-lg">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${expertId}`}
                className="w-full h-full rounded-[1.1rem] bg-surface-card dark:bg-slate-800"
                alt="Expert"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-slate-950 rounded-full animate-pulse"></div>
          </div>

          <div>
            <h2 className="font-black text-text-main dark:text-white text-lg tracking-tight leading-none">
              {expertInfo?.name || t("chat.expertChat")}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <p className="text-[10px] font-black text-primary-base dark:text-green-400 uppercase tracking-widest transition-colors">
                {t("chat.activeNow")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`p-3 transition-colors rounded-2xl ${showInfoPanel ? 'text-primary-base bg-primary-light dark:bg-green-900/20' : 'text-text-disabled hover:text-primary-base dark:hover:text-green-400'}`}
            title={t("experts.viewProfile")}
          >
            <LuInfo size={22} />
          </button>
          <button
            onClick={() => navigate('/experts')}
            className="p-3 text-text-disabled hover:text-primary-base dark:hover:text-green-400 transition-colors rounded-2xl"
            title={t("nav.experts")}
          >
            <LuUser size={22} />
          </button>
        </div>
      </header>

      {/* Expert Info Panel */}
      <AnimatePresence>
        {showInfoPanel && expertInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b border-border-default dark:border-slate-800"
          >
            <div className="px-8 py-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-text-main dark:text-white text-sm uppercase tracking-widest">{t("chat.details")}</h3>
                <button onClick={() => setShowInfoPanel(false)} className="text-text-disabled hover:text-text-subtle dark:hover:text-gray-300">
                  <LuX size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-wider">{t("experts.specialty")}</p>
                  <p className="text-sm font-bold text-text-main dark:text-white">{expertInfo.specialty || t("admin.cvNA")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-wider">{t("experts.hourlyRate")}</p>
                  <p className="text-sm font-bold text-primary-base dark:text-green-400">EGP {Number(expertInfo.hourlyRate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-wider">{t("experts.location")}</p>
                  <p className="text-sm font-bold text-text-main dark:text-white">{expertInfo.location || t("admin.cvNA")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-wider">{t("admin.tableEmail")}</p>
                  <p className="text-sm font-bold text-text-main dark:text-white">{expertInfo.email || t("admin.cvNA")}</p>
                </div>
              </div>
              {expertInfo.description && (
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-wider">{t("chat.about")}</p>
                  <p className="text-xs text-text-subtle dark:text-gray-300 leading-relaxed mt-1">{expertInfo.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 2. Chat Workspace */}
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface-secondary/30 dark:bg-slate-950/30 relative">
        <div className="flex justify-center mb-4">
          <span className="px-5 py-2 bg-surface-card dark:bg-slate-900 shadow-sm rounded-2xl text-[10px] font-black text-text-disabled dark:text-text-muted uppercase tracking-[0.2em] border border-border-default dark:border-slate-800">
            {t("chat.today")}
          </span>
        </div>

        {chatLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            <p className="text-sm text-text-disabled font-bold">{t("chat.loadingMsgs")}</p>
          </div>
        ) : (
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
                        ? "bg-primary-base text-white rounded-tr-none hover:shadow-green-200/50"
                        : "bg-surface-card dark:bg-slate-900 text-text-main dark:text-slate-100 rounded-tl-none border border-border-default dark:border-slate-800"
                    }`}
                  >
                    {/* Attachment rendering */}
                    {msg.attachmentUrl && (
                      <div className="mb-2">
                        {isImageUrl(msg.attachmentUrl) ? (
                          <a href={`${API_BASE}${msg.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                            <img
                              src={`${API_BASE}${msg.attachmentUrl}`}
                              alt="Attachment"
                              className="max-w-full max-h-48 rounded-2xl object-cover border border-white/20"
                            />
                          </a>
                        ) : (
                          <a
                            href={`${API_BASE}${msg.attachmentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition ${
                              msg.sender === 'user'
                                ? 'bg-surface-card/20 hover:bg-surface-card/30 text-white'
                                : 'bg-surface-secondary dark:bg-slate-800 hover:bg-surface-secondary dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            <LuFileText size={18} />
                            <span>{t("chat.viewDoc")}</span>
                            <LuDownload size={14} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Only show text if it's not just the attachment placeholder */}
                    {msg.text && msg.text !== '📎 Attachment' && (
                      <p className="text-[15px] font-medium leading-relaxed break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere' }}>
                        {msg.text}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 px-2 opacity-60">
                    <span className="text-[10px] font-bold text-text-disabled dark:text-text-subtle uppercase tracking-tighter">
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
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-red-500 font-bold text-sm">{error}</p>
          </div>
        )}
      </main>


      {/* File preview bar */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border-default dark:border-slate-800"
          >
            <div className="px-8 py-3 bg-primary-light dark:bg-green-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFile.type.startsWith('image/') ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-green-200 dark:border-green-800">
                    <img src={URL.createObjectURL(selectedFile)} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <LuFileText size={18} className="text-primary-base" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-green-800 dark:text-green-300 truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-[10px] text-primary-base dark:text-green-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
              >
                <LuX size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Input Console */}
      <footer className="p-8 bg-surface-card dark:bg-slate-950 border-t border-gray-50 dark:border-slate-900">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-4 bg-surface-secondary/50 dark:bg-slate-900/50 p-2.5 pl-6 rounded-[2.5rem] focus-within:bg-surface-card dark:focus-within:bg-slate-900 transition-all duration-500 shadow-inner border border-transparent focus-within:border-green-500/30"
        >
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 text-text-disabled hover:text-primary-base transition-colors"
              title="Send Image"
            >
              <LuImage size={22} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-text-disabled hover:text-primary-base transition-colors"
              title="Send Document"
            >
              <LuPaperclip size={22} />
            </button>
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={selectedFile ? t("chat.caption") : t("chat.typeHere")}
            className="flex-1 bg-transparent border-none outline-none text-text-main dark:text-white placeholder:text-text-disabled font-medium py-3"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={sending || (!message.trim() && !selectedFile)}
            className={`px-8 py-4 rounded-[1.8rem] font-black shadow-lg transition-all flex items-center gap-2 ${
              sending || (!message.trim() && !selectedFile)
                ? 'bg-gray-300 dark:bg-slate-700 text-text-muted cursor-not-allowed shadow-none'
                : 'bg-primary-base hover:bg-primary-hover text-white shadow-green-200 dark:shadow-none'
            }`}
          >
            <span className="hidden sm:inline">{sending ? t("chat.sending") : t("chat.send")}</span>
            <LuSend size={18} />
          </motion.button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;