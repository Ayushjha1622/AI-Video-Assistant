import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState("");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRecentAnalyses();
  }, []);

  const fetchRecentAnalyses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentAnalyses(response.data);
    } catch (err) {
      console.error("Failed to fetch analyses:", err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!videoUrl) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analysis`,
        { videoUrl, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/analysis/${response.data._id}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to analyze video. Please check URL and server status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400">Process new video files or review past meeting transcripts.</p>
        </div>
      </div>

      {/* Analysis Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <h2 className="text-xl font-bold text-white mb-4">Start New Video Analysis</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                YouTube URL or Local Media Path
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Preferred Language
              </label>
              <select
                value={language}
                disabled={loading}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="english">English</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/10 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Processing Pipeline (Whisper & RAG)..." : "Analyze Video"}
          </button>
        </form>
      </div>

      {/* Recent Analyses Grid/Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Analyses</h2>
          <Link to="/history" className="text-indigo-400 hover:underline text-sm font-semibold">
            View All History →
          </Link>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <svg
              className="w-12 h-12 mx-auto text-slate-700 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-semibold">No recent analyses found</p>
            <p className="text-sm">Submit your first video link above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Source URL</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 text-sm">
                {recentAnalyses.slice(0, 5).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white truncate max-w-xs">
                      {item.title}
                    </td>
                    <td className="py-4 px-4 text-slate-400 truncate max-w-xs">
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-400"
                      >
                        {item.videoUrl}
                      </a>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link
                        to={`/analysis/${item._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors font-medium text-xs"
                      >
                        View Report
                      </Link>
                      <Link
                        to={`/chat?analysisId=${item._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all font-medium text-xs"
                      >
                        Chat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
