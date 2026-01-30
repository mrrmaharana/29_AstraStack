"use client"

import React, { useState, useRef } from "react"
import {
  ArrowLeft,
  ImageIcon,
  Upload,
  AlertTriangle,
  Download,
  Trash2,
  MapPin,
  Camera,
  Clock,
  Zap,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageMetadataExtractorProps {
  onBack: () => void
}

interface ExtractedMetadata {
  filename: string
  fileSize: number
  fileSizeFormatted: string
  mimeType: string
  uploadDate: string
  width: number
  height: number
  camera?: {
    make: string
    model: string
    lens?: string
    serial?: string
  }
  capture?: {
    shutter: string
    aperture: string
    iso: number
    focalLength: string
    flash: boolean
    whiteBalance: string
    dateTime: string
  }
  gps?: {
    latitude: number
    longitude: number
    altitude?: number
    accuracy?: number
  }
  forensic?: {
    compression: number
    colorSpace: string
    orientation: string
    hasExif: boolean
    thumbnail: boolean
    edits: string[]
  }
  hexPreview: string[]
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  riskScore: number
  recommendations: string[]
  rawExiftoolData?: any
}

export default function ImageMetadataExtractor({ onBack }: ImageMetadataExtractorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHexViewer, setShowHexViewer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractMetadata = async (file: File) => {
    setLoading(true)
    setError(null)
    setOriginalFile(file)
    const objectUrl = URL.createObjectURL(file)

    try {
      console.log("Starting metadata extraction for file:", file.name, "size:", file.size)

      // Create FormData and send to API
      const formData = new FormData()
      formData.append("file", file)

      console.log("Sending request to /api/extract-metadata")

      const response = await fetch("/api/extract-metadata", {
        method: "POST",
        body: formData,
      })

      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract metadata")
      }

      const extractedMetadata = data as ExtractedMetadata

      setMetadata(extractedMetadata)
      setPreview(objectUrl)
      setLoading(false)
      console.log("Metadata extraction successful")
    } catch (error) {
      console.error("Metadata extraction error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during metadata extraction")
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      extractMetadata(file)
    }
  }

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      extractMetadata(file)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setMetadata(null)
    setOriginalFile(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCleanImage = async () => {
    if (!metadata || !originalFile) return

    try {
      setLoading(true)
      setError(null)

      // Create FormData and send to clean API
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/clean-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to clean image")
      }

      // Create download link for the cleaned image
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cleaned-${metadata.filename}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setLoading(false)
    } catch (error) {
      console.error("Image cleaning error:", error)
      setError(error instanceof Error ? error.message : "Failed to clean image")
      setLoading(false)
    }
  }

  const getRiskColor = () => {
    if (metadata?.riskLevel === "HIGH") return "text-red-500"
    if (metadata?.riskLevel === "MEDIUM") return "text-orange-500"
    return "text-green-500"
  }

  const getRiskBgColor = () => {
    if (metadata?.riskLevel === "HIGH") return "bg-red-600/10 border-red-600/30"
    if (metadata?.riskLevel === "MEDIUM") return "bg-orange-600/10 border-orange-600/30"
    return "bg-green-600/10 border-green-600/30"
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Main Container */}
        {!metadata ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/50 border border-orange-500/30 rounded-lg p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-900">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Image Metadata Inspector</h1>
                  <p className="text-sm text-slate-400">Professional OSINT metadata analysis tool</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Upload Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                className="border-2 border-dashed border-orange-500/50 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-lg bg-orange-600/20 flex items-center justify-center mb-4 group-hover:bg-orange-600/30 transition-colors">
                  <Upload className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Upload Image for Analysis</h2>
                <p className="text-slate-400 text-center mb-4">
                  Drag & drop your image here or click to browse
                </p>
                <p className="text-xs text-slate-500 mb-6">
                  Supports: JPG, PNG, WebP, TIFF • Max: 10MB
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Privacy Notice */}
              <div className="mt-8 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                <p className="text-xs text-slate-300">
                  <span className="text-blue-400 font-semibold">🔒 Local Processing:</span> All analysis
                  happens on the server. No data is stored permanently.
                </p>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ImageIcon className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-white font-semibold">Analyzing image...</p>
              <p className="text-slate-400 text-sm mt-2">Extracting metadata and analyzing forensics</p>
            </div>
          </div>
        ) : (
          /* Analysis Dashboard */
          <div className="space-y-6">
            {/* Top Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-orange-500/30 text-orange-600 hover:bg-orange-600/10 bg-transparent gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Analyze New Image
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white ml-auto gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Image Preview */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4 sticky top-6">
                  <h3 className="text-sm font-bold text-white mb-4">IMAGE PREVIEW</h3>
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-auto rounded border border-orange-500/20 mb-4"
                  />

                  {/* Basic Info */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">File:</span>
                      <span className="text-white truncate max-w-[150px]">{metadata.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Size:</span>
                      <span className="text-white">{metadata.fileSizeFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dimensions:</span>
                      <span className="text-white">
                        {metadata.width} × {metadata.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Format:</span>
                      <span className="text-white">{metadata.mimeType.split("/")[1].toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Uploaded:</span>
                      <span className="text-white text-[11px]">{metadata.uploadDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Metadata Cards */}
              <div className="lg:col-span-2 space-y-4">
                {/* Risk Assessment */}
                <div className={`border rounded-lg p-4 ${getRiskBgColor()}`}>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${getRiskColor()}`} />
                    SECURITY ASSESSMENT
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${
                            metadata.riskLevel === "HIGH"
                              ? "bg-red-500"
                              : metadata.riskLevel === "MEDIUM"
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${metadata.riskScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-400">
                        <span>Risk: {metadata.riskScore}/100</span>
                        <span className={getRiskColor()}>{metadata.riskLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camera Fingerprint */}
                {metadata.camera && (
                  <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-orange-600" />
                      CAMERA FINGERPRINT
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Make:</span>
                        <span className="text-white">{metadata.camera.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Model:</span>
                        <span className="text-white">{metadata.camera.model}</span>
                      </div>
                      {metadata.camera.lens && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Lens:</span>
                          <span className="text-white">{metadata.camera.lens}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-700 mt-2">
                        <span className="text-slate-500">Serial:</span>
                        <span className="text-orange-400">{metadata.camera.serial}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Capture Settings */}
                {metadata.capture && (
                  <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      CAPTURE SETTINGS
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Shutter:</span>
                        <div className="text-white font-mono">{metadata.capture.shutter}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Aperture:</span>
                        <div className="text-white font-mono">f/{metadata.capture.aperture}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">ISO:</span>
                        <div className="text-white font-mono">{metadata.capture.iso}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Focal:</span>
                        <div className="text-white font-mono">{metadata.capture.focalLength}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Flash:</span>
                        <div className="text-white">{metadata.capture.flash ? "✅ Fired" : "❌ Not fired"}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">WB:</span>
                        <div className="text-white text-xs">{metadata.capture.whiteBalance}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Timeline */}
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    DIGITAL TIMELINE
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Captured:</span>
                      <span className="text-white">{metadata.capture?.dateTime || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Uploaded:</span>
                      <span className="text-white">{metadata.uploadDate}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-700 mt-2">
                      <span className="text-slate-500">Edits:</span>
                      <span className="text-orange-400">
                        {metadata.forensic.edits.length > 0 ? metadata.forensic.edits.join(", ") : "None detected"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Geolocation */}
                {metadata.gps && (
                  <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      GPS COORDINATES DETECTED
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Latitude:</span>
                        <span className="text-white font-mono">{metadata.gps.latitude.toFixed(4)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Longitude:</span>
                        <span className="text-white font-mono">{metadata.gps.longitude.toFixed(4)}°</span>
                      </div>
                      {metadata.gps.altitude && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Altitude:</span>
                          <span className="text-white">{metadata.gps.altitude}m</span>
                        </div>
                      )}
                      <p className="text-red-400 mt-3 pt-2 border-t border-red-600/30">
                        ⚠️ Your location is exposed! Remove this data before sharing publicly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Forensic Indicators */}
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-3">FORENSIC INDICATORS</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Compression:</span>
                      <span className="text-white">{metadata.forensic?.compression || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Color Space:</span>
                      <span className="text-white">{metadata.forensic?.colorSpace || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Orientation:</span>
                      <span className="text-white">{metadata.forensic?.orientation || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">EXIF Data:</span>
                      <span className={metadata.forensic?.hasExif ? "text-orange-400" : "text-slate-400"}>
                        {metadata.forensic?.hasExif ? "✅ Present" : "❌ Not found"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thumbnail:</span>
                      <span className="text-white">
                        {metadata.forensic?.thumbnail ? "✅ Embedded" : "❌ None"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-6">
              <h3 className="text-sm font-bold text-white mb-4">SECURITY RECOMMENDATIONS</h3>
              <ul className="space-y-2">
                {metadata.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-orange-600 font-bold">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hex Viewer */}
            <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-6">
              <button
                onClick={() => setShowHexViewer(!showHexViewer)}
                className="flex items-center gap-2 text-sm font-bold text-white hover:text-orange-400 transition-colors w-full"
              >
                {showHexViewer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                HEX DUMP (First 256 bytes)
              </button>
              {showHexViewer && (
                <div className="mt-4 space-y-2 font-mono text-xs text-slate-300">
                  {metadata.hexPreview.map((line, idx) => (
                    <div key={idx} className="text-slate-400">
                      <span className="text-orange-600">{String(idx * 16).padStart(4, "0")}:</span>{" "}
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={handleCleanImage}
                className="bg-orange-600 hover:bg-orange-700 text-white w-full gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Cleaned</span>
              </Button>
              <Button variant="outline" className="border-orange-500/30 text-orange-600 hover:bg-orange-600/10 bg-transparent w-full gap-2">
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy JSON</span>
              </Button>
              <Button variant="outline" className="border-orange-500/30 text-orange-600 hover:bg-orange-600/10 bg-transparent w-full gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-orange-500/30 text-orange-600 hover:bg-orange-600/10 bg-transparent w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
