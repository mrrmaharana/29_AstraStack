"use client"

import React, { useState, useRef } from "react"
import {
  ArrowLeft,
  Upload,
  AlertTriangle,
  Loader,
  Trash2,
  Play,
  BarChart3,
  Scan,
  CheckCircle,
  Film,
  Clock,
  Zap,
  MapPin,
  FileText,
  Car,
  Building,
  Trees,
  Route,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoAnalysisResult {
  status: string
  file_info: any
  extracted_frames: any[]
  frame_analysis: any[]
  privacy_risk: any
}

interface AdvancedVideoAnalyzerProps {
  onBack: () => void
}

export default function AdvancedVideoAnalyzer({ onBack }: AdvancedVideoAnalyzerProps) {
  const [result, setResult] = useState<VideoAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<'frames' | 'analysis' | 'location' | 'risk'>('frames')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeVideo = async (file: File) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Sending video to backend:', file.name)
      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error(`Backend error: ${response.status}`)
      }

      const data: VideoAnalysisResult = await response.json()
      setResult(data)
      console.log('Video analysis complete')
    } catch (error) {
      console.error('Error analyzing video:', error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      alert(`❌ Error analyzing video:\n\n${errorMsg}\n\nMake sure the Python backend is running on port 5000.\n\nRun this command in a terminal:\npython api_backend.py`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      analyzeVideo(file)
    } else {
      alert('Please select a valid video file')
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
    setActiveTab('frames')
  }

  if (result) {
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
                  <Film className="w-8 h-8 text-orange-600" />
                  Advanced Video Analysis
                </h1>
                <p className="text-sm text-slate-400 mt-1">Frame extraction, object detection, and privacy analysis</p>
              </div>
            </div>
            <button
              onClick={clearAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Video Info */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 sticky top-6">
                <h2 className="text-lg font-bold text-white mb-4">Video Info</h2>
                <div className="space-y-3">
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Filename</p>
                    <p className="text-white truncate font-mono text-xs">{result.file_info.filename}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Size</p>
                    <p className="text-white">{result.file_info.size_formatted}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Duration</p>
                    <p className="text-white">{result.file_info.duration.toFixed(2)}s</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">FPS</p>
                    <p className="text-white">{result.file_info.fps.toFixed(2)}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Resolution</p>
                    <p className="text-white">{result.file_info.resolution}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-500 uppercase">Total Frames</p>
                    <p className="text-white">{result.file_info.total_frames}</p>
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
                  { id: 'frames', label: 'Extracted Frames', icon: Film },
                  { id: 'analysis', label: 'Per-Frame Analysis', icon: Scan },
                  { id: 'location', label: 'Location Clues', icon: MapPin },
                  { id: 'risk', label: 'Risk Details', icon: AlertTriangle },
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
                {activeTab === 'frames' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Film className="w-5 h-5 text-orange-600" />
                      Extracted Video Frames ({result.extracted_frames.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {result.extracted_frames.map((frame: any, idx: number) => (
                        <div key={idx} className="relative group">
                          <img
                            src={frame.image}
                            alt={`Frame ${frame.frame_number}`}
                            className="w-full rounded-lg border border-slate-700 hover:border-orange-600 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center text-center">
                            <Clock className="w-4 h-4 text-orange-400 mb-2" />
                            <p className="text-xs text-white font-mono">{frame.timestamp.toFixed(2)}s</p>
                            <p className="text-xs text-slate-400">Frame #{frame.frame_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4">Per-Frame Object & Landmark Detection</h3>
                    {result.frame_analysis && result.frame_analysis.length > 0 ? (
                      <div className="space-y-4">
                        {result.frame_analysis.map((analysis: any, idx: number) => (
                          <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-orange-400">Frame {analysis.frame_number} @ {analysis.timestamp.toFixed(2)}s</h4>
                              <span className="text-xs text-slate-400">
                                {analysis.objects?.length || 0} objects • {analysis.landmarks?.face_count || 0} faces
                              </span>
                            </div>

                            {/* Objects */}
                            {analysis.objects && analysis.objects.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-slate-400 mb-2">Detected Objects:</p>
                                <div className="flex flex-wrap gap-2">
                                  {analysis.objects.map((obj: any, odx: number) => (
                                    <span
                                      key={odx}
                                      className="text-xs bg-orange-600/20 border border-orange-600/50 text-orange-400 px-2 py-1 rounded"
                                    >
                                      {obj.class} ({(obj.confidence * 100).toFixed(0)}%)
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Landmarks */}
                            <div className="text-xs text-slate-400">
                              <p>Landmarks: {analysis.landmarks?.face_count || 0} faces • {analysis.landmarks?.hand_count || 0} hands • Pose: {analysis.landmarks?.pose_detected ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">No frame analysis available</p>
                    )}
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      Location Clues & Text Analysis
                    </h3>
                    {result.frame_analysis && result.frame_analysis.length > 0 ? (
                      <div className="space-y-4">
                        {result.frame_analysis.map((analysis: any, idx: number) => (
                          <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-orange-400">Frame {analysis.frame_number} @ {analysis.timestamp.toFixed(2)}s</h4>
                              <span className="text-xs text-slate-400">
                                {analysis.text_detections?.general_text?.length || 0} texts • {Object.values(analysis.location_clues || {}).reduce((sum: number, clues: any) => sum + clues.length, 0)} clues
                              </span>
                            </div>

                            {/* Text Detections */}
                            {analysis.text_detections && (
                              <div className="mb-4 space-y-3">
                                {/* License Plates */}
                                {analysis.text_detections.license_plates && analysis.text_detections.license_plates.length > 0 && (
                                  <div>
                                    <p className="text-xs text-red-400 mb-2 flex items-center gap-2">
                                      <Car className="w-3 h-3" />
                                      License Plates ({analysis.text_detections.license_plates.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {analysis.text_detections.license_plates.map((plate: any, pdx: number) => (
                                        <span
                                          key={pdx}
                                          className="text-xs bg-red-600/20 border border-red-600/50 text-red-400 px-2 py-1 rounded font-mono"
                                        >
                                          {plate.text} ({(plate.confidence * 100).toFixed(0)}%)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Street Signs */}
                                {analysis.text_detections.street_signs && analysis.text_detections.street_signs.length > 0 && (
                                  <div>
                                    <p className="text-xs text-blue-400 mb-2 flex items-center gap-2">
                                      <Route className="w-3 h-3" />
                                      Street Signs ({analysis.text_detections.street_signs.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {analysis.text_detections.street_signs.map((sign: any, sdx: number) => (
                                        <span
                                          key={sdx}
                                          className="text-xs bg-blue-600/20 border border-blue-600/50 text-blue-400 px-2 py-1 rounded"
                                        >
                                          {sign.text} ({(sign.confidence * 100).toFixed(0)}%)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Shop Names */}
                                {analysis.text_detections.shop_names && analysis.text_detections.shop_names.length > 0 && (
                                  <div>
                                    <p className="text-xs text-green-400 mb-2 flex items-center gap-2">
                                      <Building className="w-3 h-3" />
                                      Shop Names ({analysis.text_detections.shop_names.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {analysis.text_detections.shop_names.map((shop: any, sdx: number) => (
                                        <span
                                          key={sdx}
                                          className="text-xs bg-green-600/20 border border-green-600/50 text-green-400 px-2 py-1 rounded"
                                        >
                                          {shop.text} ({(shop.confidence * 100).toFixed(0)}%)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* General Text */}
                                {analysis.text_detections.general_text && analysis.text_detections.general_text.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                                      <FileText className="w-3 h-3" />
                                      General Text ({analysis.text_detections.general_text.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                      {analysis.text_detections.general_text.slice(0, 10).map((text: any, tdx: number) => (
                                        <span
                                          key={tdx}
                                          className="text-xs bg-slate-600/20 border border-slate-600/50 text-slate-300 px-2 py-1 rounded"
                                        >
                                          {text.text.length > 20 ? text.text.substring(0, 20) + '...' : text.text}
                                        </span>
                                      ))}
                                      {analysis.text_detections.general_text.length > 10 && (
                                        <span className="text-xs text-slate-500">+{analysis.text_detections.general_text.length - 10} more...</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Location Clues */}
                            {analysis.location_clues && (
                              <div className="space-y-3">
                                {Object.entries(analysis.location_clues).map(([category, clues]: [string, any]) => {
                                  if (!clues || clues.length === 0) return null
                                  
                                  const getIcon = (cat: string) => {
                                    switch(cat) {
                                      case 'landmarks': return <MapPin className="w-3 h-3" />
                                      case 'buildings': return <Building className="w-3 h-3" />
                                      case 'transportation': return <Car className="w-3 h-3" />
                                      case 'nature': return <Trees className="w-3 h-3" />
                                      case 'infrastructure': return <Route className="w-3 h-3" />
                                      default: return <MapPin className="w-3 h-3" />
                                    }
                                  }
                                  
                                  const getColor = (cat: string) => {
                                    switch(cat) {
                                      case 'landmarks': return 'text-purple-400 bg-purple-600/20 border-purple-600/50'
                                      case 'buildings': return 'text-cyan-400 bg-cyan-600/20 border-cyan-600/50'
                                      case 'transportation': return 'text-yellow-400 bg-yellow-600/20 border-yellow-600/50'
                                      case 'nature': return 'text-green-400 bg-green-600/20 border-green-600/50'
                                      case 'infrastructure': return 'text-orange-400 bg-orange-600/20 border-orange-600/50'
                                      default: return 'text-slate-400 bg-slate-600/20 border-slate-600/50'
                                    }
                                  }
                                  
                                  return (
                                    <div key={category}>
                                      <p className="text-xs mb-2 flex items-center gap-2 capitalize">
                                        {getIcon(category)}
                                        {category} ({clues.length}):
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {clues.map((clue: any, cdx: number) => (
                                          <span
                                            key={cdx}
                                            className={`text-xs px-2 py-1 rounded border ${getColor(category)}`}
                                          >
                                            {clue.object} ({(clue.confidence * 100).toFixed(0)}%)
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">No location analysis available</p>
                    )}
                  </div>
                )}

                {activeTab === 'risk' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white mb-4">Risk Assessment Details</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-300 mb-2"><strong>Faces Detected:</strong> {result.privacy_risk.face_count}</p>
                        <p className="text-sm text-slate-300 mb-2"><strong>License Plates:</strong> {result.privacy_risk.license_plates_count || 0}</p>
                        <p className="text-sm text-slate-300 mb-2"><strong>Text Elements:</strong> {result.privacy_risk.text_detections_count || 0}</p>
                        <p className="text-sm text-slate-300 mb-2"><strong>Location Clues:</strong> {result.privacy_risk.location_clues_count || 0}</p>
                        <p className="text-sm text-slate-300 mb-2"><strong>Risk Level:</strong> <span className={getRiskColor(result.privacy_risk.level)}>{result.privacy_risk.level}</span></p>
                        <p className="text-sm text-slate-300"><strong>Risk Score:</strong> {result.privacy_risk.score}%</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-orange-400 mb-2">Recommendations:</h4>
                        <div className="space-y-2">
                          {result.privacy_risk.recommendations.map((rec: string, idx: number) => (
                            <div key={idx} className="flex gap-2 text-sm p-2 bg-slate-800/50 rounded border border-slate-700">
                              <span className="text-orange-600">→</span>
                              <span className="text-slate-300">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
              <Film className="w-8 h-8 text-orange-600" />
              Advanced Video Analyzer
            </h1>
            <p className="text-sm text-slate-400 mt-1">Frame extraction & AI-powered analysis</p>
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
            accept="video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {loading ? (
            <div className="space-y-4">
              <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
              <p className="text-slate-400">Analyzing video with AI models...</p>
              <p className="text-xs text-slate-500">Extracting frames and detecting objects</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-orange-600 to-orange-900 rounded-lg">
                  <Film className="w-8 h-8 text-white" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Upload Video for Analysis</h2>
              <p className="text-slate-400 mb-4">Drag and drop or click to upload</p>
              <p className="text-xs text-slate-500 mb-6">Supports: MP4, WebM, AVI, MOV, MKV</p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 mb-6"
              >
                <Upload className="w-4 h-4" />
                Choose Video
              </Button>

              <div className="bg-indigo-600/10 border border-indigo-600/50 rounded p-4 text-left">
                <p className="text-sm text-indigo-400 font-semibold mb-3">AI Analysis Features:</p>
                <ul className="text-xs text-indigo-300 space-y-1">
                  <li>✓ Automatic frame extraction from video</li>
                  <li>✓ YOLO object detection per frame</li>
                  <li>✓ MediaPipe face, hand & pose detection</li>
                  <li>✓ OCR text detection (signboards, shop names, street signs)</li>
                  <li>✓ License plate recognition</li>
                  <li>✓ Location clue detection (landmarks, buildings, transportation)</li>
                  <li>✓ Per-frame landmark analysis</li>
                  <li>✓ Video metadata extraction</li>
                  <li>✓ Enhanced privacy risk assessment</li>
                  <li>✓ Content summary and recommendations</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
