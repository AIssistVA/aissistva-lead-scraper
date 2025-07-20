const Lead = require('../models/Lead');
const Prospect = require('../models/Prospect');
const logger = require('../utils/logger');

class LeadScoringService {
  constructor() {
    this.scoringWeights = {
      automationPotential: 0.25,
      financialCapacity: 0.20,
      painPointSeverity: 0.20,
      timingFactors: 0.15,
      contactAccessibility: 0.10,
      engagementProbability: 0.10
    };
  }

  async updateAllScores() {
    try {
      const leads = await Lead.find({});
      logger.info(`Updating scores for ${leads.length} leads`);

      for (const lead of leads) {
        try {
          await this.calculateLeadScore(lead);
          await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        } catch (error) {
          logger.error(`Failed to score lead ${lead.companyName}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in updateAllScores:', error);
    }
  }

  async calculateLeadScore(lead) {
    try {
      const scoreBreakdown = {
        automationPotential: await this.calculateAutomationPotential(lead),
        financialCapacity: await this.calculateFinancialCapacity(lead),
        painPointSeverity: await this.calculatePainPointSeverity(lead),
        timingFactors: await this.calculateTimingFactors(lead),
        contactAccessibility: await this.calculateContactAccessibility(lead),
        engagementProbability: await this.calculateEngagementProbability(lead)
      };

      // Calculate weighted total score
      const totalScore = Object.keys(scoreBreakdown).reduce((total, key) => {
        return total + (scoreBreakdown[key] * this.scoringWeights[key]);
      }, 0);

      // Update lead with new scores
      await Lead.findByIdAndUpdate(lead._id, {
        score: Math.round(totalScore),
        scoreBreakdown,
        lastScored: new Date()
      });

      logger.info(`Updated score for ${lead.companyName}: ${Math.round(totalScore)}`);

    } catch (error) {
      logger.error(`Error calculating score for ${lead.companyName}:`, error);
    }
  }

  async calculateAutomationPotential(lead) {
    try {
      let score = 0;

      // Check company size (10-50 employees is ideal)
      if (lead.companySize?.min >= 10 && lead.companySize?.max <= 50) {
        score += 25;
      } else if (lead.companySize?.min >= 5 && lead.companySize?.max <= 100) {
        score += 15;
      }

      // Check for technology gaps
      if (lead.technologyStack?.length > 0) {
        const gaps = lead.technologyStack.filter(tech => tech.gaps?.length > 0);
        score += Math.min(gaps.length * 10, 30);
      }

      // Check for manual processes (pain points)
      if (lead.painPoints?.length > 0) {
        const automationPainPoints = lead.painPoints.filter(pain => 
          pain.category?.toLowerCase().includes('manual') ||
          pain.description?.toLowerCase().includes('manual') ||
          pain.category?.toLowerCase().includes('process') ||
          pain.description?.toLowerCase().includes('process')
        );
        score += Math.min(automationPainPoints.length * 15, 25);
      }

      // Check industry (service-based businesses)
      const serviceIndustries = [
        'consulting', 'services', 'agency', 'professional', 'business services',
        'healthcare', 'legal', 'accounting', 'marketing', 'real estate'
      ];
      
      if (serviceIndustries.some(industry => 
        lead.industry?.toLowerCase().includes(industry)
      )) {
        score += 20;
      }

      return Math.min(score, 100);

    } catch (error) {
      logger.error('Error calculating automation potential:', error);
      return 0;
    }
  }

  async calculateFinancialCapacity(lead) {
    try {
      let score = 0;

      // Check revenue range ($500K-$2M is ideal)
      if (lead.revenue?.min >= 500000 && lead.revenue?.max <= 2000000) {
        score += 40;
      } else if (lead.revenue?.min >= 250000 && lead.revenue?.max <= 5000000) {
        score += 25;
      } else if (lead.revenue?.min >= 100000) {
        score += 10;
      }

      // Check for growth indicators
      if (lead.recentActivity?.length > 0) {
        const growthActivities = lead.recentActivity.filter(activity =>
          activity.type === 'expansion' || 
          activity.type === 'funding' ||
          activity.description?.toLowerCase().includes('growth') ||
          activity.description?.toLowerCase().includes('expansion')
        );
        score += Math.min(growthActivities.length * 15, 30);
      }

      // Check company age (established but not too old)
      if (lead.foundedYear) {
        const age = new Date().getFullYear() - lead.foundedYear;
        if (age >= 2 && age <= 15) {
          score += 20;
        } else if (age >= 1 && age <= 20) {
          score += 10;
        }
      }

      // Check for hiring activity (indicates growth)
      if (lead.recentActivity?.length > 0) {
        const hiringActivities = lead.recentActivity.filter(activity =>
          activity.type === 'hiring' ||
          activity.description?.toLowerCase().includes('hiring') ||
          activity.description?.toLowerCase().includes('job')
        );
        score += Math.min(hiringActivities.length * 10, 20);
      }

      return Math.min(score, 100);

    } catch (error) {
      logger.error('Error calculating financial capacity:', error);
      return 0;
    }
  }

  async calculatePainPointSeverity(lead) {
    try {
      let score = 0;

      if (!lead.painPoints?.length) {
        return 0;
      }

      // Calculate pain point severity
      const severityScores = {
        'critical': 25,
        'high': 20,
        'medium': 15,
        'low': 10
      };

      lead.painPoints.forEach(painPoint => {
        score += severityScores[painPoint.severity] || 10;
      });

      // Bonus for multiple pain points
      if (lead.painPoints.length >= 3) {
        score += 20;
      } else if (lead.painPoints.length >= 2) {
        score += 10;
      }

      // Check for specific pain point categories
      const highValuePainPoints = lead.painPoints.filter(pain =>
        pain.category?.toLowerCase().includes('hiring') ||
        pain.category?.toLowerCase().includes('operations') ||
        pain.category?.toLowerCase().includes('admin') ||
        pain.category?.toLowerCase().includes('process') ||
        pain.description?.toLowerCase().includes('hiring') ||
        pain.description?.toLowerCase().includes('operations') ||
        pain.description?.toLowerCase().includes('admin')
      );

      score += Math.min(highValuePainPoints.length * 15, 25);

      return Math.min(score, 100);

    } catch (error) {
      logger.error('Error calculating pain point severity:', error);
      return 0;
    }
  }

  async calculateTimingFactors(lead) {
    try {
      let score = 0;

      if (!lead.recentActivity?.length) {
        return 0;
      }

      // Check for recent activity indicating timing
      const recentActivities = lead.recentActivity.filter(activity => {
        const activityDate = new Date(activity.date);
        const daysSince = (new Date() - activityDate) / (1000 * 60 * 60 * 24);
        return daysSince <= 90; // Last 3 months
      });

      // Score based on activity types
      recentActivities.forEach(activity => {
        switch (activity.type) {
          case 'hiring':
            score += 20;
            break;
          case 'expansion':
            score += 25;
            break;
          case 'funding':
            score += 30;
            break;
          case 'technology':
            score += 15;
            break;
          case 'partnership':
            score += 20;
            break;
          case 'news':
            score += 10;
            break;
        }
      });

      // Bonus for multiple recent activities
      if (recentActivities.length >= 3) {
        score += 25;
      } else if (recentActivities.length >= 2) {
        score += 15;
      }

      return Math.min(score, 100);

    } catch (error) {
      logger.error('Error calculating timing factors:', error);
      return 0;
    }
  }

  async calculateContactAccessibility(lead) {
    try {
      let score = 0;

      // Check for decision makers
      if (lead.decisionMakers?.length > 0) {
        score += Math.min(lead.decisionMakers.length * 20, 40);

        // Check for primary decision maker
        const primaryDecisionMaker = lead.decisionMakers.find(dm => dm.isPrimary);
        if (primaryDecisionMaker) {
          score += 20;
        }

        // Check for contact information
        const decisionMakersWithContact = lead.decisionMakers.filter(dm => 
          dm.email || dm.phone || dm.linkedin
        );
        score += Math.min(decisionMakersWithContact.length * 10, 30);
      }

      // Check for basic contact info
      if (lead.email) score += 10;
      if (lead.phone) score += 10;
      if (lead.website) score += 10;

      return Math.min(score, 100);

    } catch (error) {
      logger.error('Error calculating contact accessibility:', error);
      return 0;
    }
  }

  async calculateEngagementProbability(lead) {
    try {
      let score = 0;

      // Check social media presence
      if (lead.socialMedia) {
        const socialPlatforms = ['linkedin', 'facebook', 'twitter', 'instagram'];
        const activePlatforms = socialPlatforms.filter(platform => 
          lead.socialMedia[platform]
        );
        score += Math.min(activePlatforms.length * 15, 30);
      }

      // Check for recent social activity
      if (lead.socialMedia?.linkedin) {
        score += 20;
      }

      // Check engagement history
      if (lead.engagementHistory?.length > 0) {
        const recentEngagements = lead.engagementHistory.filter(engagement => {
          const engagementDate = new Date(engagement.date);
          const daysSince = (new Date() - engagementDate) / (1000 * 60 * 60 * 24);
          return daysSince <= 30; // Last 30 days
        });

        score += Math.min(recentEngagements.length * 10, 30);
      }

      // Check for positive engagement outcomes
      if (lead.engagementHistory?.length > 0) {
        const positiveOutcomes = lead.engagementHistory.filter(engagement =>
          engagement.outcome?.toLowerCase().includes('positive') ||
          engagement.outcome?.toLowerCase().includes('interested') ||
          engagement.outcome?.toLowerCase().includes('follow up')
        );
        score += Math.min(positiveOutcomes.length * 15, 20);
      }

      return Math.min(score, 100);

    } catch (error) {
      logger.error('Error calculating engagement probability:', error);
      return 0;
    }
  }

  async getHighPriorityLeads(limit = 20) {
    try {
      return await Lead.find({})
        .sort({ score: -1, priority: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error getting high priority leads:', error);
      return [];
    }
  }

  async getLeadsByScoreRange(minScore, maxScore) {
    try {
      return await Lead.find({
        score: { $gte: minScore, $lte: maxScore }
      }).sort({ score: -1 });
    } catch (error) {
      logger.error('Error getting leads by score range:', error);
      return [];
    }
  }

  async updateScoringWeights(newWeights) {
    try {
      this.scoringWeights = { ...this.scoringWeights, ...newWeights };
      logger.info('Updated scoring weights:', this.scoringWeights);
    } catch (error) {
      logger.error('Error updating scoring weights:', error);
    }
  }
}

module.exports = LeadScoringService;