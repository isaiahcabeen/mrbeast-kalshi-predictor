"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-8 p-4">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Trading Assistants
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          Utilize these trading assistants to optimize your strategy and turn a profit!
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 w-full max-w-md">
        <button
          onClick={() => router.push("/mrbeast")}
          className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
        >
          MrBeast Trading Assistant
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
