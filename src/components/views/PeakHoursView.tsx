import React, { useMemo } from 'react'
import { Clock, Zap, ArrowLeft } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import {
  aggregateHourlyDemand,
  extractPeakPeriodInsights
} from '../../analytics/transitAnalytics'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts'
import type { TransitTripRecord } from '../../types/transit'

interface PeakHoursViewProps {
  records: TransitTripRecord[]
  onBackToOverview: () => void
}

export const PeakHoursView: React.FC<PeakHoursViewProps> = ({
  records,
  onBackToOverview
}) => {
  const hourlyDemand = useMemo(() => {
    return aggregateHourlyDemand(records)
  }, [records])

  const peakPeriodInsights = useMemo(() => {
    return extractPeakPeriodInsights(records)
  }, [records])

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Peak Hours & Demand Surge Diagnostics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quantifying morning and evening rush congestion and dynamic frequency requirements
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onBackToOverview} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to Overview
        </Button>
      </div>

      {/* Peak Surge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {peakPeriodInsights.map((peak, idx) => (
          <Card
            key={idx}
            title={peak.periodName}
            subtitle={`Window: ${peak.timeRange} · Apex at ${peak.peakHour}`}
            action={
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {peak.surgeMultiplier}x Surge
              </span>
            }
          >
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Surge Window Passenger Volume</span>
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {peak.volume.toLocaleString()} pax
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Corridor Ingress</span>
                  <span className="text-sm font-semibold text-emerald-600">Active Monitoring</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">
                  Primary Pressure Corridors:
                </span>
                <div className="flex gap-2">
                  {peak.primaryCorridors.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-1 rounded bg-white text-slate-800 font-mono font-semibold border border-slate-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Frequency recommendation: Reduce vehicle headways by 30-45 seconds between{' '}
                  <strong className="text-slate-900">{peak.peakHour}</strong> to absorb platform passenger surges.
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Hourly Peak Distribution Chart */}
      <Card
        title="Network Hourly Demand Distribution (24-Hour Timeline)"
        subtitle="Identifying non-linear spikes during AM and PM commuter windows"
      >
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyDemand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="passengers" radius={[4, 4, 0, 0]}>
                {hourlyDemand.map((entry, index) => (
                  <Cell
                    key={`peak-cell-${index}`}
                    fill={entry.isPeak ? '#f59e0b' : '#0ea5e9'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
