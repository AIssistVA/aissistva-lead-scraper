'use client'

import { Users, Target, TrendingUp, Star } from 'lucide-react'

interface MetricsProps {
  metrics: {
    totalLeads: number
    highQualityLeads: number
    newLeads: number
    averageScore: number
  }
  loading: boolean
}

export default function DashboardMetrics({ metrics, loading }: MetricsProps) {
  const metricCards = [
    {
      title: 'Total Leads',
      value: metrics.totalLeads,
      icon: Users,
      color: 'bg-primary-500',
      bgGradient: 'from-primary-500 to-primary-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'High Quality Leads',
      value: metrics.highQualityLeads,
      icon: Star,
      color: 'bg-success-500',
      bgGradient: 'from-success-500 to-success-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'New Leads',
      value: metrics.newLeads,
      icon: Target,
      color: 'bg-warning-500',
      bgGradient: 'from-warning-500 to-warning-600',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Average Score',
      value: metrics.averageScore.toFixed(1),
      icon: TrendingUp,
      color: 'bg-secondary-500',
      bgGradient: 'from-secondary-500 to-secondary-600',
      change: '+0.3',
      changeType: 'positive'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-secondary-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary-700 rounded-lg"></div>
              <div className="w-16 h-4 bg-secondary-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-6 bg-secondary-700 rounded"></div>
              <div className="w-32 h-8 bg-secondary-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-secondary-800 rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${card.bgGradient} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                card.changeType === 'positive' ? 'text-success-400' : 'text-danger-400'
              }`}>
                {card.change}
              </span>
            </div>
            <div>
              <h3 className="text-secondary-400 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-white">
                {card.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}