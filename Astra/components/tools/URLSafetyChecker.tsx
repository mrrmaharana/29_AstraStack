"use client"

import { useState } from "react"
import { ArrowLeft, Link2, AlertTriangle, CheckCircle, XCircle, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface URLSafetyCheckerProps {
  onBack: () => void
}

export default function URLSafetyChecker({ onBack }: URLSafetyCheckerProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [history, setHistory] = useState<string[]>([])

  const handleCheck = async () => {
    if (!url) return
    setLoading(true)

    // Mock API call
    setTimeout(() => {
      const isSafe = Math.random() > 0.2
      const threatLevel = isSafe ? "safe" : ["suspicious", "dangerous"][Math.floor(Math.random() * 2)]

      setResults({
        url,
        threatLevel,
        sslValid: Math.random() > 0.1,
        domainReputation: Math.floor(Math.random() * 100),
        malwareDetected: !isSafe && Math.random() > 0.4,
        phishingDetected: !isSafe && Math.random() > 0.5,
        redirects: Math.random() > 0.7,
        redirectChain: [
          "https://example.com/start",
          "https://redirect1.com/page",
          "https://final-destination.com",
        ],
        httpHeaders: {
          server: ["Apache", "Nginx", "Microsoft-IIS"][Math.floor(Math.random() * 3)],
          lastModified: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        },
        category: ["News", "Shopping", "Search", "Social", "Malware", "Phishing"][Math.floor(Math.random() * 6)],
      })

      setHistory([url, ...history.slice(0, 4)])
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
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-600 to-green-900">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">URL Safety Checker</h1>
              <p className="text-sm text-slate-400">Analyze URLs for threats and security issues</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">URL to Check</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-slate-900/50 border-orange-500/30 text-white placeholder-slate-500"
                  onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                />
                <Button
                  onClick={handleCheck}
                  disabled={!url || loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8"
                >
                  {loading ? "Checking..." : "Scan"}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Safety Status */}
              {results.threatLevel === "safe" ? (
                <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-6 flex items-start gap-4">
                  <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-green-400 mb-1">Site is Safe</h3>
                    <p className="text-sm text-slate-300">This URL appears to be safe based on security analysis</p>
                  </div>
                </div>
              ) : results.threatLevel === "suspicious" ? (
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-6 flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-1">Suspicious Activity Detected</h3>
                    <p className="text-sm text-slate-300">This URL has shown signs of suspicious behavior</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 flex items-start gap-4">
                  <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-1">Dangerous - Do Not Visit</h3>
                    <p className="text-sm text-slate-300">This URL has been flagged as dangerous</p>
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">SSL Certificate</div>
                  <div className="flex items-center gap-2">
                    {results.sslValid ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-white">Valid</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-white">Invalid</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Domain Reputation</div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-600">{results.domainReputation}%</div>
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-green-600"
                        style={{ width: `${results.domainReputation}%` }}
                      />
                    </div>
                  </div>
                </div>

                {results.malwareDetected && (
                  <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Malware Detection</div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-400">Malware Detected</span>
                    </div>
                  </div>
                )}

                {results.phishingDetected && (
                  <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Phishing Detection</div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-400">Phishing Attempt</span>
                    </div>
                  </div>
                )}
              </div>

              {/* HTTP Headers */}
              <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                <h3 className="font-bold text-white mb-3">Server Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Server</div>
                    <div className="text-white">{results.httpHeaders.server}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Category</div>
                    <div className="text-white">{results.category}</div>
                  </div>
                </div>
              </div>

              {/* Redirect Chain */}
              {results.redirects && (
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">Redirect Chain</h3>
                  <div className="space-y-2">
                    {results.redirectChain.map((link: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 text-sm">{idx + 1}.</span>
                        <span className="text-slate-300 text-sm font-mono break-all">{link}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Scans
                  </h3>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUrl(item)}
                        className="w-full text-left text-xs p-2 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-orange-400 transition-colors truncate"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
