'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

export default function AnalyticsCharts() {
  const [chartData, setChartData] = useState({
    industryData: [],
    locationData: [],
    scoreDistribution: [],
    timeSeriesData: [],
    conversionData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const [industryRes, locationRes, scoreRes, timeRes, conversionRes] = await Promise.all([
        fetch('/api/analytics/by-industry'),
        fetch('/api/analytics/by-location'),
        fetch('/api/analytics/score-distribution'),
        fetch('/api/analytics/over-time'),
        fetch('/api/analytics/conversions')
      ])

      const [industryData, locationData, scoreData, timeData, conversionData] = await Promise.all([
        industryRes.json(),
        locationRes.json(),
        scoreRes.json(),
        timeRes.json(),
        conversionRes.json()
      ])

      setChartData({
        industryData,
        locationData,
        scoreDistribution: scoreData,
        timeSeriesData: timeData,
        conversionData
      })
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  if (loading) {
    return (
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-700 rounded w-1/3"></div>
          <div className="h-64 bg-secondary-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lead Score Distribution */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Score Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData.scoreDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.scoreDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leads by Industry */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Leads by Industry</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.industryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="industry" 
              stroke="#94a3b8"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leads Over Time */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Leads Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.conversionData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
            <YAxis 
              dataKey="status" 
              type="category" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-secondary-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
          <div className="space-y-3">
            {chartData.locationData.slice(0, 5).map((location, index) => (
              <div key={location.city} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-secondary-300">{location.city}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{location.count}</div>
                  <div className="text-secondary-400 text-sm">Avg: {location.avg_score?.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary-300">Total Leads</span>
              <span className="text-white font-medium">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-300">Avg Response Time</span>
              <span className="text-white font-medium">2.3 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-300">Conversion Rate</span>
              <span className="text-success-400 font-medium">12.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-300">Revenue Generated</span>
              <span className="text-white font-medium">$45,230</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}