'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Download,
  Settings,
  Plus,
  Filter,
  RefreshCw
} from 'lucide-react'
import DashboardMetrics from '@/components/DashboardMetrics'
import LeadsTable from '@/components/LeadsTable'
import ScrapingPanel from '@/components/ScrapingPanel'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    highQualityLeads: 0,
    newLeads: 0,
    averageScore: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/overview')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'scraping', label: 'Scraping', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'export', label: 'Export', icon: Download },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardMetrics metrics={metrics} loading={loading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsCharts />
              <div className="bg-secondary-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-sm">New lead added: ABC Company</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-sm">Scraping job completed: 25 leads found</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
                    <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    <span className="text-sm">Lead qualified: XYZ Corp (Score: 8/10)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'leads':
        return <LeadsTable />
      case 'scraping':
        return <ScrapingPanel />
      case 'analytics':
        return <AnalyticsCharts />
      case 'export':
        return (
          <div className="bg-secondary-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Export Leads</h2>
            <p className="text-secondary-300 mb-6">
              Export your qualified leads to CSV format for use in your CRM or sales tools.
            </p>
            {/* Export functionality will be implemented here */}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-secondary-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onRefresh={fetchMetrics} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}