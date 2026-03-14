"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRecommendationColor, getRiskColor } from "@/lib/probability";

type Recommendation = {
  word: string;
  probability: number;
  confidence: number;
  marketPrice: number;
  expectedValue: number;
  action: "BUY" | "WAIT";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  profitPotential: number;
  lossRisk: number;
};

const VIDEO_TYPES = ["Unknown", "Competition", "Endurance", "Comparison", "Exploration", "Philanthropy"];

export default function PredictPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [videoType, setVideoType] = useState("Unknown");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/ev");
        const data = await res.json();

        const initialPrices: Record<string, string> = {};
        data.forEach((word: any) => {
          initialPrices[word.word] = "";
        });
        setPrices(initialPrices);
      } catch (err) {
        console.error("Failed to load words", err);
      }
    }

    loadData();
  }, []);

  const handlePriceChange = (word: string, value: string) => {
    setPrices((prev) => ({ ...prev, [word]: value }));

    // Auto-add word to selectedWords if price is entered
    if (value && !selectedWords.includes(word)) {
      setSelectedWords((prev) => [...prev, word]);
    }
    // Remove word if price is cleared
    else if (!value && selectedWords.includes(word)) {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
    }
  };

  const handleWordToggle = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };

  const calculateRecommendations = async () => {
    // Only include prices for words that are selected AND have a valid price entered
    const filteredPrices: Record<string, number> = {};

    selectedWords.forEach((word) => {
      const price = parseFloat(prices[word]);
      if (!isNaN(price) && price >= 0 && price <= 1) {
        filteredPrices[word] = price;
      }
    });

    if (Object.keys(filteredPrices).length === 0) {
      alert("Please enter valid prices (0-1) for at least one word");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prices: filteredPrices,
          videoType,
          wordsToAnalyze: Object.keys(filteredPrices),
        }),
      });

      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error("Failed to calculate recommendations", err);
      alert("Error calculating recommendations");
    } finally {
      setLoading(false);
    }
  };

  const buyRecommendations = recommendations.filter((r) => r.action === "BUY");
  const waitRecommendations = recommendations.filter((r) => r.action === "WAIT");
  const allWords = Object.keys(prices);
  const wordsWithPrices = selectedWords.filter((w) => prices[w]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/mrbeast")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Price Analysis</h1>
          <div className="w-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Word Selection */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4">Select Words</h2>

              {/* Video Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Next Video Type
                </label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors text-sm"
                >
                  {VIDEO_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {videoType !== "Unknown" && (
                  <p className="text-xs text-blue-400 mt-2">
                    ℹ️ Predictions adjusted for {videoType} videos
                  </p>
                )}
              </div>

              {/* Word Selection */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  Words to analyze ({selectedWords.length} selected)
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allWords.map((word) => (
                    <label
                      key={word}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWords.includes(word)}
                        onChange={() => handleWordToggle(word)}
                        className="w-4 h-4 rounded"
                      />
                      <span>{word}</span>
                      {prices[word] && (
                        <span className="text-xs text-green-400 ml-auto">
                          ${(parseFloat(prices[word]) * 100).toFixed(0)}c
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-xs text-gray-400 mb-2">
                  💡 How to use:
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Check words you want to analyze</li>
                  <li>• Enter prices on the right</li>
                  <li>• Click "Get Recommendations"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel: Price Inputs and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Input Grid */}
            {selectedWords.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Enter Prices ({wordsWithPrices.length}/{selectedWords.length})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {selectedWords.map((word) => (
                    <div key={word}>
                      <label className="block text-xs text-gray-400 mb-1">
                        {word}
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">$</span>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={prices[word]}
                          onChange={(e) => handlePriceChange(word, e.target.value)}
                          placeholder="0.00"
                          className="flex-1 px-2 py-2 bg-slate-900/50 border border-slate-700 rounded text-white placeholder-gray-600 focus:outline-none focus:border-green-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={calculateRecommendations}
                  disabled={loading || wordsWithPrices.length === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Analyzing..." : "Get Recommendations"}
                </button>
              </div>
            )}

            {selectedWords.length === 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                <p className="text-gray-400">Select at least one word to analyze</p>
              </div>
            )}

            {/* Results */}
            {recommendations.length > 0 && (
              <>
                {/* BUY Recommendations */}
                {buyRecommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-green-400 mb-4">
                      🟢 BUY ({buyRecommendations.length})
                    </h3>
                    <div className="space-y-4">
                      {buyRecommendations.map((rec) => (
                        <RecommendationCard key={rec.word} rec={rec} />
                      ))}
                    </div>
                  </div>
                )}

                {/* WAIT Recommendations */}
                {waitRecommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-yellow-400 mb-4">
                      🟡 WAIT ({waitRecommendations.length})
                    </h3>
                    <div className="space-y-4">
                      {waitRecommendations.map((rec) => (
                        <RecommendationCard key={rec.word} rec={rec} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No recommendations message */}
                {buyRecommendations.length === 0 && waitRecommendations.length === 0 && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No words match the selected criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-bold text-white">{rec.word}</h4>
        <div className="text-right">
          <p className="text-sm text-gray-400">Expected Value</p>
          <p className={`text-lg font-bold ${rec.expectedValue > 0 ? "text-green-400" : "text-red-400"}`}>
            {rec.expectedValue > 0 ? "+" : ""}{(rec.expectedValue * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-slate-900/50 rounded p-2">
          <p className="text-gray-400">Probability</p>
          <p className="font-semibold text-blue-400">{(rec.probability * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <p className="text-gray-400">Price</p>
          <p className="font-semibold text-purple-400">${(rec.marketPrice * 100).toFixed(0)}c</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <p className="text-gray-400">Confidence</p>
          <p className="font-semibold text-cyan-400">{(rec.confidence * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-900/50 rounded p-2">
          <p className="text-gray-400">Max Profit</p>
          <p className="font-semibold text-green-400">${((rec.profitPotential) * 100).toFixed(0)}c</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <p className={`text-gray-400`}>Risk Level</p>
          <p className={`font-semibold ${getRiskColor(rec.riskLevel)}`}>{rec.riskLevel}</p>
        </div>
      </div>
    </div>
  );
}