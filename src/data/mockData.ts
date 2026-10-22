/**
 * @file mockData.ts
 * @description Centralized data access layer for TransitPulse.
 * Connects the pure analytical engine to the synthetic public transport dataset.
 *
 * ALL METRICS, CHARTS, TABLES, AND INSIGHTS ARE DYNAMICALLY DERIVED FROM
 * THE CENTRALIZED SYNTHETIC DATASET. NOTHING IS ARBITRARILY HARDCODED.
 */

import {
  CENTRALIZED_SYNTHETIC_DATASET,
  SYNTHETIC_DATASET_META,
  ROUTE_DEFINITIONS
} from './syntheticDataset'

import {
  deriveKpis,
  aggregateDemandOverTime,
  aggregateHourlyDemand,
  aggregateRouteComparison,
  aggregateWeekdayDemand,
  extractPeakPeriodInsights,
  extractBusiestRouteInsights,
  filterRecords
} from '../analytics/transitAnalytics'

import type {
  NavItem,
  TimeRange,
  TransitTripRecord,
  DemandMetric,
  TimeSeriesDemandPoint,
  HourlyDemandPoint,
  RouteComparisonPoint,
  WeekdayDemandPoint,
  PeakPeriodInsight,
  BusiestRouteInsight
} from '../types/transit'

export { CENTRALIZED_SYNTHETIC_DATASET, SYNTHETIC_DATASET_META, ROUTE_DEFINITIONS }

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', iconName: 'LayoutDashboard' },
  { id: 'routes', label: 'Route Analysis', iconName: 'Route', badge: '6 Corridors' },
  { id: 'peak-hours', label: 'Peak Hours', iconName: 'Clock', badge: 'AM/PM' },
  { id: 'explorer', label: 'Data Explorer', iconName: 'Database' }
]

export const ROUTE_OPTIONS = [
  { id: 'all', label: 'All Corridors & Lines', mode: 'all' },
  ...ROUTE_DEFINITIONS.map((r) => ({
    id: r.routeCode,
    label: `${r.routeCode} · ${r.routeName} (${r.mode.toUpperCase()})`,
    mode: r.mode
  }))
]

/**
 * Baseline initial activity telemetry derived from the most recent records in the dataset.
 */
export const RECENT_ACTIVITIES: TransitTripRecord[] = CENTRALIZED_SYNTHETIC_DATASET.slice(-25).reverse()

/**
 * Retrieves derived analytical dataset for any given filter combination.
 */
export function getDerivedAnalytics(
  records: TransitTripRecord[],
  timeRange: TimeRange = '30d',
  selectedRoute: string = 'all'
): {
  filteredRecords: TransitTripRecord[]
  kpiMetrics: DemandMetric[]
  timeSeriesData: TimeSeriesDemandPoint[]
  hourlyData: HourlyDemandPoint[]
  routeComparisonData: RouteComparisonPoint[]
  weekdayData: WeekdayDemandPoint[]
  peakPeriodInsights: PeakPeriodInsight[]
  busiestRouteInsights: BusiestRouteInsight[]
} {
  const filteredRecords = filterRecords(records, {
    timeRange,
    routeId: selectedRoute
  })

  // Fallback to active subset or master if filtered is empty
  const activeRecords = filteredRecords.length > 0 ? filteredRecords : records

  const kpiMetrics = deriveKpis(activeRecords, timeRange, selectedRoute)
  const timeSeriesData = aggregateDemandOverTime(activeRecords, timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 14)
  const hourlyData = aggregateHourlyDemand(activeRecords)
  const routeComparisonData = aggregateRouteComparison(activeRecords)
  const weekdayData = aggregateWeekdayDemand(activeRecords)
  const peakPeriodInsights = extractPeakPeriodInsights(activeRecords)
  const busiestRouteInsights = extractBusiestRouteInsights(activeRecords, 3)

  return {
    filteredRecords,
    kpiMetrics,
    timeSeriesData,
    hourlyData,
    routeComparisonData,
    weekdayData,
    peakPeriodInsights,
    busiestRouteInsights
  }
}
