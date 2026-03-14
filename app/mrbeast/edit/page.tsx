"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WORDS } from "@/lib/words";
import { ArrowLeft, Check, X } from "lucide-react";

type WordsType = Record<string, boolean>;

const VIDEO_TYPES: string[] = [
  "Competition",
  "Endurance",
  "Comparison",
  "Exploration",
  "Philanthropy",
];

export default function EditVideoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Competition");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [words, setWords] = useState<WordsType>(
    WORDS.reduce((acc, word) => {
      acc[word] = false;
      return acc;
    }, {} as WordsType)
  );

  const handleToggle = (word: string) => {
    setWords((prev) => ({ ...prev, [word]: !prev[word] }));
  };

  const resetForm = () => {
    setTitle("");
    setType("Competition");
    setDate("");
    setError("");
    setWords(
      WORDS.reduce((acc, word) => {
        acc[word] = false;
        return acc;
      }, {} as WordsType)
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !type || !date) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, date, words }),
      });

      const data = await res.json();

      if (res.ok) {
        resetForm();
        router.push("/mrbeast");
      } else {
        setError(data.error || "Failed to add video");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWords = WORDS.filter((word) =>
    word.toLowerCase().includes(filter.toLowerCase())
  );

  const activeWordCount = Object.values(words).filter((v) => v).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/mrbeast")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Add New Video</h1>
          <div className="w-12" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Form Section */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Title *
            </label>
            <input
              placeholder="e.g., MrBeast $100M Spend Challenge"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-green-500 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-green-500 rounded-lg text-white focus:outline-none transition-colors"
            >
              {VIDEO_TYPES.map((videoType) => (
                <option key={videoType} value={videoType}>
                  {videoType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Release Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-green-500 rounded-lg text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Words Section */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Words Mentioned</h2>
              <p className="text-sm text-gray-400 mt-1">
                {activeWordCount} word{activeWordCount !== 1 ? "s" : ""} mentioned
              </p>
            </div>
          </div>

          {/* Search Filter */}
          <input
            placeholder="Search words..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors mb-6"
          />

          {/* Words Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredWords.map((word) => (
              <button
                key={word}
                onClick={() => handleToggle(word)}
                className={`p-3 rounded-lg font-medium transition-all ${
                  words[word]
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50 hover:bg-green-500"
                    : "bg-slate-800 border border-slate-700 text-gray-300 hover:border-slate-600 hover:bg-slate-700"
                }`}
              >
                {word}
              </button>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No words match your search
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Video"}
          </button>
        </div>
      </div>
    </div>
  );
}