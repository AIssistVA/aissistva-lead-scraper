from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from datetime import datetime
import pandas as pd
from celery import Celery
import json

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///leads.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
migrate = Migrate(app, db)

# Initialize Celery
celery = Celery('tasks', broker='redis://localhost:6379/0')
celery.conf.update(app.config)

# Import models and scrapers
from models import Lead, ScrapingJob, db
from scrapers import LeadScraper
from utils import LeadScorer, EmailValidator

@app.route('/')
def index():
    """Main dashboard page"""
    total_leads = Lead.query.count()
    recent_leads = Lead.query.order_by(Lead.created_at.desc()).limit(10).all()
    active_jobs = ScrapingJob.query.filter_by(status='running').count()
    
    return render_template('index.html', 
                         total_leads=total_leads,
                         recent_leads=recent_leads,
                         active_jobs=active_jobs)

@app.route('/scrape', methods=['GET', 'POST'])
def scrape():
    """Start scraping job"""
    if request.method == 'POST':
        data = request.get_json()
        
        # Create scraping job
        job = ScrapingJob(
            industries=data.get('industries', []),
            locations=data.get('locations', []),
            employee_range=data.get('employee_range', '10-50'),
            revenue_range=data.get('revenue_range', '500K-2M')
        )
        db.session.add(job)
        db.session.commit()
        
        # Start background scraping task
        scrape_leads.delay(job.id)
        
        return jsonify({'success': True, 'job_id': job.id})
    
    return render_template('scrape.html')

@app.route('/leads')
def leads():
    """View all leads"""
    page = request.args.get('page', 1, type=int)
    leads = Lead.query.paginate(page=page, per_page=50, error_out=False)
    return render_template('leads.html', leads=leads)

@app.route('/leads/export')
def export_leads():
    """Export leads to CSV"""
    leads = Lead.query.all()
    
    data = []
    for lead in leads:
        data.append({
            'Company_Name': lead.company_name,
            'Contact_Name': lead.contact_name,
            'Email': lead.email,
            'Phone': lead.phone,
            'Website': lead.website,
            'Employees': lead.employee_count,
            'Industry': lead.industry,
            'Location': f"{lead.city}, {lead.state}",
            'Pain_Point_Indicators': lead.pain_point_indicators,
            'Automation_Level': lead.automation_level,
            'Priority_Score': lead.priority_score
        })
    
    df = pd.DataFrame(data)
    filename = f"leads_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    df.to_csv(f"exports/{filename}", index=False)
    
    return send_file(f"exports/{filename}", as_attachment=True)

@app.route('/analytics')
def analytics():
    """Analytics dashboard"""
    # Industry breakdown
    industry_stats = db.session.query(
        Lead.industry, 
        db.func.count(Lead.id).label('count')
    ).group_by(Lead.industry).all()
    
    # Location breakdown
    location_stats = db.session.query(
        Lead.city, 
        db.func.count(Lead.id).label('count')
    ).group_by(Lead.city).all()
    
    # Priority score distribution
    priority_stats = db.session.query(
        Lead.priority_score,
        db.func.count(Lead.id).label('count')
    ).group_by(Lead.priority_score).all()
    
    return render_template('analytics.html',
                         industry_stats=industry_stats,
                         location_stats=location_stats,
                         priority_stats=priority_stats)

@app.route('/api/leads')
def api_leads():
    """API endpoint for leads data"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    leads = Lead.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'leads': [lead.to_dict() for lead in leads.items],
        'total': leads.total,
        'pages': leads.pages,
        'current_page': leads.page
    })

@app.route('/api/jobs')
def api_jobs():
    """API endpoint for scraping jobs"""
    jobs = ScrapingJob.query.order_by(ScrapingJob.created_at.desc()).limit(10).all()
    return jsonify([job.to_dict() for job in jobs])

@celery.task
def scrape_leads(job_id):
    """Background task for scraping leads"""
    job = ScrapingJob.query.get(job_id)
    if not job:
        return
    
    job.status = 'running'
    db.session.commit()
    
    try:
        scraper = LeadScraper()
        leads = scraper.scrape_all_sources(
            industries=job.industries,
            locations=job.locations,
            employee_range=job.employee_range,
            revenue_range=job.revenue_range
        )
        
        # Save leads to database
        for lead_data in leads:
            lead = Lead(**lead_data)
            db.session.add(lead)
        
        db.session.commit()
        job.status = 'completed'
        job.leads_found = len(leads)
        
    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)
    
    db.session.commit()

if __name__ == '__main__':
    # Create exports directory
    os.makedirs('exports', exist_ok=True)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)