import React from 'react'
import {
  LayoutDashboard,
  Route,
  Clock,
  Database,
  Activity,
  ChevronRight,
  ShieldCheck,
  Layers
} from 'lucide-react'
import type { NavTabId } from '../../types/transit'
import { NAVIGATION_ITEMS } from '../../data/mockData'

interface SidebarProps {
  activeTab: NavTabId
  onSelectTab: (tab: NavTabId) => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Route: <Route className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  Database: <Database className="w-4 h-4" />
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B132B] text-slate-300 flex flex-col border-r border-[#1C2541] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1C2541]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner">
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight font-sans">
                  TransitPulse
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Analytics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Metropolitan Authority</p>
            </div>
          </div>
        </div>

        {/* Network Corridor Status Pill */}
        <div className="px-4 py-3 border-b border-[#1C2541]/80">
          <div className="bg-[#1C2541]/60 rounded-lg p-2.5 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-slate-200">Central Grid Active</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
              98.4%
            </span>
          </div>
        </div>

        {/* Main Navigation: Overview, Route Analysis, Peak Hours, Data Explorer */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Views
          </div>
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id)
                  if (onCloseMobile) onCloseMobile()
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1C2541]/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {iconMap[item.iconName] || <Layers className="w-4 h-4" />}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-sky-400 text-[#0B132B] font-bold'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Operator Diagnostics Footer */}
        <div className="p-4 border-t border-[#1C2541] bg-[#080E21]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">Dispatch Control</p>
              <p className="text-[11px] text-slate-400 truncate">Feed: Live Telemetry</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </aside>
    </>
  )
}
