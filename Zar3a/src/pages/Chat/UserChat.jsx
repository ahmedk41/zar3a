import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSend,
  LuMessageSquare,
  LuSearch,
  LuCheckCheck,
  LuArrowLeft,
  LuPaperclip,
  LuImage,
  LuFileText,
  LuDownload,
  LuX,
  LuInbox,
  LuSprout,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";

const isImageUrl = (url) => {
  if (!url) return false;
  return /\.(png|jpg|jpeg|webp|gif)$/i.test(url);
};

const UserChat = () => {
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

  // Role-based theming
  const getRoleTheme = () => {
    switch (user?.role) {
      case "FARMER":
        return {
          gradient: "from-emerald-500 to-green-600",
          headerIcon: <LuSprout size={20} />,
          title: t("chat.myMessages") || "My Messages",
          subtitle: t("chat.conversations") || "Conversations",
          accent: "emerald",
          activeBg: "bg-emerald-50 dark:bg-emerald-900/20",
          activeBorder: "border-emerald-200 dark:border-emerald-800",
          msgBg: "bg-emerald-600",
          msgHover: "hover:bg-emerald-700",
          shadow: "shadow-emerald-200",
          ring: "ring-emerald-500/30",
          spinnerBorder: "border-emerald-600",
          checkColor: "text-emerald-400",
          filePreviewBg: "bg-emerald-50 dark:bg-emerald-950/20",
          filePreviewBorder: "border-emerald-200 dark:border-emerald-800",
          filePreviewText: "text-emerald-800 dark:text-emerald-300",
          filePreviewSize: "text-emerald-600 dark:text-emerald-500",
          fileIconColor: "text-emerald-600",
          fileIconBg: "bg-emerald-100 dark:bg-emerald-900/40",
          hoverText: "hover:text-emerald-600",
          focusBorder: "focus-within:border-emerald-500/30",
        };
      case "BUYER":
        return {
          gradient: "from-blue-500 to-cyan-600",
          headerIcon: <LuMessageSquare size={20} />,
          title: t("chat.myMessages") || "My Messages",
          subtitle: t("chat.conversations") || "Conversations",
          accent: "blue",
          activeBg: "bg-blue-50 dark:bg-blue-900/20",
          activeBorder: "border-blue-200 dark:border-blue-800",
          msgBg: "bg-blue-600",
          msgHover: "hover:bg-blue-700",
          shadow: "shadow-blue-200",
          ring: "ring-blue-500/30",
          spinnerBorder: "border-blue-600",
          checkColor: "text-blue-400",
          filePreviewBg: "bg-blue-50 dark:bg-blue-950/20",
          filePreviewBorder: "border-blue-200 dark:border-blue-800",
          filePreviewText: "text-blue-800 dark:text-blue-300",
          filePreviewSize: "text-blue-600 dark:text-blue-500",
          fileIconColor: "text-blue-600",
          fileIconBg: "bg-blue-100 dark:bg-blue-900/40",
          hoverText: "hover:text-blue-600",
          focusBorder: "focus-within:border-blue-500/30",
        };
      case "SUPPLIER":
        return {
          gradient: "from-orange-500 to-amber-600",
          headerIcon: <LuMessageSquare size={20} />,
          title: t("chat.myMessages") || "My Messages",
          subtitle: t("chat.conversations") || "Conversations",
          accent: "orange",
          activeBg: "bg-orange-50 dark:bg-orange-900/20",
          activeBorder: "border-orange-200 dark:border-orange-800",
          msgBg: "bg-orange-600",
          msgHover: "hover:bg-orange-700",
          shadow: "shadow-orange-200",
          ring: "ring-orange-500/30",
          spinnerBorder: "border-orange-600",
          checkColor: "text-orange-400",
          filePreviewBg: "bg-orange-50 dark:bg-orange-950/20",
          filePreviewBorder: "border-orange-200 dark:border-orange-800",
          filePreviewText: "text-orange-800 dark:text-orange-300",
          filePreviewSize: "text-orange-600 dark:text-orange-500",
          fileIconColor: "text-orange-600",
          fileIconBg: "bg-orange-100 dark:bg-orange-900/40",
          hoverText: "hover:text-orange-600",
          focusBorder: "focus-within:border-orange-500/30",
        };
      default:
        return {
          gradient: "from-green-500 to-emerald-600",
          headerIcon: <LuMessageSquare size={20} />,
          title: t("chat.myMessages") || "My Messages",
          subtitle: t("chat.conversations") || "Conversations",
          accent: "green",
          activeBg: "bg-green-50 dark:bg-green-900/20",
          activeBorder: "border-green-200 dark:border-green-800",
          msgBg: "bg-green-600",
          msgHover: "hover:bg-green-700",
          shadow: "shadow-green-200",
          ring: "ring-green-500/30",
          spinnerBorder: "border-green-600",
          checkColor: "text-green-400",
          filePreviewBg: "bg-green-50 dark:bg-green-950/20",
          filePreviewBorder: "border-green-200 dark:border-green-800",
          filePreviewText: "text-green-800 dark:text-green-300",
          filePreviewSize: "text-green-600 dark:text-green-500",
          fileIconColor: "text-green-600",
          fileIconBg: "bg-green-100 dark:bg-green-900/40",
          hoverText: "hover:text-green-600",
          focusBorder: "focus-within:border-green-500/30",
        };
    }
  };

  const theme = getRoleTheme();

  // Load conversations
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchConversations = async () => {
      setConvoLoading(true);
      try {
        const { conversations: convos } = await getConversations();
        setConversations(convos || []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
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
          sender: msg.senderId === user.id ? "me" : "other",
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
      setError(t("chat.loadError") || "Unable to load conversation.");
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
        sender: "me",
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
    return colors[role] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${theme.spinnerBorder}`}></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100dvh-140px)] flex bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden mt-2">

      {/* ─── Left Panel: Conversations List ─── */}
      <div className={`${activeUserId ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] border-e border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950`}>

        {/* Header */}
        <div className="px-6 py-5 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {theme.headerIcon}
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                {theme.title}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {theme.subtitle}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <LuSearch size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("chat.searchConversations") || "Search conversations..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ps-10 pe-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 border-none outline-none focus:ring-2 ${theme.ring} transition`}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {convoLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme.spinnerBorder}`}></div>
              <p className="text-xs text-slate-400 font-bold">{t("chat.loadingMsgs") || "Loading..."}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
              <LuInbox size={40} className="opacity-30" />
              <p className="text-sm font-bold">{t("chat.noConversations") || "No conversations yet"}</p>
              <p className="text-xs text-slate-400 px-8 text-center">{t("chat.startConversation") || "Start a conversation by contacting an expert from the Experts page"}</p>
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
                      ? `${theme.activeBg} border ${theme.activeBorder}`
                      : "hover:bg-white dark:hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-0.5 overflow-hidden`}>
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${convo.user.id}`}
                        className="w-full h-full rounded-[0.85rem] bg-white dark:bg-slate-800"
                        alt={convo.user.fullName}
                      />
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
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {convo.user.fullName}
                      </p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${getRoleBadgeColor(convo.user.role)}`}>
                        {convo.user.role?.replace("_", " ") || "USER"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{convo.user.email}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Right Panel: Chat Window ─── */}
      <div className={`${activeUserId ? "flex" : "hidden md:flex"} flex-col flex-1 bg-white dark:bg-slate-950`}>
        {!activeUserId ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center">
              <LuMessageSquare size={40} />
            </div>
            <p className="font-bold text-lg">{t("chat.selectConversation") || "Select a conversation"}</p>
            <p className="text-sm text-slate-400 text-center px-8">{t("chat.selectConversationHint") || "Choose a contact from the left to start chatting"}</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-10">
              <button
                onClick={() => {
                  setActiveUserId(null);
                  setActiveUser(null);
                  setMessages([]);
                  setSearchParams({});
                }}
                className="md:hidden p-2.5 bg-gray-50 dark:bg-slate-900 rounded-xl text-slate-500"
              >
                <LuArrowLeft size={18} />
              </button>

              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-2xl p-0.5 shadow-md`}>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUserId}`}
                    className="w-full h-full rounded-[0.85rem] bg-white dark:bg-slate-800"
                    alt={activeUser?.fullName}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white text-sm truncate">
                  {activeUser?.fullName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${getRoleBadgeColor(activeUser?.role)}`}>
                    {activeUser?.role?.replace("_", " ") || "USER"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">{t("chat.activeNow") || "Active"}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <main
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/30"
            >
              {/* Today marker */}
              <div className="flex justify-center mb-2">
                <span className="px-4 py-1.5 bg-white dark:bg-slate-900 shadow-sm rounded-2xl text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border border-gray-100 dark:border-slate-800">
                  {t("chat.today") || "Today"}
                </span>
              </div>

              {chatLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme.spinnerBorder}`}></div>
                  <p className="text-xs text-slate-400 font-bold">{t("chat.loadingMsgs") || "Loading..."}</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-5 py-3.5 rounded-[1.8rem] shadow-sm transition-all ${
                            msg.sender === "me"
                              ? `${theme.msgBg} text-white rounded-tr-none`
                              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-800"
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
                                    msg.sender === "me"
                                      ? "bg-white/20 hover:bg-white/30 text-white"
                                      : "bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
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
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                            {msg.time}
                          </span>
                          {msg.sender === "me" && (
                            <LuCheckCheck size={12} className={theme.checkColor} />
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
                  className="overflow-hidden border-t border-gray-100 dark:border-slate-800"
                >
                  <div className={`px-6 py-3 ${theme.filePreviewBg} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      {selectedFile.type.startsWith("image/") ? (
                        <div className={`w-9 h-9 rounded-xl overflow-hidden border ${theme.filePreviewBorder}`}>
                          <img src={URL.createObjectURL(selectedFile)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-xl ${theme.fileIconBg} flex items-center justify-center`}>
                          <LuFileText size={16} className={theme.fileIconColor} />
                        </div>
                      )}
                      <div>
                        <p className={`text-xs font-bold ${theme.filePreviewText} truncate max-w-[200px]`}>{selectedFile.name}</p>
                        <p className={`text-[10px] ${theme.filePreviewSize}`}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
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
            <footer className="p-5 bg-white dark:bg-slate-950 border-t border-gray-50 dark:border-slate-900">
              <form
                onSubmit={handleSendMessage}
                className={`flex items-center gap-3 bg-gray-100/50 dark:bg-slate-900/50 p-2 ps-5 rounded-[2rem] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-inner border border-transparent ${theme.focusBorder}`}
              >
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileSelect} />

                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => imageInputRef.current?.click()} className={`p-2 text-slate-400 ${theme.hoverText} transition`}>
                    <LuImage size={20} />
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 text-slate-400 ${theme.hoverText} transition`}>
                    <LuPaperclip size={20} />
                  </button>
                </div>

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedFile ? (t("chat.caption") || "Add a caption...") : (t("chat.typeHere") || "Type a message...")}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium py-2.5 text-sm"
                  dir="auto"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={sending || (!message.trim() && !selectedFile)}
                  className={`px-6 py-3 rounded-[1.5rem] font-black text-sm shadow-lg transition-all flex items-center gap-2 ${
                    sending || (!message.trim() && !selectedFile)
                      ? "bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed shadow-none"
                      : `${theme.msgBg} ${theme.msgHover} text-white ${theme.shadow} dark:shadow-none`
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

export default UserChat;
