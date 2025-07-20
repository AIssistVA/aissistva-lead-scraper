const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Lead = require('../models/Lead');
const Prospect = require('../models/Prospect');
const logger = require('../utils/logger');

class DataEnrichmentService {
  constructor() {
    this.browser = null;
    this.initBrowser();
  }

  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
    }
  }

  async enrichAllLeads() {
    try {
      const leads = await Lead.find({ 
        $or: [
          { lastEnriched: { $exists: false } },
          { lastEnriched: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      }).limit(50);

      logger.info(`Enriching ${leads.length} leads`);

      for (const lead of leads) {
        try {
          await this.enrichLead(lead);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
        } catch (error) {
          logger.error(`Failed to enrich lead ${lead.companyName}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in enrichAllLeads:', error);
    }
  }

  async enrichLead(lead) {
    try {
      const enrichedData = {
        ...lead.toObject(),
        lastEnriched: new Date()
      };

      // Enrich from multiple sources
      if (lead.website) {
        const websiteData = await this.scrapeWebsite(lead.website);
        enrichedData.website = websiteData;
      }

      if (lead.companyName) {
        const companyData = await this.searchCompanyInfo(lead.companyName, lead.address?.city);
        enrichedData.companyInfo = companyData;
      }

      // Enrich decision makers
      if (lead.decisionMakers?.length > 0) {
        for (const decisionMaker of lead.decisionMakers) {
          if (decisionMaker.name) {
            const contactData = await this.enrichContact(decisionMaker.name, lead.companyName);
            Object.assign(decisionMaker, contactData);
          }
        }
      }

      // Update lead with enriched data
      await Lead.findByIdAndUpdate(lead._id, enrichedData);
      logger.info(`Enriched lead: ${lead.companyName}`);

    } catch (error) {
      logger.error(`Error enriching lead ${lead.companyName}:`, error);
    }
  }

  async scrapeWebsite(url) {
    try {
      if (!this.browser) {
        await this.initBrowser();
      }

      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const data = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content,
          keywords: document.querySelector('meta[name="keywords"]')?.content,
          socialLinks: {
            linkedin: document.querySelector('a[href*="linkedin.com"]')?.href,
            facebook: document.querySelector('a[href*="facebook.com"]')?.href,
            twitter: document.querySelector('a[href*="twitter.com"]')?.href
          },
          contactInfo: {
            email: document.querySelector('a[href^="mailto:"]')?.href?.replace('mailto:', ''),
            phone: document.querySelector('a[href^="tel:"]')?.href?.replace('tel:', '')
          }
        };
      });

      await page.close();
      return data;

    } catch (error) {
      logger.error(`Error scraping website ${url}:`, error);
      return null;
    }
  }

  async searchCompanyInfo(companyName, city) {
    try {
      // Search Google Maps
      const googleMapsData = await this.searchGoogleMaps(companyName, city);
      
      // Search LinkedIn
      const linkedinData = await this.searchLinkedIn(companyName);
      
      // Search industry directories
      const directoryData = await this.searchDirectories(companyName, city);

      return {
        googleMaps: googleMapsData,
        linkedin: linkedinData,
        directories: directoryData,
        lastUpdated: new Date()
      };

    } catch (error) {
      logger.error(`Error searching company info for ${companyName}:`, error);
      return null;
    }
  }

  async searchGoogleMaps(companyName, city) {
    try {
      const searchQuery = `${companyName} ${city || ''}`;
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
        params: {
          query: searchQuery,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.results?.length > 0) {
        const place = response.data.results[0];
        return {
          name: place.name,
          address: place.formatted_address,
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
          reviews: place.user_ratings_total,
          types: place.types
        };
      }

      return null;

    } catch (error) {
      logger.error(`Error searching Google Maps for ${companyName}:`, error);
      return null;
    }
  }

  async searchLinkedIn(companyName) {
    try {
      // Note: LinkedIn scraping requires proper authentication and compliance
      // This is a simplified example
      const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(companyName)}`;
      
      // In a real implementation, you would use LinkedIn's API or proper scraping techniques
      return {
        searchUrl,
        note: 'LinkedIn data requires API access or proper scraping setup'
      };

    } catch (error) {
      logger.error(`Error searching LinkedIn for ${companyName}:`, error);
      return null;
    }
  }

  async searchDirectories(companyName, city) {
    try {
      const directories = [
        'better-business-bureau',
        'chamber-of-commerce',
        'industry-associations'
      ];

      const results = {};

      for (const directory of directories) {
        try {
          // Simulate directory search
          results[directory] = {
            found: Math.random() > 0.5,
            url: `https://${directory}.com/search?q=${encodeURIComponent(companyName)}`,
            lastChecked: new Date()
          };
        } catch (error) {
          logger.error(`Error searching directory ${directory}:`, error);
        }
      }

      return results;

    } catch (error) {
      logger.error(`Error searching directories for ${companyName}:`, error);
      return null;
    }
  }

  async enrichContact(name, companyName) {
    try {
      // Search for contact information
      const contactData = {
        linkedin: await this.findLinkedInProfile(name, companyName),
        email: await this.findEmail(name, companyName),
        phone: await this.findPhone(name, companyName)
      };

      return contactData;

    } catch (error) {
      logger.error(`Error enriching contact ${name}:`, error);
      return {};
    }
  }

  async findLinkedInProfile(name, companyName) {
    try {
      // Simulate LinkedIn profile search
      const searchQuery = `${name} ${companyName}`;
      return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;
    } catch (error) {
      logger.error(`Error finding LinkedIn profile for ${name}:`, error);
      return null;
    }
  }

  async findEmail(name, companyName) {
    try {
      // Simulate email finding
      const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      const emailFormats = [
        `${name.toLowerCase().replace(' ', '.')}@${domain}`,
        `${name.toLowerCase().replace(' ', '')}@${domain}`,
        `${name.toLowerCase().split(' ')[0]}@${domain}`
      ];

      // In a real implementation, you would verify these emails
      return emailFormats[0];

    } catch (error) {
      logger.error(`Error finding email for ${name}:`, error);
      return null;
    }
  }

  async findPhone(name, companyName) {
    try {
      // Simulate phone number finding
      // In a real implementation, you would search various sources
      return null;

    } catch (error) {
      logger.error(`Error finding phone for ${name}:`, error);
      return null;
    }
  }

  async enrichProspect(prospect) {
    try {
      const enrichedData = {
        ...prospect.toObject(),
        lastResearched: new Date()
      };

      // Enrich prospect data similar to leads
      if (prospect.website) {
        const websiteData = await this.scrapeWebsite(prospect.website);
        enrichedData.website = websiteData;
      }

      if (prospect.companyName) {
        const companyData = await this.searchCompanyInfo(prospect.companyName, prospect.address?.city);
        enrichedData.companyInfo = companyData;
      }

      // Update prospect with enriched data
      await Prospect.findByIdAndUpdate(prospect._id, enrichedData);
      logger.info(`Enriched prospect: ${prospect.companyName}`);

    } catch (error) {
      logger.error(`Error enriching prospect ${prospect.companyName}:`, error);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = DataEnrichmentService;