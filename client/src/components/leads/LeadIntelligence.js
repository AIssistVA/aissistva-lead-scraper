import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users,
  Filter,
  Search,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Building,
  DollarSign
} from 'lucide-react';

// Components
import LeadTable from './LeadTable';
import LeadFilters from './LeadFilters';
import LeadDetails from './LeadDetails';
import LeadForm from './LeadForm';
import LeadStats from './LeadStats';
import LeadScoringBreakdown from './LeadScoringBreakdown';

// Hooks
import { useQuery, useMutation, useQueryClient } from 'react-query';

// API
import { getLeads, deleteLead, updateLead } from '../../api/leads';

// Utils
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const LeadIntelligence = () => {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    score: '',
    industry: '',
    location: '',
    companySize: '',
    tags: []
  });

  // Fetch leads
  const { data: leadsData, isLoading, error, refetch } = useQuery(
    ['leads', filters],
    () => getLeads(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  // Delete lead mutation
  const deleteLeadMutation = useMutation(deleteLead, {
    onSuccess: () => {
      queryClient.invalidateQueries('leads');
      queryClient.invalidateQueries('dashboard');
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation(updateLead, {
    onSuccess: () => {
      queryClient.invalidateQueries('leads');
      queryClient.invalidateQueries('dashboard');
      setSelectedLead(null);
    },
  });

  const leads = leadsData?.leads || [];
  const stats = leadsData?.stats || {};

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.companyName?.toLowerCase().includes(searchLower) ||
        lead.industry?.toLowerCase().includes(searchLower) ||
        lead.address?.city?.toLowerCase().includes(searchLower) ||
        lead.decisionMakers?.some(dm => 
          dm.name?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply other filters
    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(lead => lead.priority === filters.priority);
    }
    if (filters.industry) {
      filtered = filtered.filter(lead => lead.industry === filters.industry);
    }
    if (filters.location) {
      filtered = filtered.filter(lead => 
        lead.address?.city?.includes(filters.location) ||
        lead.address?.state?.includes(filters.location)
      );
    }
    if (filters.companySize) {
      filtered = filtered.filter(lead => lead.companySize?.category === filters.companySize);
    }
    if (filters.tags.length > 0) {
      filtered = filtered.filter(lead => 
        filters.tags.some(tag => lead.tags?.includes(tag))
      );
    }

    // Apply score filter
    if (filters.score) {
      const [min, max] = filters.score.split('-').map(Number);
      filtered = filtered.filter(lead => {
        const score = lead.score || 0;
        return score >= min && score <= max;
      });
    }

    // Sort by score (highest first)
    return filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [leads, filters]);

  const handleDeleteLead = (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLeadMutation.mutate(leadId);
    }
  };

  const handleUpdateLead = (leadData) => {
    updateLeadMutation.mutate(leadData);
  };

  const handleExportLeads = () => {
    // Implementation for exporting leads to CSV
    const csvContent = generateCSV(filteredLeads);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (leads) => {
    const headers = [
      'Company Name',
      'Industry',
      'Score',
      'Status',
      'Priority',
      'Location',
      'Company Size',
      'Revenue',
      'Website',
      'Phone',
      'Email'
    ];

    const rows = leads.map(lead => [
      lead.companyName,
      lead.industry,
      lead.score,
      lead.status,
      lead.priority,
      `${lead.address?.city || ''}, ${lead.address?.state || ''}`,
      lead.companySize?.category,
      `${lead.revenue?.min ? formatCurrency(lead.revenue.min) : ''} - ${lead.revenue?.max ? formatCurrency(lead.revenue.max) : ''}`,
      lead.website,
      lead.phone,
      lead.email
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading leads</h3>
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

  return (
    <>
      <Helmet>
        <title>Lead Intelligence - Market Intelligence Platform</title>
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Intelligence</h1>
            <p className="text-gray-600 mt-1">
              Discover, score, and manage high-potential leads with AI-powered insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="btn-secondary"
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", { "animate-spin": isLoading })} />
              Refresh
            </button>
            <button
              onClick={handleExportLeads}
              className="btn-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowLeadForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LeadStats stats={stats} />
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="input pl-10"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "btn-secondary",
                    showFilters && "bg-primary-50 border-primary-200 text-primary-700"
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true)) && (
                    <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                      {Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length}
                    </span>
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {filteredLeads.length} of {leads.length} leads
              </div>
            </div>

            {showFilters && (
              <LeadFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Leads Table */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LeadTable
                leads={filteredLeads}
                isLoading={isLoading}
                onSelectLead={setSelectedLead}
                onDeleteLead={handleDeleteLead}
                onUpdateLead={handleUpdateLead}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Lead Details */}
            {selectedLead && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card"
              >
                <LeadDetails
                  lead={selectedLead}
                  onClose={() => setSelectedLead(null)}
                  onUpdate={handleUpdateLead}
                />
              </motion.div>
            )}

            {/* Lead Scoring Breakdown */}
            {selectedLead && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <LeadScoringBreakdown lead={selectedLead} />
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body space-y-3">
                <button className="w-full btn-secondary justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Research Selected
                </button>
                <button className="w-full btn-secondary justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Scores
                </button>
                <button className="w-full btn-secondary justify-start">
                  <Building className="h-4 w-4 mr-2" />
                  Enrich Data
                </button>
                <button className="w-full btn-secondary justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Geographic Analysis
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Lead Form Modal */}
        {showLeadForm && (
          <LeadForm
            onClose={() => setShowLeadForm(false)}
            onSubmit={(data) => {
              // Handle form submission
              console.log('New lead data:', data);
              setShowLeadForm(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default LeadIntelligence;