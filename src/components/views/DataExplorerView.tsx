import React from 'react'
import { ActivityTable } from '../dashboard/ActivityTable'
import { Button } from '../common/Button'
import { Database, ArrowLeft, UploadCloud } from 'lucide-react'
import type { TransportActivity } from '../../types/transit'

interface DataExplorerViewProps {
  activities: TransportActivity[]
  selectedRoute: string
  onSelectRoute: (routeId: string) => void
  onBackToOverview: () => void
  onOpenCsvImport: () => void
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  activities,
  selectedRoute,
  onSelectRoute,
  onBackToOverview,
  onOpenCsvImport
}) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Transport Telemetry Data Explorer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect raw vehicle dispatches, passenger boarding records, and schedule compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCsvImport}
            icon={<UploadCloud className="w-3.5 h-3.5 text-sky-600" />}
          >
            Import CSV
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onBackToOverview}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Overview
          </Button>
        </div>
      </div>

      {/* Main Activity Table */}
      <ActivityTable
        activities={activities}
        selectedRouteFilter={selectedRoute}
        onSelectRoute={onSelectRoute}
      />
    </div>
  )
}
