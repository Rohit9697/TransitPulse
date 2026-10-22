export type TransportMode = 'metro' | 'bus' | 'tram' | 'rail'

export type ServiceStatus = 'optimal' | 'moderate' | 'congested' | 'delayed' | 'maintenance'

export type TimeRange = 'today' | '7d' | '30d' | '90d'

export type NavTabId = 'overview' | 'routes' | 'peak-hours' | 'explorer'

export interface NavItem {
  id: NavTabId
  label: string
  iconName: string
  badge?: string | number
}

export interface DemandMetric {
  id: string
  label: string
  value: string | number
  unit?: string
  changePct: number
  trend: 'up' | 'down' | 'neutral'
  periodDescription: string
  subValue?: string
  status?: 'normal' | 'warning' | 'alert'
}

export interface TimeSeriesDemandPoint {
  timestamp: string
  label: string
  passengers: number
  trips: number
  capacity: number
}

export interface HourlyDemandPoint {
  hour: string
  passengers: number
  capacity: number
  isPeak: boolean
  peakType?: 'morning' | 'evening'
  metro: number
  bus: number
  tram: number
  rail: number
}

export interface RouteComparisonPoint {
  routeCode: string
  routeName: string
  mode: TransportMode
  passengers: number
  trips: number
  avgPassengersPerTrip: number
  sharePct: number
}

export interface WeekdayDemandPoint {
  day: string
  shortDay: string
  passengers: number
  trips: number
  avgPassengersPerTrip: number
  peakWindow: string
  isWeekend: boolean
}

/**
 * Standard synthetic public transport trip record.
 * Explicitly tagged as synthetic data.
 */
export interface TransitTripRecord {
  id: string
  tripId: string
  date: string // ISO 'YYYY-MM-DD'
  time: string // 'HH:mm' or 'HH:mm AM/PM'
  routeId: string
  routeCode: string
  routeName: string
  origin: string
  destination: string
  passengers: number
  tripCount: number
  capacity: number
  loadFactorPct: number
  mode: TransportMode
  status: ServiceStatus
  isSynthetic: true
}

export type TransportActivity = TransitTripRecord

export interface SyntheticDatasetMeta {
  datasetName: string
  version: string
  isSynthetic: true
  disclaimer: string
  generatedAt: string
  recordCount: number
  routesCovered: string[]
  dateRange: { start: string; end: string }
}

export interface PeakPeriodInsight {
  periodName: string
  timeRange: string
  peakHour: string
  volume: number
  surgeMultiplier: number
  primaryCorridors: string[]
}

export interface BusiestRouteInsight {
  rank: number
  routeCode: string
  routeName: string
  mode: TransportMode
  passengers: number
  sharePct: number
  loadFactorPct: number
}

export interface DashboardFilterOptions {
  timeRange?: TimeRange
  routeId?: string
  mode?: string
  search?: string
}
