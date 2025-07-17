const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const { logger } = require('../utils/logger');

class ScrapingService {
  constructor() {
    this.browser = null;
    this.rateLimitDelay = 2000; // 2 seconds between requests
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeGoogleBusiness(location, industry, maxResults = 50) {
    const results = [];
    const page = await this.browser.newPage();
    
    try {
      const searchQuery = `${industry} in ${location}`;
      const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);

      // Scroll to load more results
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          const scrollableElement = document.querySelector('[role="feed"]');
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });
        await page.waitForTimeout(1000);
      }

      const businesses = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[role="article"]'));
        return items.slice(0, 50).map(item => {
          const nameElement = item.querySelector('h3');
          const addressElement = item.querySelector('[data-item-id*="address"]');
          const phoneElement = item.querySelector('[data-item-id*="phone"]');
          const websiteElement = item.querySelector('a[href*="http"]');
          
          return {
            name: nameElement ? nameElement.textContent.trim() : '',
            address: addressElement ? addressElement.textContent.trim() : '',
            phone: phoneElement ? phoneElement.textContent.trim() : '',
            website: websiteElement ? websiteElement.href : '',
            source: 'google_business'
          };
        });
      });

      results.push(...businesses);
      logger.info(`Scraped ${businesses.length} businesses from Google Business`);
      
    } catch (error) {
      logger.error(`Error scraping Google Business: ${error.message}`);
    } finally {
      await page.close();
    }

    return results;
  }

  async scrapeYelp(location, industry, maxResults = 30) {
    const results = [];
    const page = await this.browser.newPage();
    
    try {
      const searchQuery = `${industry} ${location}`;
      const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(searchQuery)}&find_loc=${encodeURIComponent(location)}`;
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);

      const businesses = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[data-testid="serp-ia-card"]'));
        return items.slice(0, 30).map(item => {
          const nameElement = item.querySelector('h3');
          const addressElement = item.querySelector('[data-testid="address"]');
          const phoneElement = item.querySelector('[data-testid="phone"]');
          const websiteElement = item.querySelector('a[href*="biz"]');
          
          return {
            name: nameElement ? nameElement.textContent.trim() : '',
            address: addressElement ? addressElement.textContent.trim() : '',
            phone: phoneElement ? phoneElement.textContent.trim() : '',
            website: websiteElement ? `https://www.yelp.com${websiteElement.href}` : '',
            source: 'yelp'
          };
        });
      });

      results.push(...businesses);
      logger.info(`Scraped ${businesses.length} businesses from Yelp`);
      
    } catch (error) {
      logger.error(`Error scraping Yelp: ${error.message}`);
    } finally {
      await page.close();
    }

    return results;
  }

  async analyzeWebsite(website) {
    if (!website || !website.startsWith('http')) {
      return null;
    }

    try {
      const response = await axios.get(website, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Detect technology stack
      const technologies = [];
      if ($('meta[name="generator"]').length) {
        technologies.push($('meta[name="generator"]').attr('content'));
      }
      if ($('script[src*="wp-content"]').length) {
        technologies.push('WordPress');
      }
      if ($('script[src*="shopify"]').length) {
        technologies.push('Shopify');
      }

      // Extract contact information
      const phoneRegex = /(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g;
      const phones = [];
      const text = $.text();
      let match;
      while ((match = phoneRegex.exec(text)) !== null) {
        phones.push(match[0]);
      }

      // Extract email addresses
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = text.match(emailRegex) || [];

      return {
        technologies: technologies,
        phones: [...new Set(phones)],
        emails: [...new Set(emails)],
        hasContactForm: $('form').length > 0,
        hasOnlineBooking: $('a[href*="book"], a[href*="appointment"]').length > 0,
        hasEcommerce: $('a[href*="cart"], a[href*="checkout"]').length > 0
      };
    } catch (error) {
      logger.error(`Error analyzing website ${website}: ${error.message}`);
      return null;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ScrapingService;