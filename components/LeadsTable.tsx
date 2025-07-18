'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Star, 
  Mail, 
  Phone,
  ExternalLink,
  Edit,
  Trash2,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Lead {
  id: number
  company_name: string
  website: string
  phone: string
  email: string
  city: string
  state: string
  industry: string
  lead_score: number
  status: string
  source: string
  scraped_at: string
  pain_points: string
  automation_opportunities: string
}

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    industry: '',
    status: '',
    minScore: '',
    maxScore: '',
    city: ''
  })
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])

  useEffect(() => {
    fetchLeads()
  }, [filters])

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success-500'
    if (score >= 6) return 'text-warning-500'
    return 'text-danger-500'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-secondary-500'
      case 'contacted': return 'bg-warning-500'
      case 'qualified': return 'bg-success-500'
      case 'converted': return 'bg-primary-500'
      default: return 'bg-secondary-500'
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads first')
      return
    }

    try {
      const response = await fetch('/api/leads/bulk/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selectedLeads,
          updates: { status: action }
        })
      })

      if (response.ok) {
        toast.success(`Updated ${selectedLeads.length} leads`)
        setSelectedLeads([])
        fetchLeads()
      }
    } catch (error) {
      toast.error('Failed to update leads')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Exported ${data.recordCount} leads`)
      }
    } catch (error) {
      toast.error('Failed to export leads')
    }
  }

  if (loading) {
    return (
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-secondary-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Leads Database</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="btn-outline flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <input
            type="text"
            placeholder="Industry"
            value={filters.industry}
            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            className="input-field"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
          </select>
          <input
            type="number"
            placeholder="Min Score"
            value={filters.minScore}
            onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max Score"
            value={filters.maxScore}
            onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="flex items-center space-x-3 p-4 bg-secondary-700 rounded-lg">
            <span className="text-white">{selectedLeads.length} leads selected</span>
            <button
              onClick={() => handleBulkAction('contacted')}
              className="btn-warning text-sm"
            >
              Mark Contacted
            </button>
            <button
              onClick={() => handleBulkAction('qualified')}
              className="btn-success text-sm"
            >
              Mark Qualified
            </button>
            <button
              onClick={() => setSelectedLeads([])}
              className="btn-outline text-sm"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-secondary-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="table-cell">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(leads.map(lead => lead.id))
                      } else {
                        setSelectedLeads([])
                      }
                    }}
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    className="w-4 h-4 text-primary-600 bg-secondary-700 border-secondary-600 rounded"
                  />
                </th>
                <th className="table-cell">Company</th>
                <th className="table-cell">Location</th>
                <th className="table-cell">Industry</th>
                <th className="table-cell">Score</th>
                <th className="table-cell">Status</th>
                <th className="table-cell">Source</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="table-row">
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads([...selectedLeads, lead.id])
                        } else {
                          setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 bg-secondary-700 border-secondary-600 rounded"
                    />
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-white">{lead.company_name}</div>
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary-400 text-sm hover:text-primary-400 flex items-center space-x-1"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-secondary-300">
                      {lead.city}, {lead.state}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-secondary-300">{lead.industry}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Star className={`w-4 h-4 ${getScoreColor(lead.lead_score)}`} />
                      <span className={`font-medium ${getScoreColor(lead.lead_score)}`}>
                        {lead.lead_score}/10
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-secondary-400 text-sm">{lead.source}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-secondary-400 hover:text-primary-400">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-secondary-400 hover:text-primary-400">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-secondary-400 hover:text-primary-400">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-secondary-400 hover:text-danger-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-secondary-400 mb-4">No leads found</div>
            <button className="btn-primary">Start Scraping</button>
          </div>
        )}
      </div>
    </div>
  )
}