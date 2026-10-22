import React, { useState, useMemo } from 'react'
import { StatusBadge } from '../common/StatusBadge'
import { Button } from '../common/Button'
import { aggregateRouteComparison } from '../../analytics/transitAnalytics'
import { Route, ArrowRight } from 'lucide-react'
import type { TransportMode, TransitTripRecord } from '../../types/transit'

interface RouteAnalysisViewProps {
  records: TransitTripRecord[]
  onBackToOverview: () => void
  onSelectRoute: (routeCode: string) => void
}

const modeBadgeStyles: Record<TransportMode, { label: string; class: string }> = {
  metro: { label: 'Metro Rapid', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  bus: { label: 'Bus Rapid Transit', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  tram: { label: 'Light Rail / Tram', class: 'bg-teal-50 text-teal-700 border-teal-200' },
  rail: { label: 'Regional Commuter', class: 'bg-purple-50 text-purple-700 border-purple-200' }
}

export const RouteAnalysisView: React.FC<RouteAnalysisViewProps> = ({
  records,
  onBackToOverview,
  onSelectRoute
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const routeComparisons = useMemo(() => {
    return aggregateRouteComparison(records)
  }, [records])

  const filteredRoutes = routeComparisons.filter(
    (r) => activeFilter === 'all' || r.mode === activeFilter
  )

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0d172e] rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Corridor Performance & Headway Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed line-level load profiling, capacity saturation, and modal distribution
            </p>
          </div>
        </div>

        {/* Mode filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {(['all', 'metro', 'bus', 'tram', 'rail'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveFilter(mode)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors cursor-pointer ${
                activeFilter === mode
                  ? 'bg-slate-900 dark:bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Corridor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoutes.map((route) => {
          const style = modeBadgeStyles[route.mode] || modeBadgeStyles.metro
          return (
            <div
              key={route.routeCode}
              className="bg-white dark:bg-[#0d172e] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${style.class}`}>
                    {style.label}
                  </span>
                  <StatusBadge status={route.sharePct > 20 ? 'congested' : 'optimal'} />
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{route.routeCode}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{route.routeName}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Total Ridership</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {route.passengers.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">System Share</span>
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-sm">
                      {route.sharePct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Trips Executed</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {route.trips.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Avg Pax / Trip</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {route.avgPassengersPerTrip}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelectRoute(route.routeCode)
                    onBackToOverview()
                  }}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                  className="w-full justify-between"
                >
                  Inspect in Overview
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" size="sm" onClick={onBackToOverview}>
          &larr; Back to Main Dashboard
        </Button>
      </div>
    </div>
  )
}
