const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['lead-opportunity', 'competitive-gap', 'pricing-arbitrage', 'client-poaching', 'market-expansion', 'timing-window'],
    required: true
  },
  
  // Associated Entities
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  competitorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competitor'
  }],
  prospectIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prospect'
  }],
  
  // Opportunity Scoring
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  scoreBreakdown: {
    revenuePotential: { type: Number, default: 0 },
    winProbability: { type: Number, default: 0 },
    timingUrgency: { type: Number, default: 0 },
    strategicValue: { type: Number, default: 0 }
  },
  
  // Financial Impact
  estimatedRevenue: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  dealSize: {
    type: String,
    enum: ['small', 'medium', 'large', 'enterprise']
  },
  
  // Market Context
  marketSegment: String,
  geographicScope: {
    type: String,
    enum: ['local', 'regional', 'national', 'international']
  },
  industryFocus: [String],
  
  // Competitive Analysis
  competitiveAdvantage: {
    description: String,
    factors: [String],
    sustainability: {
      type: String,
      enum: ['temporary', 'sustainable', 'long-term']
    }
  },
  competitiveWeaknesses: [{
    competitor: String,
    weakness: String,
    impact: String,
    exploitability: Number
  }],
  
  // Timing & Urgency
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  timeWindow: {
    start: Date,
    end: Date,
    optimal: Date
  },
  triggerEvents: [{
    event: String,
    date: Date,
    impact: String
  }],
  
  // Action Plan
  actionPlan: {
    steps: [{
      step: String,
      description: String,
      assignedTo: String,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'blocked']
      }
    }],
    timeline: {
      start: Date,
      end: Date,
      milestones: [{
        milestone: String,
        date: Date,
        status: String
      }]
    }
  },
  
  // Risk Assessment
  risks: [{
    risk: String,
    probability: Number,
    impact: String,
    mitigation: String
  }],
  
  // Success Metrics
  successMetrics: [{
    metric: String,
    target: Number,
    current: Number,
    unit: String
  }],
  
  // Data Sources & Intelligence
  intelligenceSources: [{
    source: String,
    data: String,
    confidence: Number,
    date: Date
  }],
  
  // Cross-References
  relatedOpportunities: [{
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    },
    relationship: String
  }],
  
  // Status & Progress
  status: {
    type: String,
    enum: ['identified', 'analyzing', 'planning', 'executing', 'monitoring', 'closed', 'lost'],
    default: 'identified'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Progress Tracking
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    stage: String,
    lastUpdate: Date,
    nextMilestone: String
  },
  
  // Stakeholders
  stakeholders: [{
    name: String,
    role: String,
    email: String,
    phone: String,
    involvement: String
  }],
  
  // Notes & Documentation
  notes: String,
  internalNotes: String,
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  
  // Tags & Categories
  tags: [String],
  categories: [String],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastAnalyzed: Date,
  lastUpdated: Date
});

// Indexes for performance
opportunitySchema.index({ title: 'text', description: 'text' });
opportunitySchema.index({ score: -1 });
opportunitySchema.index({ status: 1, priority: 1 });
opportunitySchema.index({ type: 1 });
opportunitySchema.index({ urgency: 1 });
opportunitySchema.index({ createdAt: -1 });

// Update timestamp on save
opportunitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Opportunity', opportunitySchema);