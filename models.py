from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Lead(db.Model):
    """Lead model for storing scraped business data"""
    __tablename__ = 'leads'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), nullable=False)
    website = db.Column(db.String(500))
    contact_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    employee_count = db.Column(db.Integer)
    industry = db.Column(db.String(100))
    city = db.Column(db.String(50))
    state = db.Column(db.String(2))
    linkedin_url = db.Column(db.String(500))
    pain_point_indicators = db.Column(db.Text)  # JSON string
    automation_level = db.Column(db.String(50))  # low, medium, high
    priority_score = db.Column(db.Integer)  # 1-100
    source = db.Column(db.String(100))  # google_maps, linkedin, yelp, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert lead to dictionary"""
        return {
            'id': self.id,
            'company_name': self.company_name,
            'website': self.website,
            'contact_name': self.contact_name,
            'email': self.email,
            'phone': self.phone,
            'employee_count': self.employee_count,
            'industry': self.industry,
            'city': self.city,
            'state': self.state,
            'linkedin_url': self.linkedin_url,
            'pain_point_indicators': json.loads(self.pain_point_indicators) if self.pain_point_indicators else [],
            'automation_level': self.automation_level,
            'priority_score': self.priority_score,
            'source': self.source,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Lead {self.company_name}>'

class ScrapingJob(db.Model):
    """Model for tracking scraping jobs"""
    __tablename__ = 'scraping_jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    industries = db.Column(db.Text)  # JSON string
    locations = db.Column(db.Text)  # JSON string
    employee_range = db.Column(db.String(20))
    revenue_range = db.Column(db.String(20))
    status = db.Column(db.String(20), default='pending')  # pending, running, completed, failed
    leads_found = db.Column(db.Integer, default=0)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        """Convert job to dictionary"""
        return {
            'id': self.id,
            'industries': json.loads(self.industries) if self.industries else [],
            'locations': json.loads(self.locations) if self.locations else [],
            'employee_range': self.employee_range,
            'revenue_range': self.revenue_range,
            'status': self.status,
            'leads_found': self.leads_found,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def __repr__(self):
        return f'<ScrapingJob {self.id}>'