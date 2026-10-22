import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DemandMetric } from '../../types/transit'

interface MetricCardProps {
  metric: DemandMetric
  icon?: React.ReactNode
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, icon }) => {
  const isPositive = metric.changePct > 0
  const isNeutral = metric.changePct === 0

  return (
    <div className="bg-white dark:bg-[#0d172e] rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {metric.label}
          </span>
          {icon && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-slate-700 dark:text-slate-300">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{metric.unit}</span>
            )}
          </div>
          {metric.subValue && (
            <p className="text-xs font-medium text-sky-700 dark:text-sky-400 mt-1 font-mono">
              {metric.subValue}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
              isNeutral
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                : isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-semibold'
            }`}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? `+${metric.changePct}%` : `${metric.changePct}%`}
          </span>
          <span className="text-slate-500 dark:text-slate-400 truncate">{metric.periodDescription}</span>
        </div>
      </div>
    </div>
  )
}
