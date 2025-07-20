#!/usr/bin/env python3
"""
B2B Lead Scraper - Run Script
"""

import os
import sys
from app import app, db

def create_directories():
    """Create necessary directories"""
    directories = ['exports', 'logs']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

def init_database():
    """Initialize database tables"""
    with app.app_context():
        db.create_all()
        print("✓ Database initialized")

def main():
    """Main run function"""
    print("🚀 Starting B2B Lead Scraper...")
    
    # Create necessary directories
    create_directories()
    
    # Initialize database
    init_database()
    
    # Run the application
    print("✓ Application ready")
    print("🌐 Access the application at: http://localhost:5000")
    print("📊 Dashboard: http://localhost:5000/")
    print("🔍 Scrape: http://localhost:5000/scrape")
    print("👥 Leads: http://localhost:5000/leads")
    print("📈 Analytics: http://localhost:5000/analytics")
    print("\nPress Ctrl+C to stop the application")
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=app.config.get('DEBUG', True)
        )
    except KeyboardInterrupt:
        print("\n👋 Application stopped")
        sys.exit(0)

if __name__ == '__main__':
    main()