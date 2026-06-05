import React, { useState } from "react";
import axios from "axios";

export default function Home({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };
      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (response.data && response.data.token) {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please verify your credentials and server status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
        {/* Left Side: Product Intro */}
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wide">
            ✨ Introducing AI Video Assistant
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Transcribe, summarize, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">chat with your meetings</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
            Upload your meeting audios or paste YouTube URL links. Our pipeline uses Whisper speech-to-text, LLM summarization, and Chroma RAG vector databases to create interactive chats from any discussion.
          </p>

          {/* Core features bullet points */}
          <div className="space-y-3 pt-2">
            {[
              "High accuracy transcription with local Whisper",
              "Actionable item extraction & meeting minutes generation",
              "Conversational AI Chat powered by LangChain Chroma RAG",
              "Secure authentication with user dashboard history",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Glassmorphism Auth Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-center mb-6">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/20 transition duration-200 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-indigo-400 hover:underline focus:outline-none font-semibold"
              >
                {isLogin ? "Register now" : "Log in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
