'use client'

import { useState } from 'react'
import { 
  Search, 
  Bell, 
  User, 
  RefreshCw,
  Plus,
  Filter
} from 'lucide-react'

interface HeaderProps {
  onRefresh: () => void
}

export default function Header({ onRefresh }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-secondary-800 border-b border-secondary-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search leads, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onRefresh}
            className="p-2 text-secondary-300 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors duration-200"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>

          <button className="p-2 text-secondary-300 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors duration-200 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button className="flex items-center space-x-2 p-2 text-secondary-300 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors duration-200">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}