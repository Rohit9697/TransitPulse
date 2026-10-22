import { describe, it, expect } from 'vitest'
import {
  tokenizeCsv,
  findHeaderIndices,
  parseAndValidateCsv,
  generateCsvString
} from './csvParser'
import type { TransitTripRecord } from '../types/transit'

describe('csvParser Utility', () => {
  describe('tokenizeCsv', () => {
    it('handles empty input', () => {
      expect(tokenizeCsv('')).toEqual([])
      expect(tokenizeCsv('   ')).toEqual([])
    })

    it('parses standard unquoted rows', () => {
      const csv = 'Route,Pax,Mode\nM1,850,metro\nB42,120,bus'
      const rows = tokenizeCsv(csv)
      expect(rows).toHaveLength(3)
      expect(rows[1]).toEqual(['M1', '850', 'metro'])
    })

    it('handles fields with commas enclosed in double quotes (RFC 4180)', () => {
      const csv = 'Route,Name,Pax\nM1,"Central Station, North",850'
      const rows = tokenizeCsv(csv)
      expect(rows).toHaveLength(2)
      expect(rows[1][1]).toBe('Central Station, North')
    })

    it('handles escaped double quotes ("")', () => {
      const csv = 'Route,Name\nM1,"The ""Express"" Corridor"'
      const rows = tokenizeCsv(csv)
      expect(rows[1][1]).toBe('The "Express" Corridor')
    })
  })

  describe('findHeaderIndices', () => {
    it('detects missing required columns', () => {
      const result = findHeaderIndices(['Date', 'Time', 'Mode'])
      expect(result.missingRequired.length).toBeGreaterThan(0)
    })

    it('matches aliased headers correctly', () => {
      const result = findHeaderIndices(['Line', 'Corridor', 'Pax', 'Seats', 'Date', 'Time'])
      expect(result.routeCodeIdx).toBe(0)
      expect(result.routeNameIdx).toBe(1)
      expect(result.passengersIdx).toBe(2)
      expect(result.capacityIdx).toBe(3)
      expect(result.missingRequired).toHaveLength(0)
    })
  })

  describe('parseAndValidateCsv', () => {
    it('rejects empty CSV text', () => {
      const res = parseAndValidateCsv('')
      expect(res.success).toBe(false)
      expect(res.error).toContain('empty')
    })

    it('rejects CSV with missing required headers', () => {
      const res = parseAndValidateCsv('Foo,Bar,Baz\n1,2,3')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Missing required column headers')
    })

    it('safely validates valid rows and skips invalid rows with descriptive issues', () => {
      const csv = `RouteCode,RouteName,Date,Time,Passengers,Capacity,Mode,Status
M1-Red,"Central, Cross-City",2026-10-19,08:30,850,900,metro,congested
,Missing Route,2026-10-19,08:35,120,150,bus,optimal
B42,Harbor Corridor,2026-10-19,08:40,INVALID_PAX,120,bus,optimal
T12,Riverside Loop,2026-10-19,08:45,180,220,tram,optimal`

      const res = parseAndValidateCsv(csv)
      expect(res.success).toBe(true)
      expect(res.validRecords).toHaveLength(2)
      expect(res.rejectedRowsCount).toBe(2)
      expect(res.issues).toHaveLength(2)

      // First valid record preserves quoted comma name
      expect(res.validRecords[0].routeName).toBe('Central, Cross-City')
      expect(res.validRecords[0].passengers).toBe(850)

      // Checks rejected issues
      expect(res.issues[0].field).toBe('Route')
      expect(res.issues[1].field).toBe('Passengers')
    })
  })

  describe('generateCsvString', () => {
    it('escapes fields with commas properly', () => {
      const records: TransitTripRecord[] = [
        {
          id: 'test-1',
          tripId: 'TRIP-1',
          date: '2026-10-19',
          time: '08:00',
          routeId: 'rt-m1',
          routeCode: 'M1-Red',
          routeName: 'Central, Express Corridor',
          origin: 'North, Station',
          destination: 'South Terminal',
          passengers: 850,
          tripCount: 1,
          capacity: 900,
          loadFactorPct: 94.4,
          mode: 'metro',
          status: 'congested',
          isSynthetic: true
        }
      ]

      const csvString = generateCsvString(records)
      expect(csvString).toContain('"Central, Express Corridor"')
      expect(csvString).toContain('"North, Station"')
      expect(csvString).toContain('850')
    })
  })
})
