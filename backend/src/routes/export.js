const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { logger } = require('../utils/logger');

const dbPath = path.join(__dirname, '../../data/leads.db');

// Export leads to CSV
router.post('/csv', async (req, res) => {
  try {
    const { filters = {}, filename = 'leads-export' } = req.body;
    
    const db = new sqlite3.Database(dbPath);
    
    // Build query with filters
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filters.industry) {
      whereClause += ' AND industry LIKE ?';
      params.push(`%${filters.industry}%`);
    }

    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.minScore) {
      whereClause += ' AND lead_score >= ?';
      params.push(parseInt(filters.minScore));
    }

    if (filters.maxScore) {
      whereClause += ' AND lead_score <= ?';
      params.push(parseInt(filters.maxScore));
    }

    if (filters.city) {
      whereClause += ' AND city LIKE ?';
      params.push(`%${filters.city}%`);
    }

    const query = `SELECT * FROM leads ${whereClause} ORDER BY lead_score DESC`;
    
    const leads = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found matching the criteria' });
    }

    // Create CSV file
    const exportPath = path.join(__dirname, '../../exports');
    const fs = require('fs');
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: path.join(exportPath, `${filename}-${Date.now()}.csv`),
      header: [
        { id: 'company_name', title: 'Company Name' },
        { id: 'website', title: 'Website' },
        { id: 'phone', title: 'Phone' },
        { id: 'email', title: 'Email' },
        { id: 'address', title: 'Address' },
        { id: 'city', title: 'City' },
        { id: 'state', title: 'State' },
        { id: 'zip_code', title: 'Zip Code' },
        { id: 'industry', title: 'Industry' },
        { id: 'employee_count', title: 'Employee Count' },
        { id: 'revenue_estimate', title: 'Revenue Estimate' },
        { id: 'lead_score', title: 'Lead Score' },
        { id: 'status', title: 'Status' },
        { id: 'source', title: 'Source' },
        { id: 'pain_points', title: 'Pain Points' },
        { id: 'automation_opportunities', title: 'Automation Opportunities' },
        { id: 'growth_signals', title: 'Growth Signals' },
        { id: 'contact_person', title: 'Contact Person' },
        { id: 'contact_title', title: 'Contact Title' },
        { id: 'linkedin_url', title: 'LinkedIn URL' },
        { id: 'technology_stack', title: 'Technology Stack' },
        { id: 'scraped_at', title: 'Scraped At' },
        { id: 'notes', title: 'Notes' }
      ]
    });

    await csvWriter.writeRecords(leads);

    res.json({
      success: true,
      message: `Exported ${leads.length} leads to CSV`,
      filename: `${filename}-${Date.now()}.csv`,
      recordCount: leads.length
    });

  } catch (error) {
    logger.error('Error exporting leads:', error);
    res.status(500).json({ error: 'Failed to export leads', message: error.message });
  }
});

// Get export history
router.get('/history', async (req, res) => {
  try {
    const exportPath = path.join(__dirname, '../../exports');
    const fs = require('fs');
    
    if (!fs.existsSync(exportPath)) {
      return res.json([]);
    }

    const files = fs.readdirSync(exportPath)
      .filter(file => file.endsWith('.csv'))
      .map(file => {
        const stats = fs.statSync(path.join(exportPath, file));
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          path: path.join(exportPath, file)
        };
      })
      .sort((a, b) => b.created - a.created);

    res.json(files);

  } catch (error) {
    logger.error('Error getting export history:', error);
    res.status(500).json({ error: 'Failed to get export history' });
  }
});

// Download exported file
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../exports', filename);
    
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename);

  } catch (error) {
    logger.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

module.exports = router;