const express = require('express');
const router = express.Router();
const ScrapingService = require('../services/scrapingService');
const AIService = require('../services/aiService');
const { logger } = require('../utils/logger');

const scrapingService = new ScrapingService();
const aiService = new AIService();

// Initialize scraping service
scrapingService.initialize().catch(err => {
  logger.error('Failed to initialize scraping service:', err);
});

// Start a new scraping job
router.post('/start', async (req, res) => {
  try {
    const { location, industry, sources = ['google', 'yelp'], maxResults = 50 } = req.body;

    if (!location || !industry) {
      return res.status(400).json({ error: 'Location and industry are required' });
    }

    logger.info(`Starting scraping job for ${industry} in ${location}`);

    const results = [];
    
    // Scrape from different sources
    if (sources.includes('google')) {
      const googleResults = await scrapingService.scrapeGoogleBusiness(location, industry, maxResults);
      results.push(...googleResults);
      await scrapingService.delay(2000); // Rate limiting
    }

    if (sources.includes('yelp')) {
      const yelpResults = await scrapingService.scrapeYelp(location, industry, maxResults);
      results.push(...yelpResults);
      await scrapingService.delay(2000); // Rate limiting
    }

    // Remove duplicates based on company name
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.name.toLowerCase() === result.name.toLowerCase())
    );

    // Analyze websites and qualify leads
    const enrichedResults = [];
    for (const result of uniqueResults.slice(0, 20)) { // Limit to 20 for AI analysis
      try {
        // Analyze website if available
        if (result.website) {
          const websiteAnalysis = await scrapingService.analyzeWebsite(result.website);
          if (websiteAnalysis) {
            result.technology_stack = websiteAnalysis.technologies.join(', ');
            result.phones = websiteAnalysis.phones;
            result.emails = websiteAnalysis.emails;
          }
        }

        // AI qualification
        const qualification = await aiService.qualifyLead(result);
        result.lead_score = qualification.score;
        result.pain_points = qualification.painPoints.join(', ');
        result.automation_opportunities = qualification.opportunities.join(', ');
        result.growth_signals = qualification.growthSignals.join(', ');
        result.revenue_estimate = qualification.revenueEstimate;
        result.insights = qualification.insights;

        enrichedResults.push(result);
        await scrapingService.delay(1000); // Rate limiting for AI calls
      } catch (error) {
        logger.error(`Error processing result ${result.name}:`, error);
        result.lead_score = 5; // Default score
        enrichedResults.push(result);
      }
    }

    res.json({
      success: true,
      totalFound: results.length,
      uniqueResults: uniqueResults.length,
      enrichedResults: enrichedResults.length,
      results: enrichedResults
    });

  } catch (error) {
    logger.error('Error in scraping job:', error);
    res.status(500).json({ error: 'Failed to start scraping job', message: error.message });
  }
});

// Get scraping job status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    // TODO: Implement job status tracking
    res.json({ status: 'completed', jobId });
  } catch (error) {
    logger.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Analyze a specific website
router.post('/analyze-website', async (req, res) => {
  try {
    const { website } = req.body;

    if (!website) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    const analysis = await scrapingService.analyzeWebsite(website);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Could not analyze website' });
    }

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    logger.error('Error analyzing website:', error);
    res.status(500).json({ error: 'Failed to analyze website', message: error.message });
  }
});

// Get scraping statistics
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement scraping statistics
    res.json({
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      totalLeadsFound: 0,
      averageLeadsPerJob: 0
    });
  } catch (error) {
    logger.error('Error getting scraping stats:', error);
    res.status(500).json({ error: 'Failed to get scraping statistics' });
  }
});

module.exports = router;