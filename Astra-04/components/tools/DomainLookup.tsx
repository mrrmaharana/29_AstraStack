"use client"

import { useState } from "react"
import { ArrowLeft, Globe, CheckCircle, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DomainLookupProps {
  onBack: () => void
}

export default function DomainLookup({ onBack }: DomainLookupProps) {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleLookup = async () => {
    if (!domain) return
    setLoading(true)

    try {
      // Clean domain input
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase()

      // 1. Get WHOIS Data from WhoisJsonApi
      let whoisData: any = {}
      try {
        const whoisResponse = await fetch(
          `https://www.whoisjsonapi.com/api/v1/whois?domain=${cleanDomain}`
        )
        if (whoisResponse.ok) {
          whoisData = await whoisResponse.json()
          console.log("[v0] WHOIS data:", whoisData)
        }
      } catch (err) {
        console.log("[v0] WHOIS API error:", err)
      }

      // 2. Get SSL Certificate info
      let sslData: any = {
        valid: false,
        issuer: "Unknown",
        expirationDate: "Unknown",
      }
      try {
        const sslResponse = await fetch(
          `https://crt.sh/?q=${cleanDomain}&output=json`
        )
        if (sslResponse.ok) {
          const certs = await sslResponse.json()
          if (certs && certs.length > 0) {
            const latestCert = certs[certs.length - 1]
            sslData = {
              valid: true,
              issuer: latestCert.issuer_name || "Let's Encrypt",
              expirationDate: new Date(latestCert.not_after).toISOString().split("T")[0],
            }
          }
        }
      } catch (err) {
        console.log("[v0] SSL data fetch skipped")
      }

      // 3. Get DNS records
      let dnsData: any = {}
      try {
        const dnsResponse = await fetch(
          `https://dns.google/resolve?name=${cleanDomain}&type=A`
        )
        if (dnsResponse.ok) {
          dnsData = await dnsResponse.json()
          console.log("[v0] DNS data:", dnsData)
        }
      } catch (err) {
        console.log("[v0] DNS lookup skipped")
      }

      // 4. Get reputation/domain info
      let reputationData: any = {}
      try {
        const repResponse = await fetch(
          `https://api.abuseipdb.com/api/v2/domain?domain=${cleanDomain}`,
          {
            headers: {
              Key: "demo", // Public demo key
            },
          }
        )
        if (repResponse.ok) {
          reputationData = await repResponse.json()
        }
      } catch (err) {
        console.log("[v0] Reputation lookup skipped")
      }

      // Parse results
      const createdDate = whoisData.registrar_registration_date || whoisData.registrant_created || "Unknown"
      const expireDate = whoisData.registrar_expiration_date || whoisData.registrant_expired || "Unknown"
      const nameservers = whoisData.nameservers || []
      const registrar = whoisData.registrar_name || whoisData.registrar || "Unknown"

      // Calculate days until expiration
      let daysUntilExpiration = 0
      if (expireDate && expireDate !== "Unknown") {
        const expireTime = new Date(expireDate).getTime()
        const currentTime = new Date().getTime()
        daysUntilExpiration = Math.ceil((expireTime - currentTime) / (1000 * 60 * 60 * 24))
      }

      // Get IP address from DNS
      const ipAddress = dnsData.Answer?.[0]?.data || "Not resolved"

      // Determine if domain is valid
      const isValid = expireDate !== "Unknown" && daysUntilExpiration > 0

      setResults({
        domain: cleanDomain,
        isValid,
        registrar: registrar || "Not available",
        creationDate: createdDate,
        expirationDate: expireDate,
        daysUntilExpiration: Math.max(0, daysUntilExpiration),
        ssl: sslData,
        nameservers: nameservers.slice(0, 4),
        ipAddress,
        country: whoisData.registrant_country || "Unknown",
        hosting:
          ipAddress.includes("cloudflare") || whoisData.data?.some((d: any) => d.includes("cloudflare"))
            ? "Cloudflare"
            : "Unknown",
        reputation: {
          abuseScore: reputationData.abuseConfidenceScore || 0,
          totalReports: reputationData.totalReports || 0,
        },
      })
    } catch (error) {
      console.log("[v0] Lookup error:", error)
      setResults({
        domain,
        error: "Could not retrieve WHOIS data. The domain may not exist or APIs are unavailable.",
        isValid: false,
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-6">
      <div className="max-w-4xl mx-auto">
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
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Domain WHOIS Lookup</h1>
              <p className="text-sm text-slate-400">Research domain registration and DNS information</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Domain Name</label>
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="bg-slate-900/50 border-orange-500/30 text-white placeholder-slate-500"
                  onKeyPress={(e) => e.key === "Enter" && handleLookup()}
                />
                <Button
                  onClick={handleLookup}
                  disabled={!domain || loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8"
                >
                  {loading ? "Lookup..." : "Search"}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Error Message */}
              {results.error && (
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-400 mb-1">Lookup Failed</h3>
                    <p className="text-sm text-slate-300">{results.error}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              {!results.error && results.isValid ? (
                <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-400 mb-1">Domain Active</h3>
                    <p className="text-sm text-slate-300">This domain is registered and active</p>
                  </div>
                </div>
              ) : !results.error ? (
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-400 mb-1">Domain Expired</h3>
                    <p className="text-sm text-slate-300">This domain may be available for registration</p>
                  </div>
                </div>
              ) : null}

              {/* Registration Info */}
              {!results.error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Registrar</div>
                    <div className="text-white font-semibold">{results.registrar || "Not available"}</div>
                  </div>
                  <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">IP Address</div>
                    <div className="text-white font-semibold font-mono text-sm">{results.ipAddress}</div>
                  </div>
                  <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Created</div>
                    <div className="text-white font-semibold">
                      {results.creationDate && results.creationDate !== "Unknown"
                        ? new Date(results.creationDate).toLocaleDateString()
                        : "Not available"}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Expires In</div>
                    <div
                      className={`font-semibold ${results.daysUntilExpiration <= 30 ? "text-red-400" : "text-white"}`}
                    >
                      {results.daysUntilExpiration > 0
                        ? `${results.daysUntilExpiration} days`
                        : "Expired"}
                    </div>
                  </div>
                </div>
              )}

              {/* SSL Certificate */}
              {!results.error && (
                <div className={`rounded-lg p-4 border ${results.ssl?.valid ? "bg-green-600/10 border-green-600/30" : "bg-orange-600/10 border-orange-600/30"}`}>
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className={`w-5 h-5 ${results.ssl?.valid ? "text-green-500" : "text-orange-500"}`} />
                    SSL Certificate
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Issuer</div>
                      <div className="text-white">{results.ssl?.issuer || "Not found"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Expires</div>
                      <div className="text-white">
                        {results.ssl?.expirationDate && results.ssl.expirationDate !== "Unknown"
                          ? new Date(results.ssl.expirationDate).toLocaleDateString()
                          : "Not available"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-slate-400 mb-1">Status</div>
                      <div className={results.ssl?.valid ? "text-green-400" : "text-orange-400"}>
                        {results.ssl?.valid ? "Certificate Valid" : "Certificate Not Found"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nameservers */}
              {!results.error && results.nameservers && results.nameservers.length > 0 && (
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">Nameservers</h3>
                  <div className="space-y-2">
                    {results.nameservers.map((ns: string, idx: number) => (
                      <div key={idx} className="text-sm text-slate-300 font-mono">
                        {ns}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hosting Info */}
              {!results.error && (
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">Hosting Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Country</div>
                      <div className="text-white">{results.country || "Unknown"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Host Provider</div>
                      <div className="text-white">{results.hosting || "Unknown"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reputation Info */}
              {!results.error && results.reputation && (
                <div className={`rounded-lg p-4 border ${results.reputation.abuseScore > 50 ? "bg-red-600/10 border-red-600/30" : "bg-green-600/10 border-green-600/30"}`}>
                  <h3 className="font-bold text-white mb-3">Domain Reputation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Abuse Score</div>
                      <div className={`font-semibold ${results.reputation.abuseScore > 50 ? "text-red-400" : "text-green-400"}`}>
                        {results.reputation.abuseScore}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Total Reports</div>
                      <div className="text-white font-semibold">{results.reputation.totalReports}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Export */}
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <Download className="w-4 h-4" />
                Export WHOIS Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
