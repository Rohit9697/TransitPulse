import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { MobileNav } from './MobileNav'
import type { NavTabId, TimeRange } from '../../types/transit'

interface AppShellProps {
  children: React.ReactNode
  activeTab: NavTabId
  onSelectTab: (tab: NavTabId) => void
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  selectedRoute: string
  onSelectRoute: (routeId: string) => void
  isDark: boolean
  onToggleTheme: () => void
  onOpenCsvImport: () => void
  lastRefreshedText?: string
  onRefresh?: () => void
  onResetFilters?: () => void
  hasActiveFilters?: boolean
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onSelectTab,
  timeRange,
  onTimeRangeChange,
  selectedRoute,
  onSelectRoute,
  isDark,
  onToggleTheme,
  onOpenCsvImport,
  lastRefreshedText,
  onRefresh,
  onResetFilters,
  hasActiveFilters = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        {/* Top Navigation */}
        <TopNav
          activeTab={activeTab}
          timeRange={timeRange}
          onTimeRangeChange={onTimeRangeChange}
          selectedRoute={selectedRoute}
          onSelectRoute={onSelectRoute}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onOpenCsvImport={onOpenCsvImport}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          lastRefreshedText={lastRefreshedText}
          onRefresh={onRefresh}
          onResetFilters={onResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Content View */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav activeTab={activeTab} onSelectTab={onSelectTab} />
      </div>
    </div>
  )
}
