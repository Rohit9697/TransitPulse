import React from 'react'
import { LayoutDashboard, Route, Clock, Database } from 'lucide-react'
import type { NavTabId } from '../../types/transit'

interface MobileNavProps {
  activeTab: NavTabId
  onSelectTab: (tab: NavTabId) => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: NavTabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'routes', label: 'Routes', icon: <Route className="w-5 h-5" /> },
    { id: 'peak-hours', label: 'Peak Hours', icon: <Clock className="w-5 h-5" /> },
    { id: 'explorer', label: 'Explorer', icon: <Database className="w-5 h-5" /> }
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0B132B]/95 backdrop-blur-md border-t border-[#1C2541] z-30 px-3 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              isActive
                ? 'text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
