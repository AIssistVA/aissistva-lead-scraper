const mongoose = require('mongoose');

const prospectSchema = new mongoose.Schema({
  // Basic Information
  companyName: {
    type: String,
    required: true,
    index: true
  },
  website: String,
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Company Profile
  industry: {
    type: String,
    required: true,
    index: true
  },
  subIndustry: String,
  companySize: {
    min: Number,
    max: Number,
    category: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    }
  },
  revenue: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  foundedYear: Number,
  ownership: {
    type: String,
    enum: ['private', 'public', 'nonprofit', 'government']
  },
  
  // Business Intelligence
  businessModel: String,
  targetMarket: String,
  valueProposition: String,
  competitiveAdvantages: [String],
  challenges: [String],
  
  // Financial Health
  financialHealth: {
    rating: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    indicators: [{
      indicator: String,
      value: String,
      trend: String
    }],
    creditScore: Number,
    paymentHistory: String
  },
  
  // Growth Indicators
  growthIndicators: [{
    indicator: String,
    value: String,
    trend: String,
    date: Date
  }],
  
  // Decision Makers & Contacts
  decisionMakers: [{
    name: String,
    title: String,
    email: String,
    phone: String,
    linkedin: String,
    isPrimary: Boolean,
    influence: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    contactHistory: [{
      date: Date,
      method: String,
      outcome: String,
      notes: String
    }]
  }],
  
  // Pain Points & Needs
  painPoints: [{
    category: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    impact: String,
    source: String,
    dateIdentified: Date
  }],
  
  // Technology Assessment
  technologyStack: {
    current: [{
      category: String,
      tools: [String],
      status: String
    }],
    gaps: [{
      category: String,
      gap: String,
      impact: String,
      priority: Number
    }],
    automationPotential: {
      score: Number,
      areas: [String],
      barriers: [String]
    }
  },
  
  // Recent Activity & Changes
  recentActivity: [{
    type: {
      type: String,
      enum: ['hiring', 'expansion', 'funding', 'technology', 'partnership', 'news', 'restructuring']
    },
    description: String,
    date: Date,
    source: String,
    url: String,
    impact: String
  }],
  
  // Social Media & Online Presence
  socialMedia: {
    linkedin: {
      url: String,
      followers: Number,
      lastActivity: Date,
      content: [{
        type: String,
        date: Date,
        engagement: Number
      }]
    },
    facebook: {
      url: String,
      followers: Number,
      lastActivity: Date
    },
    twitter: {
      url: String,
      followers: Number,
      lastActivity: Date
    },
    instagram: {
      url: String,
      followers: Number,
      lastActivity: Date
    }
  },
  
  // News & Press Coverage
  newsMentions: [{
    title: String,
    source: String,
    date: Date,
    url: String,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    summary: String,
    relevance: Number
  }],
  
  // Competitive Landscape
  competitors: [{
    name: String,
    relationship: String,
    competitivePosition: String,
    strengths: [String],
    weaknesses: [String]
  }],
  
  // Engagement History
  engagementHistory: [{
    date: Date,
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'proposal', 'follow-up', 'social']
    },
    outcome: String,
    notes: String,
    nextAction: String,
    nextActionDate: Date,
    assignedTo: String
  }],
  
  // Outreach Recommendations
  outreachRecommendations: [{
    type: String,
    message: String,
    timing: String,
    channel: String,
    priority: Number
  }],
  
  // Data Sources & Confidence
  dataSources: [{
    name: String,
    url: String,
    lastScraped: Date,
    confidence: Number,
    dataQuality: String
  }],
  
  // Scoring & Prioritization
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status & Pipeline
  status: {
    type: String,
    enum: ['researching', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    default: 'researching'
  },
  
  // Tags & Categories
  tags: [String],
  categories: [String],
  
  // Notes & Internal Data
  notes: String,
  internalNotes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastResearched: Date,
  lastContacted: Date
});

// Indexes for performance
prospectSchema.index({ companyName: 'text', industry: 'text' });
prospectSchema.index({ score: -1 });
prospectSchema.index({ status: 1, priority: 1 });
prospectSchema.index({ 'address.city': 1, 'address.state': 1 });
prospectSchema.index({ createdAt: -1 });

// Update timestamp on save
prospectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Prospect', prospectSchema);