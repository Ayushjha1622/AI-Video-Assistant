import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [analysisTitle, setAnalysisTitle] = useState("Meeting Report");

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisDetails();
    }
    fetchChatSessions();
  }, [analysisId]);

  const fetchAnalysisDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analysis/${analysisId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysisTitle(response.data.title);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatSessions = async () => {
    try {
      setSessionsLoading(true);
      const url = analysisId
        ? `${import.meta.env.VITE_API_URL}/api/chat/sessions?analysisId=${analysisId}`
        : `${import.meta.env.VITE_API_URL}/api/chat/sessions`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(response.data);

      if (response.data.length > 0) {
        // Load first session by default
        handleSelectSession(response.data[0]);
      } else if (analysisId) {
        // Automatically create a session if none exist for this analysis
        await handleCreateSession();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleSelectSession = async (session) => {
    setActiveSession(session);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/messages/${session._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSession = async () => {
    if (!analysisId) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/session`,
        { analysisId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions((prev) => [response.data, ...prev]);
      handleSelectSession(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession || loading) return;

    const message = inputText.trim();
    setInputText("");
    setLoading(true);

    // Optimistically update UI with user message
    const tempUserMsg = { _id: Date.now().toString(), sender: "user", message };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/message`,
        { chatSessionId: activeSession._id, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Replace optimistic message and append AI reply
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempUserMsg._id).concat([response.data.userMessage, response.data.aiMessage])
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempUserMsg._id).concat([
          {
            _id: Date.now().toString(),
            sender: "ai",
            message: "⚠️ Connection error. Failed to retrieve reply from AI RAG engine.",
          },
        ])
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 text-left font-sans">
      {/* Sidebar - Sessions list */}
      <div className="w-80 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
        <div className="space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Chat Threads</h3>
            {analysisId && (
              <button
                onClick={handleCreateSession}
                className="p-1 px-2 text-xs bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded border border-indigo-500/20 transition-all"
              >
                + New
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <p className="text-slate-500 text-sm">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-slate-500 text-sm">No chat threads found. Go to Dashboard and open a report to chat.</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full text-left p-3 rounded-lg text-sm truncate block transition-all ${
                    activeSession?._id === session._id
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-950/40 hover:bg-slate-800 text-slate-300 border border-slate-800/80"
                  }`}
                >
                  {session.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {analysisId && (
          <Link
            to={`/analysis/${analysisId}`}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg text-center transition"
          >
            ← View Analysis Report
          </Link>
        )}
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between overflow-hidden shadow-xl">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Ask Meeting Assistant</h2>
            <p className="text-xs text-slate-400 truncate max-w-lg">
              Vector DB Context: <span className="text-indigo-400 font-semibold">{analysisTitle}</span>
            </p>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center max-w-md mx-auto space-y-3">
              <span className="text-4xl">🤖</span>
              <p className="font-semibold text-white">Ask anything about the transcript</p>
              <p className="text-sm">Our RAG engine will scan the vector store database for semantic matches and formulate a concise answer.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xl p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-950/80 text-slate-300 border border-slate-800 rounded-bl-none"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-950/80 text-slate-400 border border-slate-800 p-3.5 rounded-2xl rounded-bl-none flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/30 flex gap-2">
          <input
            type="text"
            required
            disabled={!activeSession}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            placeholder={activeSession ? "Type your question about the meeting..." : "Please select or create a thread first"}
          />
          <button
            type="submit"
            disabled={!activeSession || loading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition duration-200 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
