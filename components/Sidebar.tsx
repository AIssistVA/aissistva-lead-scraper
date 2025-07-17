'use client'

import { 
  BarChart3, 
  Users, 
  Search, 
  TrendingUp, 
  Download,
  Settings,
  Zap
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'scraping', label: 'Scraping', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'export', label: 'Export', icon: Download },
  ]

  return (
    <div className="w-64 bg-secondary-800 border-r border-secondary-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AIssistVA</h1>
            <p className="text-xs text-secondary-400">Lead Generation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-secondary-700">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-secondary-300 hover:bg-secondary-700 hover:text-white transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  )
}