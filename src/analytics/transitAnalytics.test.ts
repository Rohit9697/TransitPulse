import { describe, it, expect } from 'vitest'
import {
  calculateTotalPassengers,
  calculateTotalTrips,
  calculateAveragePassengersPerTrip,
  findBusiestRoute,
  aggregateHourlyDemand,
  aggregateRouteComparison,
  aggregateWeekdayDemand,
  aggregateDemandOverTime,
  extractPeakPeriodInsights,
  filterRecords
} from './transitAnalytics'
import type { TransitTripRecord } from '../types/transit'

// Sample minimal records for test fixtures
const mockRecords: TransitTripRecord[] = [
  {
    id: 'test-1',
    tripId: 'TRIP-1',
    date: '2026-10-19',
    time: '08:00',
    routeId: 'rt-m1',
    routeCode: 'M1-Red',
    routeName: 'Central Cross-City Express',
    origin: 'North Station',
    destination: 'South Terminal',
    passengers: 800,
    tripCount: 8,
    capacity: 1000,
    loadFactorPct: 80,
    mode: 'metro',
    status: 'optimal',
    isSynthetic: true
  },
  {
    id: 'test-2',
    tripId: 'TRIP-2',
    date: '2026-10-19',
    time: '08:00',
    routeId: 'rt-b42',
    routeCode: 'B42',
    routeName: 'Harbor Tech Corridor',
    origin: 'Harbor Wharf',
    destination: 'Tech Park',
    passengers: 200,
    tripCount: 4,
    capacity: 250,
    loadFactorPct: 80,
    mode: 'bus',
    status: 'optimal',
    isSynthetic: true
  },
  {
    id: 'test-3',
    tripId: 'TRIP-3',
    date: '2026-10-18', // Sunday
    time: '17:00',
    routeId: 'rt-m1',
    routeCode: 'M1-Red',
    routeName: 'Central Cross-City Express',
    origin: 'North Station',
    destination: 'South Terminal',
    passengers: 500,
    tripCount: 5,
    capacity: 600,
    loadFactorPct: 83.3,
    mode: 'metro',
    status: 'optimal',
    isSynthetic: true
  }
]

describe('transitAnalytics Calculation Engine', () => {
  describe('calculateTotalPassengers', () => {
    it('handles empty records safely', () => {
      expect(calculateTotalPassengers([])).toBe(0)
    })

    it('sums passenger counts correctly', () => {
      expect(calculateTotalPassengers(mockRecords)).toBe(1500)
    })
  })

  describe('calculateTotalTrips', () => {
    it('handles empty records safely', () => {
      expect(calculateTotalTrips([])).toBe(0)
    })

    it('sums trip dispatches correctly', () => {
      expect(calculateTotalTrips(mockRecords)).toBe(17)
    })
  })

  describe('calculateAveragePassengersPerTrip', () => {
    it('handles empty records without NaN or division by zero', () => {
      expect(calculateAveragePassengersPerTrip([])).toBe(0)
    })

    it('calculates average passengers per trip properly', () => {
      // 1500 passengers / 17 trips = 88.235... -> 88.2
      expect(calculateAveragePassengersPerTrip(mockRecords)).toBe(88.2)
    })

    it('handles zero trips count safely', () => {
      const zeroTripRecord: TransitTripRecord = {
        ...mockRecords[0],
        tripCount: 0
      }
      expect(calculateAveragePassengersPerTrip([zeroTripRecord])).toBe(0)
    })
  })

  describe('findBusiestRoute', () => {
    it('returns null on empty dataset', () => {
      expect(findBusiestRoute([])).toBeNull()
    })

    it('identifies busiest route and share percentage', () => {
      const busiest = findBusiestRoute(mockRecords)
      expect(busiest).not.toBeNull()
      expect(busiest?.routeCode).toBe('M1-Red')
      // M1 has 800 + 500 = 1300 passengers out of 1500 total (86.7%)
      expect(busiest?.passengers).toBe(1300)
      expect(busiest?.sharePct).toBe(86.7)
    })
  })

  describe('aggregateHourlyDemand', () => {
    it('returns standard 19-hour operational spectrum even for empty dataset', () => {
      const hourly = aggregateHourlyDemand([])
      expect(hourly).toHaveLength(19)
      expect(hourly[0].hour).toBe('05:00')
      expect(hourly[18].hour).toBe('23:00')
      expect(hourly[0].passengers).toBe(0)
    })

    it('accurately buckets demand into the 08:00 and 17:00 slots', () => {
      const hourly = aggregateHourlyDemand(mockRecords)
      const eightAm = hourly.find((h) => h.hour === '08:00')
      const fivePm = hourly.find((h) => h.hour === '17:00')

      expect(eightAm?.passengers).toBe(1000)
      expect(eightAm?.metro).toBe(800)
      expect(eightAm?.bus).toBe(200)
      expect(eightAm?.isPeak).toBe(true)

      expect(fivePm?.passengers).toBe(500)
      expect(fivePm?.metro).toBe(500)
    })
  })

  describe('aggregateRouteComparison', () => {
    it('returns empty array on empty dataset', () => {
      expect(aggregateRouteComparison([])).toEqual([])
    })

    it('ranks routes by volume descending', () => {
      const ranked = aggregateRouteComparison(mockRecords)
      expect(ranked).toHaveLength(2)
      expect(ranked[0].routeCode).toBe('M1-Red')
      expect(ranked[0].passengers).toBe(1300)
      expect(ranked[1].routeCode).toBe('B42')
      expect(ranked[1].passengers).toBe(200)
    })
  })

  describe('aggregateWeekdayDemand', () => {
    it('returns all 7 days of the week', () => {
      const weekdays = aggregateWeekdayDemand(mockRecords)
      expect(weekdays).toHaveLength(7)
      expect(weekdays[0].day).toBe('Monday')
      expect(weekdays[6].day).toBe('Sunday')
    })

    it('correctly maps 2026-10-19 to Monday and 2026-10-18 to Sunday', () => {
      const weekdays = aggregateWeekdayDemand(mockRecords)
      const monday = weekdays.find((w) => w.day === 'Monday')
      const sunday = weekdays.find((w) => w.day === 'Sunday')

      expect(monday?.passengers).toBe(1000) // 800 + 200
      expect(sunday?.passengers).toBe(500)
    })
  })

  describe('aggregateDemandOverTime', () => {
    it('returns sorted daily timeline', () => {
      const timeline = aggregateDemandOverTime(mockRecords)
      expect(timeline).toHaveLength(2)
      expect(timeline[0].timestamp).toBe('2026-10-18')
      expect(timeline[1].timestamp).toBe('2026-10-19')
      expect(timeline[1].passengers).toBe(1000)
    })
  })

  describe('extractPeakPeriodInsights', () => {
    it('computes morning and evening peak volumes', () => {
      const insights = extractPeakPeriodInsights(mockRecords)
      expect(insights).toHaveLength(2)
      expect(insights[0].periodName).toBe('Morning Peak Surge')
      expect(insights[0].volume).toBe(1000)
      expect(insights[1].periodName).toBe('Evening Peak Surge')
      expect(insights[1].volume).toBe(500)
    })
  })

  describe('filterRecords', () => {
    it('filters by routeCode accurately', () => {
      const m1Only = filterRecords(mockRecords, { routeId: 'M1-Red' })
      expect(m1Only).toHaveLength(2)
      expect(m1Only.every((r) => r.routeCode === 'M1-Red')).toBe(true)
    })

    it('filters by transport mode', () => {
      const busOnly = filterRecords(mockRecords, { mode: 'bus' })
      expect(busOnly).toHaveLength(1)
      expect(busOnly[0].routeCode).toBe('B42')
    })

    it('filters by search term', () => {
      const searched = filterRecords(mockRecords, { search: 'Harbor' })
      expect(searched).toHaveLength(1)
      expect(searched[0].routeName).toContain('Harbor')
    })
  })
})
