import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Chat from "./pages/Chat";
import History from "./pages/History";

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const location = useLocation();

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // If user is not authenticated, render the landing and auth screens
  if (!token) {
    return <Home onLogin={handleLogin} />;
  }

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/history", label: "History Log", icon: "🕒" },
    { path: "/chat", label: "AI RAG Chat", icon: "🤖" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5 flex-shrink-0">
        <div className="space-y-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">📽️</span>
            <div>
              <h2 className="font-black tracking-tight text-white leading-none">Video Assistant</h2>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">AI Coprocessor</span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5 text-left">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path) || (link.path === "/dashboard" && location.pathname === "/");
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-slate-800 pt-5 space-y-3 text-left">
          <div className="px-2">
            <p className="text-sm font-bold text-white truncate">{user?.name || "User Account"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "user@email.com"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-red-950/20 hover:text-red-400 text-slate-300 font-semibold rounded-xl text-sm transition-all border border-transparent hover:border-red-900/30"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Workspace gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis/:id" element={<Analysis />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
