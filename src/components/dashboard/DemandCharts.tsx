import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts'
import { Card } from '../common/Card'
import type {
  TimeSeriesDemandPoint,
  HourlyDemandPoint,
  RouteComparisonPoint,
  WeekdayDemandPoint
} from '../../types/transit'

interface DemandChartsProps {
  timeSeriesData: TimeSeriesDemandPoint[]
  hourlyData: HourlyDemandPoint[]
  routeComparisonData: RouteComparisonPoint[]
  weekdayData: WeekdayDemandPoint[]
  selectedRouteLabel?: string
}

// Dark-mode aware tooltip styling
const tooltipStyle = {
  backgroundColor: '#0F172A',
  color: '#F8FAFC',
  borderRadius: '8px',
  border: '1px solid #1E293B',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
  fontSize: '12px',
  padding: '8px 12px'
}

const tooltipLabelStyle = { fontWeight: 600, color: '#38BDF8', marginBottom: '4px' }

// Axis tick colors — works in both light/dark since we use a consistent muted color
const AXIS_TICK = { fill: '#64748b', fontSize: 11 }
const AXIS_Y_DARK = { fill: '#475569', fontSize: 11 }
const GRID_STROKE = '#1e293b'       // darker grid for dark cards
const GRID_STROKE_LIGHT = '#f1f5f9' // lighter grid for light cards

export const DemandCharts: React.FC<DemandChartsProps> = ({
  timeSeriesData,
  hourlyData,
  routeComparisonData,
  weekdayData,
  selectedRouteLabel = 'All Routes'
}) => {
  // Determine if dark mode is active by checking document class
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const gridColor = isDark ? GRID_STROKE : GRID_STROKE_LIGHT
  const axisTickColor = isDark ? AXIS_Y_DARK.fill : AXIS_TICK.fill

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Passenger Demand Over Time (Line/Area Chart) */}
      <Card
        title="Passenger Demand Over Time"
        subtitle={`Daily passenger volume trend & network capacity threshold (${selectedRouteLabel})`}
        action={
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> Actual Pax
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-slate-400 dark:bg-slate-500 inline-block" /> Capacity
            </span>
          </div>
        }
      >
        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timeSeriesData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="demandTimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                tick={{ fill: axisTickColor, fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: axisTickColor, fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(val, name) => {
                  if (name === 'passengers') return [Number(val).toLocaleString() + ' pax', 'Total Demand']
                  if (name === 'capacity') return [Number(val).toLocaleString() + ' seats', 'Total Capacity']
                  return [val, name]
                }}
              />
              <Area
                type="monotone"
                dataKey="passengers"
                name="passengers"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#demandTimeGrad)"
              />
              <Area
                type="monotone"
                dataKey="capacity"
                name="capacity"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Hourly Demand (Bar Chart with Peak Accents) */}
      <Card
        title="Hourly Demand Profile (24-Hour Distribution)"
        subtitle="Distribution across day with AM (07-09) & PM (17-19) peak hours highlighted"
        action={
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block" /> Standard
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Peak Surge
            </span>
          </div>
        }
      >
        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                tick={{ fill: axisTickColor, fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: axisTickColor, fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(val, _, item) => {
                  const payload = item.payload as HourlyDemandPoint
                  return [
                    `${Number(val).toLocaleString()} pax (Metro: ${(payload.metro / 1000).toFixed(0)}k, Bus: ${(payload.bus / 1000).toFixed(0)}k)`,
                    payload.isPeak ? 'Peak Surge Demand' : 'Standard Demand'
                  ]
                }}
              />
              <Bar dataKey="passengers" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isPeak ? '#f59e0b' : '#0ea5e9'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Route-wise Passenger Comparison (Horizontal Bar Chart) */}
      <Card
        title="Route-Wise Passenger Volume Comparison"
        subtitle="Passenger distribution across key corridors and regional transit modes"
      >
        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={routeComparisonData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 35, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                tick={{ fill: axisTickColor, fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="routeCode"
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#94a3b8' : '#1e293b', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(val, _, item) => {
                  const p = item.payload as RouteComparisonPoint
                  return [
                    `${Number(val).toLocaleString()} pax (${p.sharePct}% share, avg ${p.avgPassengersPerTrip} pax/trip)`,
                    p.routeName
                  ]
                }}
              />
              <Bar dataKey="passengers" radius={[0, 4, 4, 0]}>
                {routeComparisonData.map((entry, index) => {
                  const colors: Record<string, string> = {
                    metro: '#0284c7',
                    bus: '#f59e0b',
                    tram: '#0d9488',
                    rail: '#7c3aed'
                  }
                  return (
                    <Cell
                      key={`route-cell-${index}`}
                      fill={colors[entry.mode] || '#0284c7'}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. Weekday Demand Pattern */}
      <Card
        title="Weekday Demand Pattern (Day-of-Week Variation)"
        subtitle="Weekday commuter volumes vs. weekend transit demand baseline"
        action={
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" /> Weekdays
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-400 inline-block" /> Weekend
            </span>
          </div>
        }
      >
        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weekdayData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="shortDay"
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                tick={{ fill: axisTickColor, fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: axisTickColor, fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(val, _, item) => {
                  const w = item.payload as WeekdayDemandPoint
                  return [
                    `${Number(val).toLocaleString()} pax (${w.trips.toLocaleString()} trips, peak at ${w.peakWindow})`,
                    w.day
                  ]
                }}
              />
              <Bar dataKey="passengers" radius={[4, 4, 0, 0]}>
                {weekdayData.map((entry, index) => (
                  <Cell
                    key={`weekday-cell-${index}`}
                    fill={entry.isWeekend ? '#94a3b8' : '#0284c7'}
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
