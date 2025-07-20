const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
  
  // Company Details
  industry: {
    type: String,
    required: true,
    index: true
  },
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
  
  // Lead Scoring
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  scoreBreakdown: {
    automationPotential: { type: Number, default: 0 },
    financialCapacity: { type: Number, default: 0 },
    painPointSeverity: { type: Number, default: 0 },
    timingFactors: { type: Number, default: 0 },
    contactAccessibility: { type: Number, default: 0 },
    engagementProbability: { type: Number, default: 0 }
  },
  
  // Decision Makers
  decisionMakers: [{
    name: String,
    title: String,
    email: String,
    phone: String,
    linkedin: String,
    isPrimary: Boolean
  }],
  
  // Pain Points & Opportunities
  painPoints: [{
    category: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    source: String
  }],
  
  // Recent Activity
  recentActivity: [{
    type: {
      type: String,
      enum: ['hiring', 'expansion', 'funding', 'technology', 'partnership', 'news']
    },
    description: String,
    date: Date,
    source: String,
    url: String
  }],
  
  // Technology Stack
  technologyStack: [{
    category: String,
    tools: [String],
    gaps: [String]
  }],
  
  // Social Media Presence
  socialMedia: {
    linkedin: String,
    facebook: String,
    twitter: String,
    instagram: String,
    lastUpdated: Date
  },
  
  // Engagement History
  engagementHistory: [{
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'proposal', 'follow-up']
    },
    date: Date,
    outcome: String,
    notes: String,
    nextAction: String,
    nextActionDate: Date
  }],
  
  // Data Sources
  dataSources: [{
    name: String,
    url: String,
    lastScraped: Date,
    confidence: Number
  }],
  
  // Status & Pipeline
  status: {
    type: String,
    enum: ['new', 'researching', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
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
  lastEnriched: Date,
  lastScored: Date
});

// Indexes for performance
leadSchema.index({ companyName: 'text', industry: 'text' });
leadSchema.index({ score: -1 });
leadSchema.index({ status: 1, priority: 1 });
leadSchema.index({ 'address.city': 1, 'address.state': 1 });
leadSchema.index({ createdAt: -1 });

// Update timestamp on save
leadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);