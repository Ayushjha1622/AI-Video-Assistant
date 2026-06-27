import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.videoUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Analysis History</h1>
        <p className="text-slate-400">Search and navigate through all your processed video meeting transcripts.</p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title or video URL..."
          className="w-full max-w-md px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading your history...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <p className="text-lg font-semibold text-slate-400">No matching analyses found</p>
          <p className="text-sm mt-1">Try refining your search term or launch a new analysis from the Dashboard.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/20">
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Source URL</th>
                  <th className="py-3.5 px-6">Processed Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 text-sm">
                {filteredAnalyses.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-850/10 transition-colors">
                    <td className="py-4.5 px-6 font-semibold text-white">
                      {item.title}
                    </td>
                    <td className="py-4.5 px-6 text-slate-400 max-w-xs truncate">
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-400"
                      >
                        {item.videoUrl}
                      </a>
                    </td>
                    <td className="py-4.5 px-6 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4.5 px-6 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/analysis/${item._id}`}
                        className="inline-flex items-center px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors font-medium text-xs"
                      >
                        Report
                      </Link>
                      <Link
                        to={`/chat?analysisId=${item._id}`}
                        className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all font-medium text-xs"
                      >
                        Chat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
