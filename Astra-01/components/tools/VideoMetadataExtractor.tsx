"use client"

import React from "react"
import { ArrowLeft } from "lucide-react"

interface VideoMetadataExtractorProps {
  onBack: () => void
}

export default function VideoMetadataExtractor({ onBack }: VideoMetadataExtractorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-orange-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Video Metadata (Removed)</h1>
            <p className="text-sm text-slate-400 mt-1">The basic Video Metadata extractor has been removed per project configuration.</p>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-700 rounded">
          <p className="text-slate-300">This feature was removed. Use the Video AI Analyzer for advanced video analysis.</p>
        </div>
      </div>
    </div>
  )
}
