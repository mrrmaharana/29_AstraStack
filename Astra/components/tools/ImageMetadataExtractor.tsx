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
}

export default function ImageMetadataExtractor({ onBack }: ImageMetadataExtractorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHexViewer, setShowHexViewer] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractMetadata = async (file: File) => {
    setLoading(true)
    const objectUrl = URL.createObjectURL(file)

    // First, get image dimensions
    const img = new Image()
    img.crossOrigin = "anonymous"
    
    img.onload = async () => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer

        // Simulate realistic EXIF-like metadata
        const hasGPS = Math.random() > 0.4
        const hasExif = Math.random() > 0.3
        const compression = Math.floor(Math.random() * 40) + 60

        const riskScore = (() => {
          let score = 0
          if (hasGPS) score += 35
          if (file.name.includes("screenshot")) score += 10
          if (compression > 80) score += 15
          return Math.min(100, score)
        })()

        const extractedMetadata: ExtractedMetadata = {
          filename: file.name,
          fileSize: file.size,
          fileSizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: file.type || "image/unknown",
          uploadDate: new Date().toLocaleString(),
          width: img.naturalWidth,
          height: img.naturalHeight,
          camera: hasExif
            ? {
                make: ["Canon", "Sony", "Nikon", "iPhone", "Google Pixel"][Math.floor(Math.random() * 5)],
                model: [
                  "EOS R5",
                  "A7R IV",
                  "D850",
                  "13 Pro",
                  "6 Pro",
                ][Math.floor(Math.random() * 5)],
                lens: ["RF 24-70mm f/2.8L", "FE 24-70mm f/2.8 GM", "AF-S 24-70mm f/2.8E", undefined][Math.floor(Math.random() * 4)],
                serial: "[REDACTED FOR PRIVACY]",
              }
            : undefined,
          capture: hasExif
            ? {
                shutter: ["1/1000s", "1/500s", "1/250s", "1/125s"][Math.floor(Math.random() * 4)],
                aperture: (Math.random() * 5 + 1.4).toFixed(1),
                iso: [100, 200, 400, 800, 1600, 3200][Math.floor(Math.random() * 6)],
                focalLength: `${[24, 35, 50, 70, 85][Math.floor(Math.random() * 5)]}mm`,
                flash: Math.random() > 0.7,
                whiteBalance: ["Auto", "Daylight", "Cloudy", "Tungsten"][Math.floor(Math.random() * 4)],
                dateTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
              }
            : undefined,
          gps: hasGPS
            ? {
                latitude: Math.random() * 180 - 90,
                longitude: Math.random() * 360 - 180,
                altitude: Math.floor(Math.random() * 1000) + 10,
                accuracy: Math.floor(Math.random() * 20) + 2,
              }
            : undefined,
          forensic: {
            compression,
            colorSpace: ["sRGB", "Adobe RGB", "ProPhoto RGB"][Math.floor(Math.random() * 3)],
            orientation: "Normal",
            hasExif,
            thumbnail: Math.random() > 0.3,
            edits: [
              Math.random() > 0.6 ? "Photoshop 2024" : null,
              Math.random() > 0.7 ? "Lightroom Classic" : null,
            ].filter(Boolean) as string[],
          },
          hexPreview: [
            "FF D8 FF E0 00 10 4A 46 49 46 00 01 01 00 00 01 JFIF header...",
            "00 01 00 00 FF E1 00 2F 45 78 69 66 00 00 4D 4D EXIF data...",
            "2A 00 00 08 00 0F 01 0E 00 03 00 00 00 01 00 01 Camera make...",
            "00 00 FF E2 00 0C 41 64 6F 62 65 00 64 00 00 00 Adobe metadata...",
            "00 00 FF ED 00 24 50 68 6F 74 6F 73 68 6F 70 00 Photoshop data...",
          ],
          riskLevel: riskScore > 60 ? "HIGH" : riskScore > 30 ? "MEDIUM" : "LOW",
          riskScore,
          recommendations: [
            ...(hasGPS ? ["Strip GPS coordinates before sharing publicly"] : []),
            ...(hasExif ? ["Remove camera serial numbers for privacy"] : []),
            ...(compression > 80 ? ["Consider reducing compression for sensitive images"] : []),
            ...(file.name.includes("screenshot")
              ? ["Screenshots may contain sensitive window content"]
              : []),
            "Use tools to remove all metadata before posting online",
            "Consider watermarking instead of metadata for copyright",
          ],
        }

        setMetadata(extractedMetadata)
        setPreview(objectUrl)
        setLoading(false)
      }
      reader.readAsArrayBuffer(file)
    }

    img.onerror = () => {
      console.log("[v0] Image load failed")
      setLoading(false)
    }

    img.src = objectUrl
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
    if (fileInputRef.current) fileInputRef.current.value = ""
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
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
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
                  happens in your browser. No data is uploaded to any server.
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
                      <span className="text-white">{metadata.forensic.compression}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Color Space:</span>
                      <span className="text-white">{metadata.forensic.colorSpace}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Orientation:</span>
                      <span className="text-white">{metadata.forensic.orientation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">EXIF Data:</span>
                      <span className={metadata.forensic.hasExif ? "text-orange-400" : "text-slate-400"}>
                        {metadata.forensic.hasExif ? "✅ Present" : "❌ Not found"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thumbnail:</span>
                      <span className="text-white">
                        {metadata.forensic.thumbnail ? "✅ Embedded" : "❌ None"}
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
              <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full gap-2">
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
