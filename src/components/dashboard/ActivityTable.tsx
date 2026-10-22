import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertCircle
} from 'lucide-react'
import { Card } from '../common/Card'
import { StatusBadge } from '../common/StatusBadge'
import { Button } from '../common/Button'
import type { TransportActivity, TransportMode } from '../../types/transit'

interface ActivityTableProps {
  activities: TransportActivity[]
  selectedRouteFilter?: string
  onSelectRoute?: (routeCode: string) => void
}

const modeBadgeStyles: Record<TransportMode, { label: string; light: string; dark: string }> = {
  metro: { label: 'Metro', light: 'bg-indigo-50 text-indigo-700 border-indigo-200', dark: 'dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60' },
  bus: { label: 'Bus', light: 'bg-amber-50 text-amber-700 border-amber-200', dark: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60' },
  tram: { label: 'Tram', light: 'bg-teal-50 text-teal-700 border-teal-200', dark: 'dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60' },
  rail: { label: 'Commuter Rail', light: 'bg-purple-50 text-purple-700 border-purple-200', dark: 'dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60' }
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  selectedRouteFilter = 'all',
  onSelectRoute
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMode, setSelectedMode] = useState<string>('all')
  const [sortField, setSortField] = useState<'time' | 'passengers' | 'loadFactorPct'>('time')
  const [sortAsc, setSortAsc] = useState(false)
  const [pageSize, setPageSize] = useState(8)

  // Filter and sort
  const filteredActivities = useMemo(() => {
    return activities
      .filter((item) => {
        // Match route filter from global header if set
        if (selectedRouteFilter !== 'all' && item.routeCode !== selectedRouteFilter) {
          return false
        }
        // Match local mode filter
        if (selectedMode !== 'all' && item.mode !== selectedMode) {
          return false
        }
        // Match search query
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase()
          return (
            item.routeCode.toLowerCase().includes(q) ||
            item.routeName.toLowerCase().includes(q) ||
            item.tripId.toLowerCase().includes(q) ||
            item.time.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortField === 'passengers') {
          return sortAsc ? a.passengers - b.passengers : b.passengers - a.passengers
        }
        if (sortField === 'loadFactorPct') {
          return sortAsc ? a.loadFactorPct - b.loadFactorPct : b.loadFactorPct - a.loadFactorPct
        }
        // Default sort by time
        return sortAsc ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time)
      })
  }, [activities, selectedRouteFilter, selectedMode, searchTerm, sortField, sortAsc])

  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice(0, pageSize)
  }, [filteredActivities, pageSize])

  const toggleSort = (field: 'time' | 'passengers' | 'loadFactorPct') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const exportCurrentCsv = () => {
    const headers = 'TripId,RouteCode,RouteName,Date,Time,Passengers,Capacity,LoadFactorPct,Mode,Status\n'
    const rows = filteredActivities
      .map(
        (a) =>
          `${a.tripId},${a.routeCode},"${a.routeName}",${a.date},${a.time},${a.passengers},${a.capacity},${a.loadFactorPct}%,${a.mode},${a.status}`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transit_activity_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  return (
    <Card
      title="Recent Transport Activity & Trip Telemetry"
      subtitle="Granular per-trip passenger counts, vehicle capacity saturation & schedule compliance"
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={exportCurrentCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Table CSV
          </Button>
        </div>
      }
      noPadding
    >
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trip ID, corridor or line..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-600 focus:ring-2 focus:ring-sky-500/15 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Mode:
          </span>
          {(['all', 'metro', 'bus', 'tram', 'rail'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                selectedMode === mode
                  ? 'bg-slate-900 dark:bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-5">Route & Trip ID</th>
              <th className="py-3 px-3">Date</th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none"
                onClick={() => toggleSort('time')}
              >
                <div className="flex items-center gap-1">
                  <span>Time</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none"
                onClick={() => toggleSort('passengers')}
              >
                <div className="flex items-center gap-1">
                  <span>Passengers</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none w-36"
                onClick={() => toggleSort('loadFactorPct')}
              >
                <div className="flex items-center gap-1">
                  <span>Capacity Load</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">Transport Mode</th>
              <th className="py-3 px-4 sm:px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedActivities.length > 0 ? (
              paginatedActivities.map((row) => {
                const modeStyle = modeBadgeStyles[row.mode] || modeBadgeStyles.metro
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectRoute?.(row.routeCode)}
                          className="font-bold text-slate-900 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 text-sm font-sans text-left cursor-pointer transition-colors"
                        >
                          {row.routeCode}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {row.tripId}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs">{row.routeName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-mono font-medium whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {row.passengers.toLocaleString()}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1 font-mono">
                        / {row.capacity} cap
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.loadFactorPct >= 90
                                ? 'bg-rose-500'
                                : row.loadFactorPct >= 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(row.loadFactorPct, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-[11px] text-slate-700 dark:text-slate-300 w-8 text-right">
                          {row.loadFactorPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${modeStyle.light} ${modeStyle.dark}`}
                      >
                        {modeStyle.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-5 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 mb-2">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No matching transport records found
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Try clearing search filters or selecting &ldquo;All Corridors &amp; Lines&rdquo;
                    </p>
                    {(searchTerm || selectedMode !== 'all' || selectedRouteFilter !== 'all') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          setSearchTerm('')
                          setSelectedMode('all')
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{paginatedActivities.length}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredActivities.length}</span> records
        </div>
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 text-xs focus:outline-none cursor-pointer transition-colors"
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={15}>15</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </Card>
  )
}
