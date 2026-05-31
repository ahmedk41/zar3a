import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSend,
  LuMessageSquare,
  LuSearch,
  LuUser,
  LuCheckCheck,
  LuShield,
  LuArrowLeft,
  LuPaperclip,
  LuImage,
  LuFileText,
  LuDownload,
  LuX,
  LuInbox,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import api from "../../API/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";

const isImageUrl = (url) => {
  if (!url) return false;
  return /\.(png|jpg|jpeg|webp|gif)$/i.test(url);
};

const AdminChat = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, getConversations, getChatHistory, sendChatMessage } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [convoLoading, setConvoLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Active chat state
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Load conversations
  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    const fetchConversations = async () => {
      setConvoLoading(true);
      try {
        const { conversations: convos } = await getConversations();
        setConversations(convos || []);
      } catch (err) {
        console.error("Failed to load admin conversations:", err);
      } finally {
        setConvoLoading(false);
      }
    };

    fetchConversations();
  }, [user, loading, getConversations, navigate]);

  // Handle URL param for pre-selected user
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && conversations.length > 0) {
      const convo = conversations.find(c => String(c.user.id) === String(userId));
      if (convo) {
        openConversation(convo.user);
      }
    }
  }, [searchParams, conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const openConversation = async (chatUser) => {
    setActiveUserId(chatUser.id);
    setActiveUser(chatUser);
    setChatLoading(true);
    setError("");
    setSearchParams({ userId: chatUser.id });

    try {
      const data = await getChatHistory(chatUser.id);
      setMessages(
        (data.messages || []).map((msg) => ({
          id: msg.id,
          sender: msg.senderId === user.id ? "admin" : "other",
          senderName: msg.senderId === user.id ? "You (Admin)" : chatUser.fullName,
          text: msg.message,
          attachmentUrl: msg.attachmentUrl || null,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
      );
    } catch (err) {
      console.error("Failed to load chat:", err);
      setError("Unable to load conversation.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !activeUserId) return;

    setSending(true);
    try {
      const result = await sendChatMessage(activeUserId, message.trim() || null, selectedFile);
      const createdMsg = result.data || result;
      const newMessage = {
        id: createdMsg?.id || Date.now(),
        sender: "admin",
        senderName: "You (Admin)",
        text: createdMsg?.message || message.trim(),
        attachmentUrl: createdMsg?.attachmentUrl || null,
        time: new Date(createdMsg?.createdAt || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setSelectedFile(null);
      setError("");
    } catch (err) {
      console.error("Send message failed:", err);
      setError(err?.response?.data?.message || "Unable to send message.");
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
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const filteredConversations = conversations.filter((c) =>
    c.user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const colors = {
      FARMER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      BUYER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      SUPPLIER: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      AGRO_EXPERT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[role] || "bg-surface-secondary text-gray-700 dark:bg-gray-900/30 dark:text-text-disabled";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100dvh-140px)] flex bg-surface-card dark:bg-slate-950 rounded-[2rem] shadow-2xl border border-border-default dark:border-slate-800 overflow-hidden mt-2">

      {/* ─── Left Panel: Conversations List ─── */}
      <div className={`${activeUserId ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] border-e border-border-default dark:border-slate-800 bg-surface-secondary/50 dark:bg-slate-950`}>
        
        {/* Header */}
        <div className="px-6 py-5 bg-surface-card dark:bg-slate-900 border-b border-border-default dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <LuShield size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg text-text-main dark:text-white tracking-tight">
                {t("admin.chatTitle") || "Admin Messages"}
              </h2>
              <p className="text-[10px] font-bold text-text-disabled uppercase tracking-widest">
                {t("admin.chatSubtitle") || "Support & Communication"}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <LuSearch size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              placeholder={t("admin.searchUsers") || "Search users..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-3 bg-surface-secondary dark:bg-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-text-disabled border-none outline-none focus:ring-2 ring-indigo-500/30 transition"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {convoLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-xs text-text-disabled font-bold">{t("chat.loadingMsgs") || "Loading..."}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-text-disabled">
              <LuInbox size={40} className="opacity-30" />
              <p className="text-sm font-bold">{t("admin.noConversations") || "No conversations yet"}</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((convo) => (
                <motion.button
                  key={convo.user.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openConversation(convo.user)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-start ${
                    activeUserId === convo.user.id
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                      : "hover:bg-surface-card dark:hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center text-text-muted dark:text-slate-300 font-black text-lg">
                      {convo.user.fullName?.charAt(0)}
                    </div>
                    {convo.unreadCount > 0 && (
                      <div className="absolute -top-1 -end-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-gray-50 dark:border-slate-950">
                        {convo.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-text-main dark:text-white truncate">
                        {convo.user.fullName}
                      </p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${getRoleBadgeColor(convo.user.role)}`}>
                        {convo.user.role?.replace("_", " ") || "USER"}
                      </span>
                    </div>
                    <p className="text-xs text-text-disabled truncate mt-0.5">{convo.user.email}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Right Panel: Chat Window ─── */}
      <div className={`${activeUserId ? "flex" : "hidden md:flex"} flex-col flex-1 bg-surface-card dark:bg-slate-950`}>
        {!activeUserId ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4">
            <div className="w-24 h-24 bg-surface-secondary dark:bg-slate-900 rounded-[2rem] flex items-center justify-center">
              <LuMessageSquare size={40} />
            </div>
            <p className="font-bold text-lg">{t("admin.selectConversation") || "Select a conversation"}</p>
            <p className="text-sm text-text-disabled">{t("admin.selectConversationHint") || "Choose a user from the left to start chatting"}</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-border-default dark:border-slate-800 flex items-center gap-4 bg-surface-card/80 dark:bg-slate-950/80 backdrop-blur-xl z-10">
              <button
                onClick={() => {
                  setActiveUserId(null);
                  setActiveUser(null);
                  setMessages([]);
                  setSearchParams({});
                }}
                className="md:hidden p-2.5 bg-surface-secondary dark:bg-slate-900 rounded-xl text-text-muted"
              >
                <LuArrowLeft size={18} />
              </button>

              <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                {activeUser?.fullName?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-black text-text-main dark:text-white text-sm truncate">
                  {activeUser?.fullName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${getRoleBadgeColor(activeUser?.role)}`}>
                    {activeUser?.role?.replace("_", " ") || "USER"}
                  </span>
                  <span className="text-[10px] text-text-disabled">{activeUser?.email}</span>
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <main
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-secondary/30 dark:bg-slate-950/30"
            >
              {chatLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-xs text-text-disabled font-bold">{t("chat.loadingMsgs") || "Loading..."}</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-5 py-3.5 rounded-[1.8rem] shadow-sm transition-all ${
                            msg.sender === "admin"
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-surface-card dark:bg-slate-900 text-text-main dark:text-slate-100 rounded-tl-none border border-border-default dark:border-slate-800"
                          }`}
                        >
                          {/* Attachment */}
                          {msg.attachmentUrl && (
                            <div className="mb-2">
                              {isImageUrl(msg.attachmentUrl) ? (
                                <a href={`${API_BASE}${msg.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={`${API_BASE}${msg.attachmentUrl}`}
                                    alt="Attachment"
                                    className="max-w-full max-h-44 rounded-2xl object-cover border border-white/20"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={`${API_BASE}${msg.attachmentUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition ${
                                    msg.sender === "admin"
                                      ? "bg-surface-card/20 hover:bg-surface-card/30 text-white"
                                      : "bg-surface-secondary dark:bg-slate-800 hover:bg-surface-secondary dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                                  }`}
                                >
                                  <LuFileText size={16} />
                                  <span>{t("chat.viewDoc") || "View document"}</span>
                                  <LuDownload size={14} />
                                </a>
                              )}
                            </div>
                          )}

                          {msg.text && msg.text !== "📎 Attachment" && (
                            <p className="text-[14px] font-medium leading-relaxed">{msg.text}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 px-2 opacity-50">
                          <span className="text-[9px] font-bold text-text-disabled uppercase tracking-tight">
                            {msg.time}
                          </span>
                          {msg.sender === "admin" && (
                            <LuCheckCheck size={12} className="text-indigo-400" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {error && (
                <div className="text-center py-3">
                  <p className="text-red-500 font-bold text-xs">{error}</p>
                </div>
              )}
            </main>

            {/* File preview */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border-default dark:border-slate-800"
                >
                  <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedFile.type.startsWith("image/") ? (
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-indigo-200 dark:border-indigo-800">
                          <img src={URL.createObjectURL(selectedFile)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                          <LuFileText size={16} className="text-indigo-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveFile} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                      <LuX size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <footer className="p-5 bg-surface-card dark:bg-slate-950 border-t border-gray-50 dark:border-slate-900">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-surface-secondary/50 dark:bg-slate-900/50 p-2 ps-5 rounded-[2rem] focus-within:bg-surface-card dark:focus-within:bg-slate-900 transition-all shadow-inner border border-transparent focus-within:border-indigo-500/30"
              >
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileSelect} />

                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-text-disabled hover:text-indigo-600 transition">
                    <LuImage size={20} />
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-text-disabled hover:text-indigo-600 transition">
                    <LuPaperclip size={20} />
                  </button>
                </div>

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedFile ? (t("chat.caption") || "Add a caption...") : (t("admin.typeReply") || "Type your reply...")}
                  className="flex-1 bg-transparent border-none outline-none text-text-main dark:text-white placeholder:text-text-disabled font-medium py-2.5 text-sm"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={sending || (!message.trim() && !selectedFile)}
                  className={`px-6 py-3 rounded-[1.5rem] font-black text-sm shadow-lg transition-all flex items-center gap-2 ${
                    sending || (!message.trim() && !selectedFile)
                      ? "bg-gray-300 dark:bg-slate-700 text-text-muted cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none"
                  }`}
                >
                  <span className="hidden sm:inline">{sending ? (t("chat.sending") || "Sending...") : (t("chat.send") || "Send")}</span>
                  <LuSend size={16} />
                </motion.button>
              </form>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
