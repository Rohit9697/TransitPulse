import { useState, useEffect, useMemo } from 'react'
import { AppShell } from './components/layout/AppShell'
import { DashboardView } from './components/views/DashboardView'
import { RouteAnalysisView } from './components/views/RouteAnalysisView'
import { PeakHoursView } from './components/views/PeakHoursView'
import { DataExplorerView } from './components/views/DataExplorerView'
import { CsvImportModal } from './components/common/CsvImportModal'
import { CENTRALIZED_SYNTHETIC_DATASET } from './data/mockData'
import type { NavTabId, TimeRange, TransitTripRecord } from './types/transit'

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [selectedRoute, setSelectedRoute] = useState<string>('all')
  const [isDark, setIsDark] = useState<boolean>(false)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false)
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now')
  const [records, setRecords] = useState<TransitTripRecord[]>(CENTRALIZED_SYNTHETIC_DATASET)

  // Sync dark class on html tag when theme state changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const handleRefresh = () => {
    const now = new Date()
    const formatted = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setLastRefreshed(formatted)
  }

  const handleImportActivities = (newActivities: TransitTripRecord[]) => {
    setRecords((prev) => [...newActivities, ...prev])
  }

  // Determine if any filters are active (non-default)
  const hasActiveFilters = useMemo(
    () => selectedRoute !== 'all' || timeRange !== '30d',
    [selectedRoute, timeRange]
  )

  const handleResetFilters = () => {
    setSelectedRoute('all')
    setTimeRange('30d')
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenCsvImport={() => setIsCsvModalOpen(true)}
        lastRefreshedText={lastRefreshed}
        onRefresh={handleRefresh}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      >
        {activeTab === 'overview' && (
          <DashboardView
            timeRange={timeRange}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            records={records}
          />
        )}

        {activeTab === 'routes' && (
          <RouteAnalysisView
            records={records}
            onBackToOverview={() => setActiveTab('overview')}
            onSelectRoute={setSelectedRoute}
          />
        )}

        {activeTab === 'peak-hours' && (
          <PeakHoursView
            records={records}
            onBackToOverview={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'explorer' && (
          <DataExplorerView
            activities={records}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            onBackToOverview={() => setActiveTab('overview')}
            onOpenCsvImport={() => setIsCsvModalOpen(true)}
          />
        )}
      </AppShell>

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportActivities={handleImportActivities}
      />
    </>
  )
}

export default App
