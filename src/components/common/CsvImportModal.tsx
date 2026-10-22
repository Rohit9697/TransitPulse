import React, { useState } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Download } from 'lucide-react'
import { Button } from './Button'
import type { TransportActivity, TransportMode, ServiceStatus } from '../../types/transit'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportActivities: (activities: TransportActivity[]) => void
}

const SAMPLE_CSV_CONTENT = `RouteCode,RouteName,Date,Time,Passengers,Capacity,Mode,Status
M1-Red,Central Express,2026-10-19,09:15 AM,890,900,metro,congested
B42,Harbor Tech Corridor,2026-10-19,09:12 AM,115,120,bus,congested
M3-Teal,University Beltway,2026-10-19,09:05 AM,610,850,metro,optimal
CR-South,Southern Regional,2026-10-19,09:00 AM,1180,1250,rail,delayed
T12,Riverside Loop,2026-10-19,08:50 AM,160,220,tram,optimal`

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportActivities
}) => {
  const [parsedRows, setParsedRows] = useState<TransportActivity[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState<number | null>(null)

  if (!isOpen) return null

  const parseCsv = (text: string) => {
    setErrorMessage(null)
    setSuccessCount(null)

    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      setErrorMessage('CSV file must include a header and at least one data row.')
      setParsedRows([])
      return
    }

    const rows: TransportActivity[] = []
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const parts = line.split(',').map((p) => p.trim())
      if (parts.length >= 7) {
        const [routeCode, routeName, date, time, passengersStr, capacityStr, modeStr, statusStr] = parts
        const passengers = parseInt(passengersStr, 10) || 0
        const capacity = parseInt(capacityStr, 10) || 100
        const loadFactorPct = Math.round((passengers / capacity) * 1000) / 10

        rows.push({
          id: `imp-${Date.now()}-${i}`,
          tripId: `TRIP-IMP-${1000 + i}`,
          routeId: routeCode.toLowerCase(),
          routeCode,
          routeName: routeName || routeCode,
          origin: 'Imported Origin',
          destination: 'Imported Terminus',
          date,
          time,
          passengers,
          tripCount: 1,
          capacity,
          loadFactorPct,
          mode: (['metro', 'bus', 'tram', 'rail'].includes(modeStr?.toLowerCase())
            ? modeStr.toLowerCase()
            : 'bus') as TransportMode,
          status: (['optimal', 'moderate', 'congested', 'delayed', 'maintenance'].includes(
            statusStr?.toLowerCase()
          )
            ? statusStr.toLowerCase()
            : 'optimal') as ServiceStatus,
          isSynthetic: true
        })
      }
    }

    if (rows.length === 0) {
      setErrorMessage('Could not parse valid transport activity records from the provided CSV.')
    } else {
      setParsedRows(rows)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      parseCsv(text)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = () => {
    parseCsv(SAMPLE_CSV_CONTENT)
  }

  const handleConfirmImport = () => {
    if (parsedRows.length > 0) {
      onImportActivities(parsedRows)
      setSuccessCount(parsedRows.length)
      setTimeout(() => {
        onClose()
      }, 1200)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 rounded-lg border border-sky-200 text-sky-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Transport Telemetry CSV</h3>
              <p className="text-xs text-slate-500">Ingest passenger trip records and route loads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <UploadCloud className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              Select a CSV file or drop it here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Expected headers: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">RouteCode, RouteName, Date, Time, Passengers, Capacity, Mode, Status</code>
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-xs transition-colors">
                <FileText className="w-3.5 h-3.5" />
                Browse File
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                icon={<Download className="w-3.5 h-3.5 text-slate-500" />}
              >
                Load Sample Feed
              </Button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Successfully imported {successCount} trip records into dashboard!</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Parsed Records ({parsedRows.length})
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">Ready to sync</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Route</th>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3 text-right">Passengers</th>
                      <th className="py-2 px-3">Mode</th>
                      <th className="py-2 px-3 text-right">Load</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 font-mono text-[11px]">
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{r.routeCode}</td>
                        <td className="py-1.5 px-3 text-slate-600">{r.time}</td>
                        <td className="py-1.5 px-3 text-right text-slate-800">{r.passengers}</td>
                        <td className="py-1.5 px-3 uppercase text-[10px] text-slate-500">{r.mode}</td>
                        <td className="py-1.5 px-3 text-right font-semibold text-sky-600">{r.loadFactorPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={parsedRows.length === 0 || successCount !== null}
            onClick={handleConfirmImport}
          >
            Import {parsedRows.length > 0 ? `(${parsedRows.length}) Records` : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
