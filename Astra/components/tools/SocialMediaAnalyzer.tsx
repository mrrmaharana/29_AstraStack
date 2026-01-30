"use client"

import { useState } from "react"
import { ArrowLeft, Users, CheckCircle, XCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SocialMediaAnalyzerProps {
  onBack: () => void
}

const platforms = [
  { name: "Twitter", icon: "𝕏", color: "text-black", urlPattern: "https://twitter.com/{username}" },
  { name: "GitHub", icon: "◇", color: "text-slate-300", urlPattern: "https://github.com/{username}" },
  { name: "LinkedIn", icon: "in", color: "text-blue-600", urlPattern: "https://linkedin.com/in/{username}" },
  { name: "Instagram", icon: "◉", color: "text-pink-600", urlPattern: "https://instagram.com/{username}" },
  { name: "Facebook", icon: "f", color: "text-blue-700", urlPattern: "https://facebook.com/{username}" },
  { name: "Reddit", icon: "⦿", color: "text-orange-600", urlPattern: "https://reddit.com/u/{username}" },
  { name: "TikTok", icon: "♪", color: "text-slate-300", urlPattern: "https://tiktok.com/@{username}" },
  { name: "YouTube", icon: "▶", color: "text-red-600", urlPattern: "https://youtube.com/@{username}" },
]

export default function SocialMediaAnalyzer({ onBack }: SocialMediaAnalyzerProps) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleSearch = async () => {
    if (!username) return
    setLoading(true)

    // Mock API call
    setTimeout(() => {
      const found = platforms.map((platform) => ({
        ...platform,
        exists: Math.random() > 0.4,
        followers: Math.floor(Math.random() * 50000),
        following: Math.floor(Math.random() * 1000),
        posts: Math.floor(Math.random() * 500),
        verified: Math.random() > 0.8,
        lastActivity: `${Math.floor(Math.random() * 30)} days ago`,
        joinDate: `${2015 + Math.floor(Math.random() * 8)}-${Math.floor(Math.random() * 11) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      }))

      setResults({
        username,
        totalFound: found.filter((p) => p.exists).length,
        profiles: found,
        riskScore: Math.floor(Math.random() * 80) + 20,
      })
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-gradient-to-br from-slate-900 to-black border border-orange-500/20 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-pink-600 to-pink-900">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Social Media Profile Analyzer</h1>
              <p className="text-sm text-slate-400">Search for profiles across major platforms</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Username</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter username to search"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-900/50 border-orange-500/30 text-white placeholder-slate-500"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={!username || loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-600">{results.totalFound}</div>
                  <div className="text-xs text-slate-400 mt-1">Profiles Found</div>
                </div>
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600">{results.riskScore}</div>
                  <div className="text-xs text-slate-400 mt-1">Exposure Risk</div>
                </div>
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">{results.totalFound > 0 ? "HIGH" : "LOW"}</div>
                  <div className="text-xs text-slate-400 mt-1">Digital Footprint</div>
                </div>
              </div>

              {/* Profiles Grid */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Platform Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.profiles.map((profile: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className={`text-2xl font-bold mb-1 ${profile.color}`}>{profile.icon}</div>
                          <h4 className="font-bold text-white">{profile.name}</h4>
                        </div>
                        {profile.exists ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      {profile.exists && (
                        <div className="space-y-2 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>Followers:</span>
                            <span className="text-orange-400">{profile.followers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Posts:</span>
                            <span className="text-orange-400">{profile.posts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Active:</span>
                            <span className="text-orange-400">{profile.lastActivity}</span>
                          </div>
                          {profile.verified && (
                            <div className="text-blue-400 flex items-center gap-1 mt-2">
                              ✓ Verified
                            </div>
                          )}
                        </div>
                      )}

                      {profile.exists && (
                        <a
                          href={profile.urlPattern.replace("{username}", username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-3"
                        >
                          <Button className="w-full bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 text-xs h-8">
                            View Profile
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                <h3 className="font-bold text-white mb-3">Privacy Recommendations</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Review privacy settings on all discovered accounts</li>
                  <li>• Limit personal information visibility</li>
                  <li>• Consider deactivating unused accounts</li>
                  <li>• Enable two-factor authentication where available</li>
                  <li>• Monitor your digital footprint regularly</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
