"use client"

import React, { useState, useRef } from "react"
import {
  ArrowLeft,
  ImageIcon,
  Upload,
  AlertTriangle,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  Loader,
  CheckCircle,
  AlertCircle,
  MapPin,
  Camera,
  Scan,
  BarChart3,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalysisResult {
  status: string
  file_info: any
  exif_data: any
  gps_data: any
  camera_info: any
  objects_detected: any[]
  landmarks_detected: any
  reverse_search: any
  image_hash: string
  privacy_risk: any
}

interface ImageAnalyzerProps {
  onBack: () => void
}

export default function AdvancedImageAnalyzer({ onBack }: ImageAnalyzerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [removingExif, setRemovingExif] = useState(false)
  const [exifRemoved, setExifRemoved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'metadata' | 'objects' | 'landmarks' | 'reverse' | 'risk'>('metadata')
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  const analyzeImage = async (file: File) => {
    setLoading(true)
    setOriginalFile(file)
    setExifRemoved(false)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Sending image to backend:', file.name)
      const response = await fetch('http://localhost:5000/api/analyze-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error(`Backend error: ${response.status}`)
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
      setPreview(URL.createObjectURL(file))
      console.log('Image analysis complete')
    } catch (error) {
      console.error('Error analyzing image:', error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      alert(`❌ Error analyzing image:\n\n${errorMsg}\n\nMake sure the Python backend is running on port 5000.\n\nRun this command in a terminal:\npython api_backend_lite.py`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      analyzeImage(file)
    } else {
      alert('Please select a valid image file')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-red-400 bg-red-600/10 border-red-600/50'
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-600/10 border-yellow-600/50'
      case 'LOW':
        return 'text-green-400 bg-green-600/10 border-green-600/50'
      default:
        return 'text-slate-400'
    }
  }

  const clearAnalysis = () => {
    setResult(null)
    setPreview(null)
    setShowDetails(false)
    setActiveTab('metadata')
    setExifRemoved(false)
    setOriginalFile(null)
  }

  const removeExifData = async () => {
    if (!originalFile) return

    setRemovingExif(true)
    const formData = new FormData()
    formData.append('file', originalFile)

    try {
      const response = await fetch('http://localhost:5000/api/remove-exif', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error(`Failed to remove EXIF data: ${response.status}`)
      }

      const blob = await response.blob()
      const filename = originalFile.name.replace(/\.[^/.]+$/, '_no_exif.jpg')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExifRemoved(true)
      alert('✓ EXIF data removed and image downloaded successfully!')
    } catch (error) {
      console.error('Error removing EXIF:', error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      alert(`❌ Error removing EXIF data:\n\n${errorMsg}\n\nMake sure the Python backend is running on port 5000.`)
    } finally {
      setRemovingExif(false)
    }
  }

  if (result && preview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-orange-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-orange-600" />
                  Advanced Image Analysis
                </h1>
                <p className="text-sm text-slate-400 mt-1">Metadata, objects, landmarks, and privacy analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={removeExifData}
                disabled={removingExif}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-600/50 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removingExif ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Removing...
                  </>
                ) : exifRemoved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    EXIF Removed
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Remove & Download
                  </>
                )}
              </button>
              <button
                onClick={clearAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Image Preview */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 sticky top-6">
                <h2 className="text-lg font-bold text-white mb-4">Preview</h2>
                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full rounded-lg bg-black mb-4 max-h-96 object-cover"
                  />
                )}
                <div className="space-y-2">
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Filename</p>
                    <p className="text-white truncate font-mono text-xs">{result.file_info.filename}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Size</p>
                    <p className="text-white">{result.file_info.size_formatted}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Dimensions</p>
                    <p className="text-white">{result.file_info.width} × {result.file_info.height}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Privacy Risk Card */}
              <div className={`border rounded-lg p-6 ${getRiskColor(result.privacy_risk.level)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Privacy Risk Assessment
                  </h3>
                  <span className="text-2xl font-bold">{result.privacy_risk.score}%</span>
                </div>
                <div className="mb-4 bg-black/30 rounded p-3">
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        result.privacy_risk.level === 'HIGH'
                          ? 'bg-red-500'
                          : result.privacy_risk.level === 'MEDIUM'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${result.privacy_risk.score}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {result.privacy_risk.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <span className="mt-1">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
                {[
                  { id: 'metadata', label: 'EXIF & Metadata', icon: Camera },
                  { id: 'objects', label: 'Objects Detected', icon: Scan },
                  { id: 'landmarks', label: 'Landmarks', icon: MapPin },
                  { id: 'reverse', label: 'Reverse Search', icon: BarChart3 },
                  { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'border-b-2 border-orange-600 text-orange-400'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                {activeTab === 'metadata' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-orange-600" />
                      EXIF & Camera Information
                    </h3>
                    {result.camera_info ? (
                      <div className="grid grid-cols-2 gap-4">
                        {result.camera_info.make && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase">Camera Make</p>
                            <p className="text-white">{result.camera_info.make}</p>
                          </div>
                        )}
                        {result.camera_info.model && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase">Camera Model</p>
                            <p className="text-white">{result.camera_info.model}</p>
                          </div>
                        )}
                        {result.camera_info.capture_settings && Object.entries(result.camera_info.capture_settings).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-slate-500 uppercase">{key.replace(/_/g, ' ')}</p>
                            <p className="text-white font-mono text-sm">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">No camera EXIF data found</p>
                    )}

                    {result.gps_data && (
                      <div className="mt-6 p-4 border border-red-600/50 bg-red-600/10 rounded">
                        <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          ⚠️ GPS Location Data Detected
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-red-300">Latitude</p>
                            <p className="text-white font-mono">{result.gps_data.latitude}</p>
                          </div>
                          <div>
                            <p className="text-xs text-red-300">Longitude</p>
                            <p className="text-white font-mono">{result.gps_data.longitude}</p>
                          </div>
                          {result.gps_data.altitude && (
                            <div>
                              <p className="text-xs text-red-300">Altitude</p>
                              <p className="text-white font-mono">{result.gps_data.altitude}m</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {result.exif_data && Object.keys(result.exif_data).length > 0 && (
                      <div className="mt-6">
                        <button
                          onClick={() => setShowDetails(!showDetails)}
                          className="text-orange-400 hover:text-orange-300 text-sm font-semibold flex items-center gap-2"
                        >
                          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showDetails ? 'Hide' : 'Show'} All EXIF Data
                        </button>
                        {showDetails && (
                          <div className="mt-3 bg-black/30 rounded p-3 max-h-96 overflow-y-auto">
                            <pre className="text-xs text-slate-400 font-mono">
                              {JSON.stringify(result.exif_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'objects' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4">Object Detection Results (YOLO)</h3>
                    {result.objects_detected && result.objects_detected.length > 0 ? (
                      <div className="space-y-2">
                        {result.objects_detected.map((obj: any, idx: number) => (
                          <div key={idx} className="bg-slate-800/50 rounded p-3 border border-slate-700">
                            <div className="flex justify-between items-center">
                              <span className="text-orange-400 font-semibold">{obj.class}</span>
                              <span className="text-sm text-slate-400">
                                Confidence: {(obj.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">No objects detected</p>
                    )}
                  </div>
                )}

                {activeTab === 'landmarks' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4">Landmark Detection (MediaPipe)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
                        <p className="text-sm text-slate-400">Faces Detected</p>
                        <p className="text-2xl font-bold text-orange-400">{result.landmarks_detected.face_count}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
                        <p className="text-sm text-slate-400">Hands Detected</p>
                        <p className="text-2xl font-bold text-orange-400">{result.landmarks_detected.hand_count}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-4 border border-slate-700 col-span-2">
                        <p className="text-sm text-slate-400">Pose Detected</p>
                        <p className={`text-lg font-bold ${result.landmarks_detected.pose_detected ? 'text-green-400' : 'text-slate-400'}`}>
                          {result.landmarks_detected.pose_detected ? '✓ Yes' : '✗ No'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reverse' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4">Reverse Image Search</h3>
                    <div className="bg-blue-600/10 border border-blue-600/50 rounded p-4">
                      <p className="text-blue-300">
                        {result.reverse_search.google_lens?.message || 'Configure API keys for reverse image search functionality'}
                      </p>
                    </div>
                    {result.image_hash && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-2">Perceptual Hash</p>
                        <p className="text-white font-mono text-xs break-all">{result.image_hash}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'risk' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4">Detailed Risk Analysis</h3>
                    <div className="space-y-3">
                      {result.privacy_risk.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start p-3 bg-slate-800/50 rounded border border-slate-700">
                          <div className="text-orange-600 mt-1">→</div>
                          <p className="text-slate-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-orange-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Scan className="w-8 h-8 text-orange-600" />
              Advanced Image Analyzer
            </h1>
            <p className="text-sm text-slate-400 mt-1">AI-powered metadata, object & landmark detection</p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-orange-500 bg-orange-600/10'
              : 'border-slate-700 bg-slate-900/30 hover:border-orange-600/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {loading ? (
            <div className="space-y-4">
              <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
              <p className="text-slate-400">Analyzing image with AI models...</p>
              <p className="text-xs text-slate-500">Extracting EXIF, detecting objects & landmarks</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-orange-600 to-orange-900 rounded-lg">
                  <Scan className="w-8 h-8 text-white" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Upload Image for Analysis</h2>
              <p className="text-slate-400 mb-4">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Supports: JPG, PNG, GIF, BMP, WebP
              </p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 mb-6"
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </Button>

              <div className="bg-purple-600/10 border border-purple-600/50 rounded p-4 text-left">
                <p className="text-sm text-purple-400 font-semibold mb-3">AI Analysis Features:</p>
                <ul className="text-xs text-purple-300 space-y-1">
                  <li>✓ Complete EXIF data extraction & analysis</li>
                  <li>✓ GPS location detection (if present)</li>
                  <li>✓ Camera & device identification</li>
                  <li>✓ YOLO object detection</li>
                  <li>✓ MediaPipe face, hand & pose detection</li>
                  <li>✓ Reverse image search preparation</li>
                  <li>✓ Perceptual image hashing</li>
                  <li>✓ Privacy risk scoring</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-orange-600/10 border border-orange-600/30 rounded text-sm text-orange-400">
          ℹ️ This tool requires the Python backend running on localhost:5000. Start it with: <code className="bg-black/50 px-2 py-1 rounded">python api_backend.py</code>
        </div>
      </div>
    </div>
  )
}
