'use client'

import { useState } from 'react'
import { Search, Play, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ScrapingPanel() {
  const [isScraping, setIsScraping] = useState(false)
  const [scrapingConfig, setScrapingConfig] = useState({
    location: 'Kansas City, MO',
    industry: 'Professional Services',
    sources: ['google', 'yelp'],
    maxResults: 50
  })

  const industries = [
    'Professional Services',
    'Healthcare',
    'Real Estate',
    'Marketing Agencies',
    'Legal Services',
    'Financial Services',
    'Technology',
    'Manufacturing',
    'Retail',
    'Restaurants'
  ]

  const sources = [
    { id: 'google', label: 'Google Business', icon: '🔍' },
    { id: 'yelp', label: 'Yelp', icon: '⭐' },
    { id: 'yellowpages', label: 'Yellow Pages', icon: '📞' }
  ]

  const handleStartScraping = async () => {
    if (!scrapingConfig.location || !scrapingConfig.industry) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsScraping(true)
    toast.loading('Starting scraping job...')

    try {
      const response = await fetch('/api/scraping/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scrapingConfig),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Found ${data.totalFound} leads! ${data.enrichedResults} qualified with AI.`)
      } else {
        toast.error('Scraping failed: ' + data.error)
      }
    } catch (error) {
      toast.error('Failed to start scraping job')
      console.error('Scraping error:', error)
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Web Scraping</h2>
            <p className="text-secondary-400">Find and qualify new leads automatically</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={scrapingConfig.location}
              onChange={(e) => setScrapingConfig({ ...scrapingConfig, location: e.target.value })}
              placeholder="e.g., Kansas City, MO"
              className="input-field w-full"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Industry *
            </label>
            <select
              value={scrapingConfig.industry}
              onChange={(e) => setScrapingConfig({ ...scrapingConfig, industry: e.target.value })}
              className="input-field w-full"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Data Sources
            </label>
            <div className="space-y-2">
              {sources.map((source) => (
                <label key={source.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={scrapingConfig.sources.includes(source.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setScrapingConfig({
                          ...scrapingConfig,
                          sources: [...scrapingConfig.sources, source.id]
                        })
                      } else {
                        setScrapingConfig({
                          ...scrapingConfig,
                          sources: scrapingConfig.sources.filter(s => s !== source.id)
                        })
                      }
                    }}
                    className="w-4 h-4 text-primary-600 bg-secondary-700 border-secondary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-secondary-300">{source.icon} {source.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Max Results */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Max Results
            </label>
            <input
              type="number"
              value={scrapingConfig.maxResults}
              onChange={(e) => setScrapingConfig({ ...scrapingConfig, maxResults: parseInt(e.target.value) })}
              min="10"
              max="100"
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={handleStartScraping}
            disabled={isScraping}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScraping ? (
              <>
                <div className="spinner"></div>
                <span>Scraping...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Scraping</span>
              </>
            )}
          </button>

          <button className="btn-outline flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Advanced Settings</span>
          </button>
        </div>
      </div>

      {/* Status Panel */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Scraping Status</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-secondary-700 rounded-lg">
            <CheckCircle className="w-5 h-5 text-success-500" />
            <div className="flex-1">
              <p className="text-white font-medium">Last Job Completed</p>
              <p className="text-secondary-400 text-sm">Found 25 leads, 18 qualified with AI</p>
            </div>
            <span className="text-secondary-400 text-sm">2 hours ago</span>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-secondary-700 rounded-lg">
            <Clock className="w-5 h-5 text-warning-500" />
            <div className="flex-1">
              <p className="text-white font-medium">Scheduled Job</p>
              <p className="text-secondary-400 text-sm">Healthcare in Kansas City - Tomorrow 9:00 AM</p>
            </div>
            <span className="text-secondary-400 text-sm">Scheduled</span>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-secondary-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-danger-500" />
            <div className="flex-1">
              <p className="text-white font-medium">Failed Job</p>
              <p className="text-secondary-400 text-sm">Real Estate in Overland Park - Rate limit exceeded</p>
            </div>
            <span className="text-secondary-400 text-sm">1 day ago</span>
          </div>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-warning-500 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-2">Compliance & Ethics</h4>
            <p className="text-secondary-400 text-sm mb-3">
              Our scraping system respects robots.txt files and implements rate limiting to avoid overwhelming servers. 
              We only collect publicly available information and provide opt-out mechanisms for businesses.
            </p>
            <div className="flex space-x-4 text-xs text-secondary-500">
              <span>✓ Rate Limited</span>
              <span>✓ Robots.txt Compliant</span>
              <span>✓ GDPR Compliant</span>
              <span>✓ Opt-out Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}