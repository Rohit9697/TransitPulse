import React from 'react'
import {
  Menu,
  Calendar,
  Route,
  UploadCloud,
  RefreshCw,
  X
} from 'lucide-react'
import { ThemeToggle } from '../common/ThemeToggle'
import { Button } from '../common/Button'
import type { TimeRange, NavTabId } from '../../types/transit'
import { ROUTE_OPTIONS } from '../../data/mockData'

interface TopNavProps {
  activeTab: NavTabId
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  selectedRoute: string
  onSelectRoute: (routeId: string) => void
  isDark: boolean
  onToggleTheme: () => void
  onOpenCsvImport: () => void
  onToggleMobileMenu: () => void
  lastRefreshedText?: string
  onRefresh?: () => void
  onResetFilters?: () => void
  hasActiveFilters?: boolean
}

const tabTitles: Record<NavTabId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Public Transport Demand Analytics',
    subtitle: 'Cross-modal network passenger volume, route capacity pressure & peak ridership'
  },
  routes: {
    title: 'Route Capacity & Corridor Analysis',
    subtitle: 'Corridor dwell times, line-level load factors, and schedule adherence'
  },
  'peak-hours': {
    title: 'Peak Hours & Surge Demand Analysis',
    subtitle: 'Temporal passenger curves, morning & evening surge multipliers'
  },
  explorer: {
    title: 'Transport Telemetry Data Explorer',
    subtitle: 'Filter, search, inspect and export granular passenger dispatch logs'
  }
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  timeRange,
  onTimeRangeChange,
  selectedRoute,
  onSelectRoute,
  isDark,
  onToggleTheme,
  onOpenCsvImport,
  onToggleMobileMenu,
  lastRefreshedText = 'Just now',
  onRefresh,
  onResetFilters,
  hasActiveFilters = false
}) => {
  const currentInfo = tabTitles[activeTab] || tabTitles.overview

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#080E21]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate font-sans">
              {currentInfo.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* 1. Route Filter Control */}
          <div className="relative inline-flex items-center">
            <Route className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedRoute}
              onChange={(e) => onSelectRoute(e.target.value)}
              aria-label="Filter by corridor or route"
              className="pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 cursor-pointer appearance-none transition-colors"
            >
              {ROUTE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Date-Range Control */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-1.5 mr-1 hidden sm:inline" />
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: 'Quarter' }
              ] as const
            ).map((range) => {
              const isSelected = timeRange === range.id
              return (
                <button
                  key={range.id}
                  onClick={() => onTimeRangeChange(range.id)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              )
            })}
          </div>

          {/* 3. Reset Filters (shown when filters are active) */}
          {hasActiveFilters && onResetFilters && (
            <button
              onClick={onResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              aria-label="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* 4. CSV Import Action */}
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCsvImport}
            icon={<UploadCloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
            className="text-xs dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          {/* 5. Theme Toggle */}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          {/* 6. Live Telemetry Refresh */}
          <button
            onClick={onRefresh}
            title={`Telemetry last synced ${lastRefreshedText}. Click to re-poll.`}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
            aria-label="Refresh telemetry data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
