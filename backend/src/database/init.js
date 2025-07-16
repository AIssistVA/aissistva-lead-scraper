const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/leads.db');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      db.serialize(() => {
        // Create leads table
        db.run(`CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_name TEXT NOT NULL,
          website TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          industry TEXT,
          employee_count INTEGER,
          revenue_estimate TEXT,
          lead_score INTEGER DEFAULT 0,
          status TEXT DEFAULT 'new',
          source TEXT,
          scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          enriched_at DATETIME,
          notes TEXT,
          contact_person TEXT,
          contact_title TEXT,
          linkedin_url TEXT,
          facebook_url TEXT,
          technology_stack TEXT,
          pain_points TEXT,
          automation_opportunities TEXT,
          growth_signals TEXT,
          last_contacted DATETIME,
          next_follow_up DATETIME
        )`);

        // Create scraping_jobs table
        db.run(`CREATE TABLE IF NOT EXISTS scraping_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_type TEXT NOT NULL,
          parameters TEXT,
          status TEXT DEFAULT 'pending',
          started_at DATETIME,
          completed_at DATETIME,
          results_count INTEGER DEFAULT 0,
          error_message TEXT
        )`);

        // Create analytics table
        db.run(`CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          metric_name TEXT NOT NULL,
          metric_value REAL,
          date_recorded DATE DEFAULT CURRENT_DATE,
          category TEXT
        )`);

        // Create contacts table
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER,
          name TEXT,
          title TEXT,
          email TEXT,
          phone TEXT,
          linkedin_url TEXT,
          is_decision_maker BOOLEAN DEFAULT 0,
          verified BOOLEAN DEFAULT 0,
          FOREIGN KEY (lead_id) REFERENCES leads (id)
        )`);

        // Create indexes for better performance
        db.run('CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry)');
        db.run('CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score)');
        db.run('CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city)');
        db.run('CREATE INDEX IF NOT EXISTS idx_leads_scraped_at ON leads(scraped_at)');

        resolve();
      });
    });
  });
}

module.exports = { initializeDatabase };