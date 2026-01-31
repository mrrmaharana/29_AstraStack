"use client"

import { useState } from "react"
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PasswordAnalyzerProps {
  onBack: () => void
}

export default function PasswordAnalyzer({ onBack }: PasswordAnalyzerProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const calculateStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return Math.min(strength, 5)
  }

  const getStrengthLabel = (strength: number) => {
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"]
    return labels[strength]
  }

  const getStrengthColor = (strength: number) => {
    const colors = ["bg-red-600", "bg-orange-600", "bg-yellow-600", "bg-blue-600", "bg-green-600", "bg-emerald-600"]
    return colors[strength]
  }

  const strength = calculateStrength(password)
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[^a-zA-Z\d]/.test(password),
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
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-900">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Password Strength Analyzer</h1>
              <p className="text-sm text-slate-400">Real-time password analysis and recommendations</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Enter Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Type your password to analyze"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-orange-500/30 text-white placeholder-slate-500 pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">We don't store or transmit your password</p>
            </div>
          </div>

          {password && (
            <div className="space-y-6">
              {/* Strength Meter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-300">Password Strength</label>
                  <span className={`text-sm font-bold ${
                    strength <= 1
                      ? "text-red-600"
                      : strength === 2
                        ? "text-yellow-600"
                        : strength === 3
                          ? "text-blue-600"
                          : "text-green-600"
                  }`}>
                    {getStrengthLabel(strength)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor(strength)} transition-all`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Criteria */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-3 block">Criteria Checklist</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "length", label: "8+ characters", met: criteria.length },
                    { key: "uppercase", label: "Uppercase letters", met: criteria.uppercase },
                    { key: "lowercase", label: "Lowercase letters", met: criteria.lowercase },
                    { key: "numbers", label: "Numbers", met: criteria.numbers },
                    { key: "special", label: "Special characters", met: criteria.special },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-2 p-3 rounded bg-slate-900/50 border border-orange-500/20"
                    >
                      {item.met ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={item.met ? "text-slate-300" : "text-slate-500"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crack Time */}
              <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-slate-300 mb-2">Estimated Crack Time</h3>
                <div className="text-2xl font-bold text-orange-600">
                  {strength <= 1 ? "< 1 second" : strength <= 2 ? "Minutes" : strength === 3 ? "Days" : strength === 4 ? "Years" : "Centuries"}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Recommendations</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {strength < 3 && <li>• Use at least 8 characters</li>}
                  {!criteria.uppercase || !criteria.lowercase ? <li>• Mix uppercase and lowercase letters</li> : null}
                  {!criteria.numbers && <li>• Include numbers for better security</li>}
                  {!criteria.special && <li>• Add special characters (!@#$%^&*)</li>}
                  {strength >= 4 && <li>✓ This is a strong password</li>}
                </ul>
              </div>

              {/* Generate Button */}
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Generate Strong Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
