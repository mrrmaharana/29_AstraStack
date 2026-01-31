"use client"

import { useState } from "react"
import { Bell, RefreshCw, Settings, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import OSINTToolGrid from "@/components/OSINTToolGrid"

export default function OSINTToolkit() {
  const [currentView, setCurrentView] = useState<'home' | 'tool'>('home')
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const handleGoHome = () => {
    setCurrentView('home')
    setExpandedTool(null)
  }

  const handleToolClick = (toolId: string) => {
    setExpandedTool(toolId)
    setCurrentView('tool')
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-slate-950 border-b border-orange-500/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoHome}
              className="text-sm text-slate-400 hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              OSINT TOOLKIT / <span className="text-orange-600">{currentView === 'home' ? 'DASHBOARD' : expandedTool?.toUpperCase() || 'TOOL'}</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">For Educational Purposes Only</div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-orange-600">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-orange-600">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Grid Content */}
        <div className="flex-1 overflow-auto">
          <OSINTToolGrid 
            expandedTool={expandedTool}
            onToolClick={handleToolClick}
            onBack={handleGoHome}
          />
        </div>
      </div>
    </div>
  )
}
