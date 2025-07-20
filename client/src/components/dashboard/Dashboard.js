import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Components
import StatsCard from './StatsCard';
import RecentLeads from './RecentLeads';
import CompetitiveThreats from './CompetitiveThreats';
import MarketTrends from './MarketTrends';
import AlertsPanel from './AlertsPanel';
import RevenueForecast from './RevenueForecast';
import PerformanceMetrics from './PerformanceMetrics';

// Hooks
import { useQuery } from 'react-query';
import { useSocket } from '../../hooks/useSocket';

// API
import { getDashboardData } from '../../api/dashboard';

// Utils
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

const Dashboard = () => {
  const { socket } = useSocket();
  const [realTimeData, setRealTimeData] = useState({});

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery(
    'dashboard',
    getDashboardData,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 60000, // Consider data stale after 1 minute
    }
  );

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleDashboardUpdate = (data) => {
      setRealTimeData(data);
      refetch(); // Refetch data when we receive updates
    };

    socket.on('dashboard-update', handleDashboardUpdate);

    return () => {
      socket.off('dashboard-update', handleDashboardUpdate);
    };
  }, [socket, refetch]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const data = dashboardData || {};
  const stats = data.stats || {};
  const alerts = data.alerts || [];
  const recentLeads = data.recentLeads || [];
  const competitiveThreats = data.competitiveThreats || [];
  const marketTrends = data.marketTrends || [];

  return (
    <>
      <Helmet>
        <title>Dashboard - Market Intelligence Platform</title>
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your market intelligence.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live</span>
            </div>
            <button
              onClick={() => refetch()}
              className="btn-secondary"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stats-grid"
        >
          <StatsCard
            title="Total Leads"
            value={formatNumber(stats.totalLeads || 0)}
            change={stats.leadsChange || 0}
            changeType={stats.leadsChange >= 0 ? 'positive' : 'negative'}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="High Priority Leads"
            value={formatNumber(stats.highPriorityLeads || 0)}
            change={stats.highPriorityChange || 0}
            changeType={stats.highPriorityChange >= 0 ? 'positive' : 'negative'}
            icon={Target}
            color="red"
          />
          <StatsCard
            title="Pipeline Value"
            value={formatCurrency(stats.pipelineValue || 0)}
            change={stats.pipelineChange || 0}
            changeType={stats.pipelineChange >= 0 ? 'positive' : 'negative'}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Conversion Rate"
            value={formatPercentage(stats.conversionRate || 0)}
            change={stats.conversionChange || 0}
            changeType={stats.conversionChange >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
            color="purple"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RevenueForecast data={data.revenueForecast} />
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PerformanceMetrics data={data.performanceMetrics} />
            </motion.div>

            {/* Market Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <MarketTrends data={marketTrends} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AlertsPanel alerts={alerts} />
            </motion.div>

            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecentLeads leads={recentLeads} />
            </motion.div>

            {/* Competitive Threats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CompetitiveThreats threats={competitiveThreats} />
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <span className="font-medium">Add New Lead</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="h-6 w-6 text-green-600 mr-3" />
                <span className="font-medium">Research Prospect</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
                <span className="font-medium">Run Analysis</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Zap className="h-6 w-6 text-yellow-600 mr-3" />
                <span className="font-medium">Generate Report</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;