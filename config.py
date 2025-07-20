import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-this-in-production')
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # Database settings
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///leads.db')
    
    # Celery settings
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    
    # Scraping settings
    SCRAPING_DELAY = int(os.environ.get('SCRAPING_DELAY', '2'))  # seconds between requests
    MAX_LEADS_PER_SOURCE = int(os.environ.get('MAX_LEADS_PER_SOURCE', '20'))
    REQUEST_TIMEOUT = int(os.environ.get('REQUEST_TIMEOUT', '10'))
    
    # Email validation settings
    EMAIL_VALIDATION_ENABLED = os.environ.get('EMAIL_VALIDATION_ENABLED', 'True').lower() == 'true'
    
    # Export settings
    EXPORT_DIR = os.environ.get('EXPORT_DIR', 'exports')
    
    # Target criteria
    TARGET_EMPLOYEE_RANGE = os.environ.get('TARGET_EMPLOYEE_RANGE', '10-50')
    TARGET_REVENUE_RANGE = os.environ.get('TARGET_REVENUE_RANGE', '500K-2M')
    
    # Industries to target
    TARGET_INDUSTRIES = [
        'manufacturing', 'woodworking', 'metal fabrication', 'furniture',
        'construction', 'logistics', 'distribution', 'professional services',
        'healthcare', 'dental', 'law', 'accounting', 'real estate',
        'retail', 'restaurant', 'auto repair', 'landscaping', 'cleaning',
        'consulting'
    ]
    
    # Target locations (Kansas City metro)
    TARGET_LOCATIONS = [
        'Kansas City MO', 'Kansas City KS', 'Overland Park', 'Olathe',
        'Independence', 'Lee\'s Summit', 'Shawnee', 'Blue Springs',
        'Lenexa', 'Leawood'
    ]
    
    # Search queries
    SEARCH_QUERIES = [
        '{industry} company {location} 10-50 employees',
        '{industry} business {location} family owned',
        '{industry} services {location} established',
        'local {industry} {location} custom manual'
    ]
    
    # Pain point indicators
    PAIN_POINT_INDICATORS = [
        'manual processes', 'spreadsheet tracking', 'paper-based systems',
        'looking for efficiency', 'growing team', 'hiring',
        'overwhelmed with paperwork', 'need better organization',
        'traditional', 'family-owned', 'established'
    ]
    
    # Automation indicators
    AUTOMATION_INDICATORS = [
        'automated', 'digital', 'tech-enabled', 'software',
        'platform', 'api', 'integration', 'cloud'
    ]
    
    # Lead scoring weights
    LEAD_SCORING_WEIGHTS = {
        'employee_count': 0.15,
        'automation_level': 0.25,
        'pain_points': 0.30,
        'industry': 0.10,
        'location': 0.10,
        'contact_info': 0.10
    }
    
    # Industry priority scores
    INDUSTRY_SCORES = {
        'manufacturing': 90,
        'woodworking': 85,
        'metal fabrication': 88,
        'furniture': 82,
        'construction': 85,
        'logistics': 92,
        'distribution': 90,
        'professional services': 75,
        'healthcare': 80,
        'dental': 78,
        'law': 70,
        'accounting': 75,
        'real estate': 65,
        'retail': 60,
        'restaurant': 55,
        'auto repair': 70,
        'landscaping': 75,
        'cleaning': 80,
        'consulting': 70
    }
    
    # Location priority scores
    LOCATION_SCORES = {
        'Kansas City': 100,
        'Overland Park': 95,
        'Olathe': 90,
        'Independence': 85,
        'Lee\'s Summit': 88,
        'Shawnee': 85,
        'Blue Springs': 80,
        'Lenexa': 90,
        'Leawood': 92
    }
    
    # Revenue estimates per employee by industry
    REVENUE_PER_EMPLOYEE = {
        'manufacturing': 150000,
        'woodworking': 120000,
        'metal fabrication': 140000,
        'furniture': 100000,
        'construction': 180000,
        'logistics': 160000,
        'distribution': 200000,
        'professional services': 120000,
        'healthcare': 140000,
        'dental': 160000,
        'law': 200000,
        'accounting': 150000,
        'real estate': 80000,
        'retail': 60000,
        'restaurant': 50000,
        'auto repair': 100000,
        'landscaping': 80000,
        'cleaning': 70000,
        'consulting': 150000
    }