const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logger } = require('../utils/logger');

const dbPath = path.join(__dirname, '../../data/leads.db');

// Get dashboard overview metrics
router.get('/overview', async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    
    const metrics = await Promise.all([
      // Total leads
      new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM leads', (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        });
      }),
      
      // High-quality leads (score 7+)
      new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM leads WHERE lead_score >= 7', (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        });
      }),
      
      // Leads by status
      new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM leads WHERE status = "new"', (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        });
      }),
      
      // Average lead score
      new Promise((resolve, reject) => {
        db.get('SELECT AVG(lead_score) as avg FROM leads', (err, row) => {
          if (err) reject(err);
          else resolve(row.avg || 0);
        });
      })
    ]);

    db.close();

    res.json({
      totalLeads: metrics[0],
      highQualityLeads: metrics[1],
      newLeads: metrics[2],
      averageScore: Math.round(metrics[3] * 10) / 10
    });

  } catch (error) {
    logger.error('Error fetching overview metrics:', error);
    res.status(500).json({ error: 'Failed to fetch overview metrics' });
  }
});

// Get leads by industry
router.get('/by-industry', async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    
    const industries = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          industry,
          COUNT(*) as count,
          AVG(lead_score) as avg_score
        FROM leads 
        WHERE industry IS NOT NULL AND industry != ''
        GROUP BY industry 
        ORDER BY count DESC
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    res.json(industries);

  } catch (error) {
    logger.error('Error fetching industry metrics:', error);
    res.status(500).json({ error: 'Failed to fetch industry metrics' });
  }
});

// Get leads by location
router.get('/by-location', async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    
    const locations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          city,
          COUNT(*) as count,
          AVG(lead_score) as avg_score
        FROM leads 
        WHERE city IS NOT NULL AND city != ''
        GROUP BY city 
        ORDER BY count DESC
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    res.json(locations);

  } catch (error) {
    logger.error('Error fetching location metrics:', error);
    res.status(500).json({ error: 'Failed to fetch location metrics' });
  }
});

// Get lead score distribution
router.get('/score-distribution', async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    
    const distribution = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          CASE 
            WHEN lead_score >= 8 THEN '8-10 (High)'
            WHEN lead_score >= 6 THEN '6-7 (Medium)'
            WHEN lead_score >= 4 THEN '4-5 (Low)'
            ELSE '1-3 (Poor)'
          END as score_range,
          COUNT(*) as count
        FROM leads 
        GROUP BY score_range
        ORDER BY MIN(lead_score)
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    res.json(distribution);

  } catch (error) {
    logger.error('Error fetching score distribution:', error);
    res.status(500).json({ error: 'Failed to fetch score distribution' });
  }
});

// Get leads over time
router.get('/over-time', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const db = new sqlite3.Database(dbPath);
    
    let dateFilter;
    switch (period) {
      case '30d':
        dateFilter = "scraped_at >= datetime('now', '-30 days')";
        break;
      case '7d':
      default:
        dateFilter = "scraped_at >= datetime('now', '-7 days')";
        break;
    }
    
    const timeData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          DATE(scraped_at) as date,
          COUNT(*) as count,
          AVG(lead_score) as avg_score
        FROM leads 
        WHERE ${dateFilter}
        GROUP BY DATE(scraped_at)
        ORDER BY date
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    res.json(timeData);

  } catch (error) {
    logger.error('Error fetching time series data:', error);
    res.status(500).json({ error: 'Failed to fetch time series data' });
  }
});

// Get conversion metrics
router.get('/conversions', async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    
    const conversions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(lead_score) as avg_score
        FROM leads 
        GROUP BY status
        ORDER BY count DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    res.json(conversions);

  } catch (error) {
    logger.error('Error fetching conversion metrics:', error);
    res.status(500).json({ error: 'Failed to fetch conversion metrics' });
  }
});

// Get source performance
router.get('/source-performance', async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    
    const sources = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          source,
          COUNT(*) as count,
          AVG(lead_score) as avg_score,
          COUNT(CASE WHEN lead_score >= 7 THEN 1 END) as high_quality_count
        FROM leads 
        WHERE source IS NOT NULL AND source != ''
        GROUP BY source
        ORDER BY avg_score DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    res.json(sources);

  } catch (error) {
    logger.error('Error fetching source performance:', error);
    res.status(500).json({ error: 'Failed to fetch source performance' });
  }
});

module.exports = router;