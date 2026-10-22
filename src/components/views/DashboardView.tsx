import React, { useMemo } from 'react'
import {
  Users,
  Compass,
  Gauge,
  Flame,
  Info
} from 'lucide-react'
import { MetricCard } from '../common/MetricCard'
import { InsightsPanel } from '../dashboard/InsightsPanel'
import { DemandCharts } from '../dashboard/DemandCharts'
import { ActivityTable } from '../dashboard/ActivityTable'
import { getDerivedAnalytics, SYNTHETIC_DATASET_META } from '../../data/mockData'
import type { TimeRange, TransitTripRecord } from '../../types/transit'

interface DashboardViewProps {
  timeRange: TimeRange
  selectedRoute: string
  onSelectRoute: (routeId: string) => void
  records: TransitTripRecord[]
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  timeRange,
  selectedRoute,
  onSelectRoute,
  records
}) => {
  // Derive all analytical entities dynamically from active dataset
  const {
    filteredRecords,
    kpiMetrics,
    timeSeriesData,
    hourlyData,
    routeComparisonData,
    weekdayData,
    peakPeriodInsights,
    busiestRouteInsights
  } = useMemo(() => {
    return getDerivedAnalytics(records, timeRange, selectedRoute)
  }, [records, timeRange, selectedRoute])

  const kpiIcons = [
    <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" key="pax" />,
    <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" key="trips" />,
    <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" key="avg" />,
    <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" key="busiest" />
  ]

  return (
    <div className="space-y-6">
      {/* Synthetic Dataset Notice Banner */}
      <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-sky-950 dark:text-sky-300 shadow-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>
            <strong className="font-semibold text-sky-900 dark:text-sky-300">Synthetic Data Benchmark Feed:</strong>{' '}
            All passenger volumes and dispatches are synthetically simulated for analytical demonstration. Never present as official public statistics.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60 shrink-0">
          v{SYNTHETIC_DATASET_META.version} · {records.length.toLocaleString()} records
        </span>
      </div>

      {/* 1. Four Core KPI Cards derived dynamically */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric, idx) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            icon={kpiIcons[idx]}
          />
        ))}
      </div>

      {/* 2. Compact Insights Panel derived dynamically */}
      <InsightsPanel
        peakPeriods={peakPeriodInsights}
        busiestRoutes={busiestRouteInsights}
        onSelectRoute={onSelectRoute}
      />

      {/* 3. Four Recharts Visualizations derived dynamically */}
      <DemandCharts
        timeSeriesData={timeSeriesData}
        hourlyData={hourlyData}
        routeComparisonData={routeComparisonData}
        weekdayData={weekdayData}
        selectedRouteLabel={selectedRoute === 'all' ? 'All Network Corridors' : selectedRoute}
      />

      {/* 4. Recent Transport Activity & Telemetry Table derived dynamically */}
      <ActivityTable
        activities={filteredRecords.length > 0 ? filteredRecords : records}
        selectedRouteFilter={selectedRoute}
        onSelectRoute={onSelectRoute}
      />
    </div>
  )
}
