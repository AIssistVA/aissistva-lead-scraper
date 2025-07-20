import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
  }
};

export const getAlerts = async () => {
  try {
    const response = await api.get('/dashboard/alerts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch alerts');
  }
};

export const getRevenueForecast = async (period = '30d') => {
  try {
    const response = await api.get(`/dashboard/revenue-forecast?period=${period}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch revenue forecast');
  }
};

export const getPerformanceMetrics = async () => {
  try {
    const response = await api.get('/dashboard/performance');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch performance metrics');
  }
};

export const getMarketTrends = async () => {
  try {
    const response = await api.get('/dashboard/market-trends');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch market trends');
  }
};

export const getCompetitiveThreats = async () => {
  try {
    const response = await api.get('/dashboard/competitive-threats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch competitive threats');
  }
};

export const getRecentLeads = async (limit = 5) => {
  try {
    const response = await api.get(`/dashboard/recent-leads?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recent leads');
  }
};

// Mock data for development
export const getMockDashboardData = () => {
  return {
    stats: {
      totalLeads: 1247,
      leadsChange: 12.5,
      highPriorityLeads: 89,
      highPriorityChange: 8.2,
      pipelineValue: 2840000,
      pipelineChange: 15.3,
      conversionRate: 23.4,
      conversionChange: 2.1
    },
    alerts: [
      {
        id: 1,
        type: 'high_priority_lead',
        title: 'New High-Priority Lead',
        message: 'TechCorp Solutions has been identified as a high-priority lead with 85% score',
        severity: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: 2,
        type: 'competitor_activity',
        title: 'Competitor Price Change',
        message: 'AutomatePro has updated their pricing strategy',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true
      },
      {
        id: 3,
        type: 'market_opportunity',
        title: 'Market Opportunity Detected',
        message: 'New service gap identified in Kansas City market',
        severity: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: false
      }
    ],
    recentLeads: [
      {
        id: 1,
        companyName: 'TechCorp Solutions',
        industry: 'Technology',
        score: 85,
        status: 'new',
        priority: 'high',
        address: { city: 'Kansas City', state: 'MO' },
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: 2,
        companyName: 'Innovate Marketing',
        industry: 'Marketing',
        score: 72,
        status: 'researching',
        priority: 'medium',
        address: { city: 'Kansas City', state: 'KS' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: 3,
        companyName: 'DataFlow Analytics',
        industry: 'Data Analytics',
        score: 68,
        status: 'contacted',
        priority: 'medium',
        address: { city: 'Overland Park', state: 'KS' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
      }
    ],
    competitiveThreats: [
      {
        id: 1,
        competitor: 'AutomatePro',
        threat: 'Pricing Strategy Update',
        impact: 'high',
        probability: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: 2,
        competitor: 'ProcessFlow',
        threat: 'New Feature Launch',
        impact: 'medium',
        probability: 0.6,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6)
      }
    ],
    marketTrends: [
      {
        id: 1,
        trend: 'Increased Automation Demand',
        direction: 'up',
        change: 15.2,
        period: '30d'
      },
      {
        id: 2,
        trend: 'Service-Based Business Growth',
        direction: 'up',
        change: 8.7,
        period: '30d'
      },
      {
        id: 3,
        trend: 'Technology Adoption Rate',
        direction: 'up',
        change: 12.3,
        period: '30d'
      }
    ],
    revenueForecast: {
      current: 2840000,
      projected: 3200000,
      growth: 12.7,
      data: [
        { month: 'Jan', actual: 180000, projected: 190000 },
        { month: 'Feb', actual: 195000, projected: 200000 },
        { month: 'Mar', actual: 210000, projected: 215000 },
        { month: 'Apr', actual: 225000, projected: 230000 },
        { month: 'May', actual: 240000, projected: 245000 },
        { month: 'Jun', actual: 255000, projected: 260000 }
      ]
    },
    performanceMetrics: {
      leadResponseTime: 2.3,
      conversionRate: 23.4,
      averageDealSize: 45000,
      customerLifetimeValue: 125000,
      data: [
        { metric: 'Lead Response Time', value: 2.3, target: 2.0, unit: 'hours' },
        { metric: 'Conversion Rate', value: 23.4, target: 25.0, unit: '%' },
        { metric: 'Average Deal Size', value: 45000, target: 50000, unit: '$' },
        { metric: 'Customer LTV', value: 125000, target: 150000, unit: '$' }
      ]
    }
  };
};