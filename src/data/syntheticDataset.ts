import type {
  TransitTripRecord,
  SyntheticDatasetMeta,
  TransportMode,
  ServiceStatus
} from '../types/transit'

export interface RouteDefinition {
  routeId: string
  routeCode: string
  routeName: string
  mode: TransportMode
  origin: string
  destination: string
  capacity: number
  baseVolumeWeekday: number
  baseVolumeWeekend: number
  dispatchFrequencyPerHour: number
}

export const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    routeId: 'rt-m1',
    routeCode: 'M1-Red',
    routeName: 'Central Cross-City Express',
    mode: 'metro',
    origin: 'North Union Station',
    destination: 'South Terminal Hub',
    capacity: 900,
    baseVolumeWeekday: 820,
    baseVolumeWeekend: 510,
    dispatchFrequencyPerHour: 10
  },
  {
    routeId: 'rt-b42',
    routeCode: 'B42',
    routeName: 'Harbor Tech Corridor',
    mode: 'bus',
    origin: 'Harbor Wharf Terminal',
    destination: 'Innovation Tech Park',
    capacity: 120,
    baseVolumeWeekday: 105,
    baseVolumeWeekend: 68,
    dispatchFrequencyPerHour: 12
  },
  {
    routeId: 'rt-m3',
    routeCode: 'M3-Teal',
    routeName: 'University Beltway',
    mode: 'metro',
    origin: 'West Campus Junction',
    destination: 'Biotech Research Hub',
    capacity: 850,
    baseVolumeWeekday: 640,
    baseVolumeWeekend: 390,
    dispatchFrequencyPerHour: 8
  },
  {
    routeId: 'rt-t12',
    routeCode: 'T12',
    routeName: 'Riverside Promenade Loop',
    mode: 'tram',
    origin: 'Old Maritime Docks',
    destination: 'Cultural District Arts Plaza',
    capacity: 220,
    baseVolumeWeekday: 155,
    baseVolumeWeekend: 185,
    dispatchFrequencyPerHour: 6
  },
  {
    routeId: 'rt-crs',
    routeCode: 'CR-South',
    routeName: 'Southern Regional Commuter',
    mode: 'rail',
    origin: 'South Gateway Interchange',
    destination: 'Financial Center Terminus',
    capacity: 1250,
    baseVolumeWeekday: 1120,
    baseVolumeWeekend: 450,
    dispatchFrequencyPerHour: 4
  },
  {
    routeId: 'rt-b18',
    routeCode: 'B18',
    routeName: 'Airport Shuttle Direct',
    mode: 'bus',
    origin: 'City Center Hub',
    destination: 'International Airport T3',
    capacity: 110,
    baseVolumeWeekday: 92,
    baseVolumeWeekend: 98,
    dispatchFrequencyPerHour: 6
  }
]

/**
 * Deterministic pseudo-random number generator for repeatable synthetic data.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Hourly demand multiplier modeling standard metropolitan ridership patterns.
 * High morning rush (07:00 - 09:30) and evening rush (16:30 - 19:00).
 */
function getHourlyMultiplier(hour: number, isWeekend: boolean): number {
  if (isWeekend) {
    // Weekend curve: midday leisure peak (11:00 - 16:00), lower early mornings
    if (hour < 7) return 0.22
    if (hour >= 7 && hour < 10) return 0.55
    if (hour >= 10 && hour <= 16) return 1.05
    if (hour > 16 && hour <= 20) return 0.85
    return 0.4
  }

  // Weekday commuter curve
  switch (hour) {
    case 5:
      return 0.28
    case 6:
      return 0.65
    case 7:
      return 1.48 // AM surge starts
    case 8:
      return 1.95 // AM apex peak
    case 9:
      return 1.62
    case 10:
      return 0.98
    case 11:
      return 0.88
    case 12:
      return 1.05 // Lunchtime movement
    case 13:
      return 0.96
    case 14:
      return 1.04
    case 15:
      return 1.25 // Afternoon buildup
    case 16:
      return 1.62
    case 17:
      return 2.08 // PM apex peak
    case 18:
      return 1.92
    case 19:
      return 1.34
    case 20:
      return 0.88
    case 21:
      return 0.64
    case 22:
      return 0.42
    case 23:
      return 0.25
    default:
      return 0.3
  }
}

/**
 * Generates the centralized synthetic transport dataset.
 * Spans 30 consecutive calendar days across all route definitions and operational hours.
 */
function generateSyntheticDataset(): TransitTripRecord[] {
  const records: TransitTripRecord[] = []
  const startDate = new Date(2026, 8, 20) // Sep 20, 2026
  const totalDays = 30
  let recordIdCounter = 1

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + dayOffset)

    const dateStr = currentDate.toISOString().slice(0, 10)
    const dayOfWeek = currentDate.getDay() // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Hours from 05:00 to 23:00
    for (let hour = 5; hour <= 23; hour++) {
      const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`
      const hourlyMult = getHourlyMultiplier(hour, isWeekend)

      for (let rIdx = 0; rIdx < ROUTE_DEFINITIONS.length; rIdx++) {
        const route = ROUTE_DEFINITIONS[rIdx]
        const seed = dayOffset * 1000 + hour * 50 + rIdx * 7
        const variance = 0.88 + pseudoRandom(seed) * 0.24 // +/- 12% natural variance

        const baseCapacity = route.capacity
        const baseVolume = isWeekend ? route.baseVolumeWeekend : route.baseVolumeWeekday
        const rawPassengers = Math.round(baseVolume * hourlyMult * variance)
        const passengers = Math.max(12, rawPassengers)

        // Estimated trip dispatches for this route at this hour
        const baseTrips = route.dispatchFrequencyPerHour
        const tripsCount = isWeekend
          ? Math.max(2, Math.round(baseTrips * 0.65))
          : hourlyMult > 1.4
          ? Math.round(baseTrips * 1.3)
          : baseTrips

        const totalCapacityAtHour = baseCapacity * tripsCount
        const loadFactorPct = Math.min(
          100,
          Math.round((passengers / Math.max(totalCapacityAtHour, 1)) * 1000) / 10
        )

        let status: ServiceStatus = 'optimal'
        if (loadFactorPct >= 92) {
          status = 'congested'
        } else if (loadFactorPct >= 80) {
          status = 'moderate'
        } else if (hour === 8 && rIdx === 4 && dayOffset % 5 === 0) {
          // Occasional simulated signal delay on Commuter Rail
          status = 'delayed'
        }

        records.push({
          id: `syn-${recordIdCounter}`,
          tripId: `TRIP-SYN-${10000 + recordIdCounter}`,
          date: dateStr,
          time: hourStr,
          routeId: route.routeId,
          routeCode: route.routeCode,
          routeName: route.routeName,
          origin: route.origin,
          destination: route.destination,
          passengers,
          tripCount: tripsCount,
          capacity: totalCapacityAtHour,
          loadFactorPct,
          mode: route.mode,
          status,
          isSynthetic: true
        })

        recordIdCounter++
      }
    }
  }

  return records
}

// Generate the master synthetic dataset once
export const CENTRALIZED_SYNTHETIC_DATASET: TransitTripRecord[] = generateSyntheticDataset()

export const SYNTHETIC_DATASET_META: SyntheticDatasetMeta = {
  datasetName: 'TransitPulse Synthetic Benchmark Telemetry Feed',
  version: '2.4.0',
  isSynthetic: true,
  disclaimer:
    'SYNTHETIC DATA NOTICE: All records, passenger volumes, origin-destination pairs, and route metrics in this dataset are synthetically generated for analytical demonstration, benchmark testing, and UI validation. They do not represent official transit agency reports.',
  generatedAt: '2026-10-19T00:00:00Z',
  recordCount: CENTRALIZED_SYNTHETIC_DATASET.length,
  routesCovered: ROUTE_DEFINITIONS.map((r) => r.routeCode),
  dateRange: { start: '2026-09-20', end: '2026-10-19' }
}
