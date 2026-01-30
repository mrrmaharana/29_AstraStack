"use client"

import { useState } from "react"
import { Mail, Lock, Globe, Users, ImageIcon, Link2 } from "lucide-react"
import EmailBreachChecker from "./tools/EmailBreachChecker"
import PasswordAnalyzer from "./tools/PasswordAnalyzer"
import DomainLookup from "./tools/DomainLookup"
import SocialMediaAnalyzer from "./tools/SocialMediaAnalyzer"
import ImageMetadataExtractor from "./tools/ImageMetadataExtractor"
import URLSafetyChecker from "./tools/URLSafetyChecker"

const tools = [
  { id: "email", icon: Mail, label: "Email Breach Checker", color: "from-red-600 to-red-900" },
  { id: "password", icon: Lock, label: "Password Analyzer", color: "from-blue-600 to-blue-900" },
  { id: "domain", icon: Globe, label: "Domain WHOIS", color: "from-purple-600 to-purple-900" },
  { id: "social", icon: Users, label: "Social Media", color: "from-pink-600 to-pink-900" },
  { id: "image", icon: ImageIcon, label: "Image Metadata", color: "from-yellow-600 to-yellow-900" },
  { id: "url", icon: Link2, label: "URL Safety", color: "from-green-600 to-green-900" },
]

export default function OSINTToolGrid() {
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const handleToolClick = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId)
  }

  if (expandedTool === "email") return <EmailBreachChecker onBack={() => setExpandedTool(null)} />
  if (expandedTool === "password") return <PasswordAnalyzer onBack={() => setExpandedTool(null)} />
  if (expandedTool === "domain") return <DomainLookup onBack={() => setExpandedTool(null)} />
  if (expandedTool === "social") return <SocialMediaAnalyzer onBack={() => setExpandedTool(null)} />
  if (expandedTool === "image") return <ImageMetadataExtractor onBack={() => setExpandedTool(null)} />
  if (expandedTool === "url") return <URLSafetyChecker onBack={() => setExpandedTool(null)} />

  return (
    <div className="p-8 bg-gradient-to-br from-black via-slate-950 to-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">OSINT Toolkit</h1>
          <p className="text-slate-400">Six professional intelligence gathering tools for cybersecurity analysis</p>
          <div className="mt-4 p-3 bg-orange-600/10 border border-orange-600/30 rounded text-xs text-orange-400">
            ⚠️ For educational and authorized security research purposes only
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className="group relative overflow-hidden rounded-lg border border-orange-500/20 bg-gradient-to-br from-slate-900 to-black p-6 transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: `linear-gradient(135deg, #e36212, transparent)` }} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${tool.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl text-orange-600/30 group-hover:text-orange-600 transition-colors">→</div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors text-left">{tool.label}</h3>
                  <p className="text-sm text-slate-400 mt-2 text-left">
                    {tool.id === "email" && "Check if your email appears in known data breaches"}
                    {tool.id === "password" && "Analyze password strength and exposure"}
                    {tool.id === "domain" && "Lookup domain registration and WHOIS data"}
                    {tool.id === "social" && "Verify social media profile existence"}
                    {tool.id === "image" && "Extract and analyze image metadata"}
                    {tool.id === "url" && "Check URL safety and SSL certificates"}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 group-hover:text-orange-500 transition-colors">
                    <span>Click to expand</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
