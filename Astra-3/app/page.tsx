"use client"

import { useState } from "react"
import { ChevronRight, Shield, Settings, User, Bell, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import OSINTToolGrid from "@/components/OSINTToolGrid"

export default function OSINTToolkit() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-72"} bg-black border-r border-orange-500/20 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full flex flex-col`}
      >
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <h1 className="text-white font-bold text-lg tracking-wider">OSINT KIT</h1>
              </div>
              <p className="text-slate-500 text-xs">Intelligence Toolkit</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-orange-600"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          {!sidebarCollapsed && (
            <nav className="space-y-2">
              <div className="text-xs text-slate-500 font-semibold tracking-wider mb-4">NAVIGATION</div>
              <button className="w-full text-left px-3 py-2 rounded text-slate-400 hover:text-white hover:bg-orange-600/10 transition-colors text-sm">
                Dashboard
              </button>
              <button className="w-full text-left px-3 py-2 rounded text-slate-400 hover:text-white hover:bg-orange-600/10 transition-colors text-sm">
                History
              </button>
              <button className="w-full text-left px-3 py-2 rounded text-slate-400 hover:text-white hover:bg-orange-600/10 transition-colors text-sm">
                Exports
              </button>
            </nav>
          )}

          {!sidebarCollapsed && (
            <div className="mt-12 p-4 bg-slate-900/50 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-300">SYSTEM ONLINE</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Status: <span className="text-green-500">Active</span></div>
                <div>Scans: <span className="text-orange-600">147</span></div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className={`p-4 border-t border-orange-500/20 ${!sidebarCollapsed ? "block" : "hidden"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 text-xs">
              <div className="text-white">Security Team</div>
              <div className="text-slate-500">analyst@sec.io</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-slate-950 border-b border-orange-500/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              OSINT TOOLKIT / <span className="text-orange-600">DASHBOARD</span>
            </div>
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
          <OSINTToolGrid />
        </div>
      </div>
    </div>
  )
}
