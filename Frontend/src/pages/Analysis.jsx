import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Analysis() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [completedItems, setCompletedItems] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load analysis report.");
    } finally {
      setLoading(false);
    }
  };

  const toggleActionItem = (idx) => {
    setCompletedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400">Loading analysis reports...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Analysis</h3>
        <p className="text-slate-300 mb-4">{error || "The analysis report could not be found."}</p>
        <Link to="/dashboard" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "summary", label: "Executive Summary", icon: "📝" },
    { id: "actionItems", label: "Action Items", icon: "✅" },
    { id: "keyDecisions", label: "Key Decisions", icon: "🔑" },
    { id: "openQuestions", label: "Open Questions", icon: "❓" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Analysis Report</span>
          <h1 className="text-3xl font-black text-white mt-1">{analysis.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Source URL:{" "}
            <a href={analysis.videoUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate inline-block max-w-md align-bottom">
              {analysis.videoUrl}
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/chat?analysisId=${analysis._id}`}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition duration-200"
          >
            💬 Chat with Meeting
          </Link>
          <Link to="/dashboard" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition duration-200">
            Back
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-800 gap-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl min-h-[300px]">
        {activeTab === "summary" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Summary Overview</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-base">
              {analysis.summary || "No executive summary generated for this video."}
            </p>
          </div>
        )}

        {activeTab === "actionItems" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Meeting Action Items</h3>
            {(!analysis.actionItems || analysis.actionItems.length === 0) ? (
              <p className="text-slate-500 italic">No action items extracted from the transcript.</p>
            ) : (
              <div className="space-y-3">
                {analysis.actionItems.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:border-slate-700 transition cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!completedItems[idx]}
                      onChange={() => toggleActionItem(idx)}
                      className="mt-1 w-4 h-4 rounded accent-indigo-500 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-slate-300 leading-relaxed text-sm ${completedItems[idx] ? "line-through text-slate-500" : ""}`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "keyDecisions" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Key Decisions Made</h3>
            {(!analysis.keyDecisions || analysis.keyDecisions.length === 0) ? (
              <p className="text-slate-500 italic">No key decisions extracted from the transcript.</p>
            ) : (
              <ul className="space-y-3">
                {analysis.keyDecisions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "openQuestions" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Open Questions & Follow-ups</h3>
            {(!analysis.openQuestions || analysis.openQuestions.length === 0) ? (
              <p className="text-slate-500 italic">No open questions identified in this session.</p>
            ) : (
              <ul className="space-y-3">
                {analysis.openQuestions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg">
                    <span className="text-indigo-400">❓</span>
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
