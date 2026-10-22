import React from 'react'
import type { ServiceStatus } from '../../types/transit'

interface StatusBadgeProps {
  status: ServiceStatus | 'normal' | 'warning' | 'alert' | 'smooth' | 'crowded' | 'critical'
  label?: string
  size?: 'sm' | 'md'
  showPulse?: boolean
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  optimal: {
    bg: 'bg-emerald-50 border-emerald-200/60',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    defaultLabel: 'Normal'
  },
  smooth: {
    bg: 'bg-emerald-50 border-emerald-200/60',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    defaultLabel: 'Smooth Flow'
  },
  normal: {
    bg: 'bg-emerald-50 border-emerald-200/60',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    defaultLabel: 'Stable'
  },
  moderate: {
    bg: 'bg-sky-50 border-sky-200/60',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    defaultLabel: 'Moderate'
  },
  congested: {
    bg: 'bg-amber-50 border-amber-200/60',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    defaultLabel: 'High Load'
  },
  crowded: {
    bg: 'bg-amber-50 border-amber-200/60',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    defaultLabel: 'Crowded'
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200/60',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    defaultLabel: 'Elevated'
  },
  delayed: {
    bg: 'bg-rose-50 border-rose-200/60',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    defaultLabel: 'Delayed'
  },
  critical: {
    bg: 'bg-rose-50 border-rose-200/60',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    defaultLabel: 'Critical'
  },
  alert: {
    bg: 'bg-rose-50 border-rose-200/60',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    defaultLabel: 'Alert'
  },
  maintenance: {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
    defaultLabel: 'Scheduled Maintenance'
  }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  showPulse = false
}) => {
  const config = statusConfig[status] || statusConfig.optimal
  const displayLabel = label || config.defaultLabel

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {showPulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
      </span>
      <span>{displayLabel}</span>
    </span>
  )
}
