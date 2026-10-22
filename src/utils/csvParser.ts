/**
 * @file csvParser.ts
 * @description RFC-4180 compliant CSV parser and exporter with robust header and input validation.
 * Safely handles quoted commas, escaped quotes, multiline values, and missing fields.
 */

import type { TransitTripRecord, TransportMode, ServiceStatus } from '../types/transit'

export interface CsvValidationIssue {
  rowNumber: number
  field: string
  message: string
  rawRow: string
}

export interface CsvParseResult {
  success: boolean
  totalRowsRead: number
  validRecords: TransitTripRecord[]
  rejectedRowsCount: number
  issues: CsvValidationIssue[]
  error?: string
}

/**
 * Parses a raw CSV string into an array of tokenized rows, handling quoted fields and escaped quotes.
 */
export function tokenizeCsv(csvText: string): string[][] {
  const rows: string[][] = []
  if (!csvText || !csvText.trim()) return rows

  let currentRow: string[] = []
  let currentField = ''
  let insideQuotes = false
  let i = 0
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  while (i < text.length) {
    const char = text[i]

    if (insideQuotes) {
      if (char === '"') {
        // Lookahead for escaped quote ("")
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"'
          i += 2
          continue
        } else {
          // Closing quote
          insideQuotes = false
          i++
          continue
        }
      } else {
        currentField += char
        i++
        continue
      }
    } else {
      if (char === '"') {
        insideQuotes = true
        i++
        continue
      } else if (char === ',') {
        currentRow.push(currentField.trim())
        currentField = ''
        i++
        continue
      } else if (char === '\n') {
        currentRow.push(currentField.trim())
        // Ignore empty blank lines
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
        i++
        continue
      } else {
        currentField += char
        i++
        continue
      }
    }
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

/**
 * Validates CSV header columns against expected transport fields.
 */
export function findHeaderIndices(headers: string[]): {
  routeCodeIdx: number
  routeNameIdx: number
  dateIdx: number
  timeIdx: number
  passengersIdx: number
  capacityIdx: number
  modeIdx: number
  statusIdx: number
  originIdx: number
  destIdx: number
  missingRequired: string[]
} {
  const norm = headers.map((h) => h.toLowerCase().replace(/[\s_-]/g, ''))

  const findIdx = (aliases: string[]) => {
    return norm.findIndex((h) => aliases.some((a) => h === a || h.includes(a)))
  }

  const routeCodeIdx = findIdx(['routecode', 'routeid', 'route', 'line'])
  const routeNameIdx = findIdx(['routename', 'linename', 'corridor', 'name'])
  const dateIdx = findIdx(['date', 'tripdate', 'day'])
  const timeIdx = findIdx(['time', 'hour', 'departuretime', 'timestamp'])
  const passengersIdx = findIdx(['passengers', 'pax', 'ridership', 'count', 'passenger_count'])
  const capacityIdx = findIdx(['capacity', 'seats', 'maxcapacity', 'cap'])
  const modeIdx = findIdx(['mode', 'transportmode', 'type'])
  const statusIdx = findIdx(['status', 'servicestatus', 'delay', 'condition'])
  const originIdx = findIdx(['origin', 'from', 'startstation', 'source'])
  const destIdx = findIdx(['destination', 'to', 'dest', 'endstation'])

  const missingRequired: string[] = []
  if (routeCodeIdx === -1) missingRequired.push('Route (e.g. RouteCode, Route, or Line)')
  if (passengersIdx === -1) missingRequired.push('Passengers (e.g. Passengers, Pax, or Count)')

  return {
    routeCodeIdx,
    routeNameIdx,
    dateIdx,
    timeIdx,
    passengersIdx,
    capacityIdx,
    modeIdx,
    statusIdx,
    originIdx,
    destIdx,
    missingRequired
  }
}

/**
 * Parses and validates CSV content into strongly-typed TransitTripRecord items.
 */
export function parseAndValidateCsv(csvText: string): CsvParseResult {
  const tokenizedRows = tokenizeCsv(csvText)

  if (tokenizedRows.length === 0) {
    return {
      success: false,
      totalRowsRead: 0,
      validRecords: [],
      rejectedRowsCount: 0,
      issues: [],
      error: 'The uploaded CSV file is empty.'
    }
  }

  const headerRow = tokenizedRows[0]
  const indices = findHeaderIndices(headerRow)

  if (indices.missingRequired.length > 0) {
    return {
      success: false,
      totalRowsRead: tokenizedRows.length,
      validRecords: [],
      rejectedRowsCount: tokenizedRows.length - 1,
      issues: [],
      error: `Missing required column headers: ${indices.missingRequired.join(', ')}. Please verify CSV header row.`
    }
  }

  const validRecords: TransitTripRecord[] = []
  const issues: CsvValidationIssue[] = []
  const now = new Date().toISOString().slice(0, 10)

  for (let rowIdx = 1; rowIdx < tokenizedRows.length; rowIdx++) {
    const row = tokenizedRows[rowIdx]
    const rowNum = rowIdx + 1

    // Extract values with safe fallbacks
    const rawRouteCode = indices.routeCodeIdx >= 0 ? row[indices.routeCodeIdx] : ''
    const rawRouteName = indices.routeNameIdx >= 0 ? row[indices.routeNameIdx] : ''
    const rawDate = indices.dateIdx >= 0 ? row[indices.dateIdx] : now
    const rawTime = indices.timeIdx >= 0 ? row[indices.timeIdx] : '12:00'
    const rawPax = indices.passengersIdx >= 0 ? row[indices.passengersIdx] : ''
    const rawCapacity = indices.capacityIdx >= 0 ? row[indices.capacityIdx] : ''
    const rawMode = indices.modeIdx >= 0 ? row[indices.modeIdx] : ''
    const rawStatus = indices.statusIdx >= 0 ? row[indices.statusIdx] : ''
    const rawOrigin = indices.originIdx >= 0 ? row[indices.originIdx] : 'Origin Hub'
    const rawDest = indices.destIdx >= 0 ? row[indices.destIdx] : 'Terminus Station'

    // Validation 1: Route Code cannot be blank
    if (!rawRouteCode || rawRouteCode.trim().length === 0) {
      issues.push({
        rowNumber: rowNum,
        field: 'Route',
        message: 'Route code cannot be empty',
        rawRow: row.join(',')
      })
      continue
    }

    // Validation 2: Passengers must be a non-negative integer
    const parsedPax = parseInt(rawPax.replace(/[^\d-]/g, ''), 10)
    if (isNaN(parsedPax) || parsedPax < 0) {
      issues.push({
        rowNumber: rowNum,
        field: 'Passengers',
        message: `Invalid passenger count: "${rawPax}". Expected non-negative number.`,
        rawRow: row.join(',')
      })
      continue
    }

    // Capacity validation & fallback
    let parsedCapacity = parseInt(rawCapacity.replace(/[^\d-]/g, ''), 10)
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      parsedCapacity = Math.max(parsedPax, 100)
    }

    // Mode validation & normalization
    let parsedMode: TransportMode = 'bus'
    const modeLower = (rawMode || '').toLowerCase().trim()
    if (modeLower.includes('metro') || modeLower.includes('subway') || modeLower.includes('train')) {
      parsedMode = 'metro'
    } else if (modeLower.includes('tram') || modeLower.includes('lightrail') || modeLower.includes('streetcar')) {
      parsedMode = 'tram'
    } else if (modeLower.includes('rail') || modeLower.includes('commuter')) {
      parsedMode = 'rail'
    } else if (modeLower.includes('bus') || modeLower.includes('shuttle')) {
      parsedMode = 'bus'
    } else if (rawRouteCode.toUpperCase().startsWith('M')) {
      parsedMode = 'metro'
    } else if (rawRouteCode.toUpperCase().startsWith('T')) {
      parsedMode = 'tram'
    } else if (rawRouteCode.toUpperCase().startsWith('CR')) {
      parsedMode = 'rail'
    }

    // Date normalization (ensure YYYY-MM-DD format if possible)
    let normalizedDate = rawDate.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      const parsedDate = new Date(normalizedDate)
      if (!isNaN(parsedDate.getTime())) {
        normalizedDate = parsedDate.toISOString().slice(0, 10)
      } else {
        normalizedDate = now
      }
    }

    // Time normalization (ensure HH:mm)
    let normalizedTime = rawTime.trim()
    if (!normalizedTime) normalizedTime = '12:00'

    // Status normalization
    let parsedStatus: ServiceStatus = 'optimal'
    const statusLower = (rawStatus || '').toLowerCase().trim()
    if (statusLower.includes('congest') || statusLower.includes('crowd')) {
      parsedStatus = 'congested'
    } else if (statusLower.includes('delay')) {
      parsedStatus = 'delayed'
    } else if (statusLower.includes('moderat') || statusLower.includes('elevat')) {
      parsedStatus = 'moderate'
    } else if (statusLower.includes('maint')) {
      parsedStatus = 'maintenance'
    } else {
      const load = parsedCapacity > 0 ? (parsedPax / parsedCapacity) * 100 : 0
      parsedStatus = load >= 92 ? 'congested' : load >= 75 ? 'moderate' : 'optimal'
    }

    const loadFactorPct = Math.min(
      100,
      Math.round((parsedPax / Math.max(parsedCapacity, 1)) * 1000) / 10
    )

    validRecords.push({
      id: `imp-${Date.now()}-${rowIdx}`,
      tripId: `TRIP-IMP-${10000 + rowIdx}`,
      date: normalizedDate,
      time: normalizedTime,
      routeId: rawRouteCode.toLowerCase().replace(/\s+/g, '-'),
      routeCode: rawRouteCode.trim(),
      routeName: rawRouteName.trim() || `${rawRouteCode} Transit Service`,
      origin: rawOrigin.trim(),
      destination: rawDest.trim(),
      passengers: parsedPax,
      tripCount: 1,
      capacity: parsedCapacity,
      loadFactorPct,
      mode: parsedMode,
      status: parsedStatus,
      isSynthetic: true
    })
  }

  return {
    success: validRecords.length > 0,
    totalRowsRead: tokenizedRows.length - 1,
    validRecords,
    rejectedRowsCount: issues.length,
    issues,
    error:
      validRecords.length === 0
        ? 'No valid transport records could be parsed. Check issues list.'
        : undefined
  }
}

/**
 * Exports an array of records to an RFC-4180 formatted CSV string with quoted fields.
 */
export function generateCsvString(records: TransitTripRecord[]): string {
  const headers = [
    'TripId',
    'RouteCode',
    'RouteName',
    'Date',
    'Time',
    'Origin',
    'Destination',
    'Passengers',
    'TripCount',
    'Capacity',
    'LoadFactorPct',
    'Mode',
    'Status'
  ]

  const escapeField = (val: string | number | undefined): string => {
    if (val === undefined || val === null) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [headers.join(',')]

  for (const r of records) {
    const row = [
      escapeField(r.tripId),
      escapeField(r.routeCode),
      escapeField(r.routeName),
      escapeField(r.date),
      escapeField(r.time),
      escapeField(r.origin),
      escapeField(r.destination),
      r.passengers,
      r.tripCount,
      r.capacity,
      `${r.loadFactorPct}%`,
      escapeField(r.mode),
      escapeField(r.status)
    ]
    lines.push(row.join(','))
  }

  return lines.join('\n')
}

/**
 * Downloads a generated CSV string in the user's browser.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
