"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";

interface ChatThread {
  bookingId: string;
  serviceType: string;
  status: string;
  customerName: string;
  customerPhone?: string;
  providerName: string;
  vehicleInfo: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  text: string;
  createdAt: string;
}

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    try {
      const res = await api.get("/chat/threads");
      setThreads(res.data || []);
      if (!selectedBookingId && res.data?.length > 0) {
        setSelectedBookingId(res.data[0].bookingId);
      }
    } catch (err) {
      console.error("Error fetching chat threads:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedBookingId]);

  // Fetch messages for selected thread
  const fetchMessages = useCallback(async (bookingId: string) => {
    try {
      const res = await api.get(`/chat/${bookingId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (selectedBookingId) {
      fetchMessages(selectedBookingId);
      // Auto-poll active thread every 3.5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedBookingId);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [selectedBookingId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedBookingId || isSending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const res = await api.post(`/chat/${selectedBookingId}`, {
        text: textToSend,
        senderName: "TechTune Platform Support",
        senderRole: "admin",
      });

      setMessages((prev) => [...prev, res.data]);
      // Update preview in threads list
      setThreads((prev) =>
        prev.map((t) =>
          t.bookingId === selectedBookingId
            ? { ...t, lastMessage: textToSend, lastMessageTime: new Date().toISOString() }
            : t
        )
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(textToSend); // restore on error
    } finally {
      setIsSending(false);
    }
  };

  const activeThread = threads.find((t) => t.bookingId === selectedBookingId);

  const filteredThreads = threads.filter(
    (t) =>
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-mono">Loading dispatch communication channels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dispatch Communications &amp; Support Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time messaging between motorists and workshop technicians across active dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Live Dispatch Polling Active</span>
          </span>
        </div>
      </div>

      {/* ─── Desktop Two-Pane Chat Grid ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Pane (4 Cols): Threads List */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search motorist, workshop, plate..."
                className="w-full px-3 py-1.5 pl-8 rounded text-xs border border-slate-300 focus:outline-none focus:border-slate-900 bg-white"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[580px]">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No dispatch channels match search.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedBookingId === thread.bookingId;

                return (
                  <button
                    key={thread.bookingId}
                    onClick={() => setSelectedBookingId(thread.bookingId)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-white border-l-4 border-l-slate-900 shadow-2xs"
                        : "hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                        {thread.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{thread.bookingId.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate">
                      <span>{thread.vehicleInfo}</span>
                      <span>&bull;</span>
                      <span className="text-slate-700 font-semibold">{thread.providerName}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {thread.lastMessage}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                        {thread.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane (8 Cols): Message Timeline & Reply Editor */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {activeThread ? (
            <>
              {/* Channel Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{activeThread.customerName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200">
                      {activeThread.vehicleInfo}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                      {activeThread.providerName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Service: {activeThread.serviceType} &bull; Dispatch #{activeThread.bookingId.slice(-6).toUpperCase()}
                  </p>
                </div>

                <div className="text-right">
                  <a
                    href={`tel:${activeThread.customerPhone || "+85512345678"}`}
                    className="text-xs font-semibold text-blue-600 hover:underline font-mono"
                  >
                    {activeThread.customerPhone || "+855 12 345 678"}
                  </a>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3.5 max-h-[460px] bg-slate-50/25">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No messages sent in this channel yet.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCustomer = msg.senderId === "customer" || msg.senderName === activeThread.customerName;
                    const isAdmin = msg.senderRole === "admin" || msg.senderName.includes("Support");

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-lg ${
                          isCustomer ? "self-start items-start" : "self-end items-end ml-auto"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isCustomer
                              ? "bg-white border border-slate-200 text-slate-800 shadow-2xs"
                              : isAdmin
                              ? "bg-indigo-900 text-white font-medium shadow-2xs"
                              : "bg-slate-900 text-white shadow-2xs"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Admin Advisory Templates */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 self-center">Advisory:</span>
                <button
                  type="button"
                  onClick={() => setNewMessage("TechTune Support: Our central dispatch team is actively monitoring this road emergency.")}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] transition cursor-pointer"
                >
                  &quot;Dispatch team is monitoring...&quot;
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessage("TechTune Support: Workshop confirmed mobile van departure. ETA ~10 minutes.")}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] transition cursor-pointer"
                >
                  &quot;Workshop confirmed mobile van...&quot;
                </button>
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type an advisory or support message as TechTune Admin..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="px-4 py-2 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                >
                  {isSending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs">
              Select a dispatch channel on the left to review communication.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
