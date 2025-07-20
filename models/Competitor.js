const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
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
  industry: String,
  companySize: {
    min: Number,
    max: Number,
    category: String
  },
  revenue: {
    min: Number,
    max: Number,
    currency: String
  },
  foundedYear: Number,
  
  // Competitive Analysis
  competitivePosition: {
    type: String,
    enum: ['leader', 'challenger', 'follower', 'niche'],
    default: 'follower'
  },
  marketShare: Number,
  strengths: [String],
  weaknesses: [String],
  opportunities: [String],
  threats: [String],
  
  // Service Offerings
  services: [{
    name: String,
    description: String,
    pricing: {
      min: Number,
      max: Number,
      currency: String,
      pricingModel: String
    },
    features: [String],
    targetMarket: String
  }],
  
  // Pricing Analysis
  pricingStrategy: {
    type: String,
    enum: ['premium', 'competitive', 'budget', 'freemium'],
    default: 'competitive'
  },
  pricingHistory: [{
    date: Date,
    service: String,
    oldPrice: Number,
    newPrice: Number,
    change: Number,
    changePercent: Number
  }],
  
  // Marketing & Positioning
  marketingMessages: [{
    message: String,
    channel: String,
    date: Date,
    targetAudience: String
  }],
  positioning: {
    primaryMessage: String,
    valueProposition: String,
    targetMarket: String,
    differentiation: String
  },
  
  // Client Information
  clients: [{
    name: String,
    industry: String,
    size: String,
    testimonial: String,
    caseStudy: String,
    relationshipDuration: String
  }],
  
  // Team & Growth
  team: {
    totalEmployees: Number,
    keyPeople: [{
      name: String,
      title: String,
      linkedin: String,
      background: String
    }],
    hiringTrends: [{
      date: Date,
      position: String,
      location: String,
      requirements: [String]
    }]
  },
  
  // Technology & Innovation
  technologyStack: [String],
  recentInnovations: [{
    title: String,
    description: String,
    date: Date,
    impact: String
  }],
  
  // Website & Digital Presence
  websiteChanges: [{
    date: Date,
    changeType: String,
    description: String,
    url: String,
    impact: String
  }],
  socialMedia: {
    linkedin: String,
    facebook: String,
    twitter: String,
    instagram: String,
    followers: {
      linkedin: Number,
      facebook: Number,
      twitter: Number,
      instagram: Number
    }
  },
  
  // News & Press
  newsMentions: [{
    title: String,
    source: String,
    date: Date,
    url: String,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    summary: String
  }],
  
  // Financial Information
  financialData: {
    funding: [{
      round: String,
      amount: Number,
      date: Date,
      investors: [String]
    }],
    acquisitions: [{
      target: String,
      amount: Number,
      date: Date,
      strategicRationale: String
    }],
    partnerships: [{
      partner: String,
      type: String,
      date: Date,
      description: String
    }]
  },
  
  // Threat Level Assessment
  threatLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  threatFactors: [{
    factor: String,
    impact: String,
    probability: Number,
    timeframe: String
  }],
  
  // Monitoring Configuration
  monitoringSettings: {
    websiteMonitoring: { type: Boolean, default: true },
    pricingMonitoring: { type: Boolean, default: true },
    hiringMonitoring: { type: Boolean, default: true },
    newsMonitoring: { type: Boolean, default: true },
    socialMediaMonitoring: { type: Boolean, default: true }
  },
  
  // Data Sources
  dataSources: [{
    name: String,
    url: String,
    lastScraped: Date,
    confidence: Number
  }],
  
  // Notes & Analysis
  notes: String,
  internalAnalysis: String,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'acquired', 'defunct'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMonitored: Date,
  lastUpdated: Date
});

// Indexes for performance
competitorSchema.index({ companyName: 'text', industry: 'text' });
competitorSchema.index({ threatLevel: 1 });
competitorSchema.index({ competitivePosition: 1 });
competitorSchema.index({ 'address.city': 1, 'address.state': 1 });
competitorSchema.index({ createdAt: -1 });

// Update timestamp on save
competitorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Competitor', competitorSchema);