const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const AIService = require('../services/aiService');
const { logger } = require('../utils/logger');

const dbPath = path.join(__dirname, '../../data/leads.db');
const aiService = new AIService();

// Get all leads with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      industry, 
      status, 
      minScore, 
      maxScore,
      city,
      sortBy = 'lead_score',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (industry) {
      whereClause += ' AND industry LIKE ?';
      params.push(`%${industry}%`);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (minScore) {
      whereClause += ' AND lead_score >= ?';
      params.push(parseInt(minScore));
    }

    if (maxScore) {
      whereClause += ' AND lead_score <= ?';
      params.push(parseInt(maxScore));
    }

    if (city) {
      whereClause += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }

    const db = new sqlite3.Database(dbPath);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM leads ${whereClause}`;
    const total = await new Promise((resolve, reject) => {
      db.get(countQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    // Get leads
    const query = `
      SELECT * FROM leads 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const leads = await new Promise((resolve, reject) => {
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    res.json({
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads', message: error.message });
  }
});

// Get a specific lead by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    
    const lead = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    db.close();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ lead });

  } catch (error) {
    logger.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead', message: error.message });
  }
});

// Create a new lead
router.post('/', async (req, res) => {
  try {
    const leadData = req.body;
    const db = new sqlite3.Database(dbPath);
    
    const query = `
      INSERT INTO leads (
        company_name, website, phone, email, address, city, state, zip_code,
        industry, employee_count, revenue_estimate, lead_score, status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      leadData.company_name,
      leadData.website,
      leadData.phone,
      leadData.email,
      leadData.address,
      leadData.city,
      leadData.state,
      leadData.zip_code,
      leadData.industry,
      leadData.employee_count,
      leadData.revenue_estimate,
      leadData.lead_score || 5,
      leadData.status || 'new',
      leadData.source || 'manual'
    ];

    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });

    db.close();

    res.status(201).json({
      success: true,
      leadId: result.id,
      message: 'Lead created successfully'
    });

  } catch (error) {
    logger.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead', message: error.message });
  }
});

// Update a lead
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = new sqlite3.Database(dbPath);
    
    const fields = Object.keys(updateData)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`);
    
    const query = `UPDATE leads SET ${fields.join(', ')} WHERE id = ?`;
    const params = [...Object.values(updateData).filter((_, index) => Object.keys(updateData)[index] !== 'id'), id];

    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    db.close();

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully'
    });

  } catch (error) {
    logger.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead', message: error.message });
  }
});

// Delete a lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM leads WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    db.close();

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead', message: error.message });
  }
});

// Qualify a lead with AI
router.post('/:id/qualify', async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    
    // Get lead data
    const lead = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!lead) {
      db.close();
      return res.status(404).json({ error: 'Lead not found' });
    }

    // AI qualification
    const qualification = await aiService.qualifyLead(lead);
    
    // Update lead with AI insights
    const updateQuery = `
      UPDATE leads SET 
        lead_score = ?,
        pain_points = ?,
        automation_opportunities = ?,
        growth_signals = ?,
        revenue_estimate = ?,
        notes = ?,
        enriched_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const updateParams = [
      qualification.score,
      qualification.painPoints.join(', '),
      qualification.opportunities.join(', '),
      qualification.growthSignals.join(', '),
      qualification.revenueEstimate,
      qualification.insights,
      id
    ];

    await new Promise((resolve, reject) => {
      db.run(updateQuery, updateParams, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    db.close();

    res.json({
      success: true,
      qualification,
      message: 'Lead qualified successfully'
    });

  } catch (error) {
    logger.error('Error qualifying lead:', error);
    res.status(500).json({ error: 'Failed to qualify lead', message: error.message });
  }
});

// Generate outreach content for a lead
router.post('/:id/outreach', async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    
    const lead = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!lead) {
      db.close();
      return res.status(404).json({ error: 'Lead not found' });
    }

    const outreachContent = await aiService.generateOutreachContent(lead);
    db.close();

    res.json({
      success: true,
      outreachContent,
      message: 'Outreach content generated successfully'
    });

  } catch (error) {
    logger.error('Error generating outreach content:', error);
    res.status(500).json({ error: 'Failed to generate outreach content', message: error.message });
  }
});

// Bulk update leads
router.put('/bulk/update', async (req, res) => {
  try {
    const { leadIds, updates } = req.body;
    
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'Lead IDs array is required' });
    }

    const db = new sqlite3.Database(dbPath);
    const placeholders = leadIds.map(() => '?').join(',');
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`);
    
    const query = `UPDATE leads SET ${fields.join(', ')} WHERE id IN (${placeholders})`;
    const params = [...Object.values(updates), ...leadIds];

    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    db.close();

    res.json({
      success: true,
      updatedCount: result.changes,
      message: `Updated ${result.changes} leads successfully`
    });

  } catch (error) {
    logger.error('Error bulk updating leads:', error);
    res.status(500).json({ error: 'Failed to bulk update leads', message: error.message });
  }
});

module.exports = router;