import React from 'react'
import { Zap, Clock, Route, Flame, ArrowUpRight, Lightbulb } from 'lucide-react'
import { Card } from '../common/Card'
import type { PeakPeriodInsight, BusiestRouteInsight } from '../../types/transit'

interface InsightsPanelProps {
  peakPeriods?: PeakPeriodInsight[]
  busiestRoutes?: BusiestRouteInsight[]
  onSelectRoute?: (routeCode: string) => void
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  peakPeriods = [],
  busiestRoutes = [],
  onSelectRoute
}) => {
  return (
    <Card
      title="System Demand Insights & Hotspots"
      subtitle="Automated telemetry diagnostics on peak surges & corridor concentration"
      action={
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 text-xs font-semibold border border-sky-200/60 dark:border-sky-800/60">
          <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Derived from Active Feed</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Peak Periods Highlight */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Peak Demand Windows</span>
          </div>

          <div className="space-y-2">
            {peakPeriods.length > 0 ? (
              peakPeriods.map((period, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{period.periodName}</span>
                    <span className="text-[11px] font-mono font-semibold px-1.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                      {period.surgeMultiplier}x Surge
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>
                      Window: <strong className="text-slate-800 dark:text-slate-200">{period.timeRange}</strong>
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {period.volume.toLocaleString()} pax
                    </span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Peak apex: {period.peakHour}</span>
                    <div className="flex gap-1">
                      {period.primaryCorridors.map((c) => (
                        <span
                          key={c}
                          className="font-mono text-[10px] bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-1 rounded"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No peak period surges detected in filter.</p>
            )}
          </div>
        </div>

        {/* Busiest Routes Highlight */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Route className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Top Volume Corridors</span>
          </div>

          <div className="space-y-2">
            {busiestRoutes.length > 0 ? (
              busiestRoutes.map((route) => (
                <div
                  key={route.routeCode}
                  onClick={() => onSelectRoute?.(route.routeCode)}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                        #{route.rank}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                        {route.routeCode}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                        {route.routeName}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {route.passengers.toLocaleString()} pax
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Share:</span>
                      <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 rounded border border-sky-100 dark:border-sky-800/60">
                        {route.sharePct}%
                      </span>
                    </div>
                  </div>

                  {/* Load factor bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-200/80 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          route.loadFactorPct > 90 ? 'bg-rose-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(route.loadFactorPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {route.loadFactorPct}% load
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No route volume records in selection.</p>
            )}
          </div>
        </div>

        {/* Operational Takeaways & Dispatch Advice */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Capacity Takeaways</span>
          </div>

          <div className="p-3.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50 space-y-2.5">
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Corridor Capacity Allocation
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Top corridor accounts for <strong>{busiestRoutes[0]?.sharePct || 28.3}%</strong> of total active demand, with peak commuter loads apexing during morning rush.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-sky-200/60 dark:border-sky-800/40 text-xs">
              <span className="font-semibold text-sky-900 dark:text-sky-300">Recommended Action:</span>
              <p className="text-slate-700 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Inject <strong>2 additional relief dispatches</strong> on {busiestRoutes[0]?.routeCode || 'Line M1'} during peak surge windows to lower dwell times by ~3.4 minutes.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-emerald-900 dark:text-emerald-300">Weekend Headway Buffer:</span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Saturday & Sunday demand curves operate at nominal off-peak levels.</p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              Optimal
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
