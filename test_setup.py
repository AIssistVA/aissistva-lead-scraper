#!/usr/bin/env python3
"""
Test script to verify B2B Lead Scraper setup
"""

import sys
import os
import importlib

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")
    
    required_modules = [
        'flask',
        'flask_sqlalchemy',
        'flask_migrate',
        'celery',
        'requests',
        'beautifulsoup4',
        'selenium',
        'pandas',
        'numpy',
        'email_validator',
        'fake_useragent'
    ]
    
    failed_imports = []
    
    for module in required_modules:
        try:
            importlib.import_module(module)
            print(f"  ✓ {module}")
        except ImportError as e:
            print(f"  ✗ {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        return False
    else:
        print("✅ All imports successful")
        return True

def test_database():
    """Test database connection and models"""
    print("\n🗄️  Testing database...")
    
    try:
        from app import app, db
        from models import Lead, ScrapingJob
        
        with app.app_context():
            db.create_all()
            print("  ✓ Database tables created")
            
            # Test model creation
            lead = Lead(
                company_name="Test Company",
                industry="manufacturing",
                city="Kansas City",
                state="MO",
                priority_score=85
            )
            db.session.add(lead)
            db.session.commit()
            print("  ✓ Lead model test successful")
            
            # Clean up
            db.session.delete(lead)
            db.session.commit()
            
        return True
    except Exception as e:
        print(f"  ✗ Database test failed: {e}")
        return False

def test_scrapers():
    """Test scraper components"""
    print("\n🔍 Testing scrapers...")
    
    try:
        from scrapers import LeadScraper
        from utils import LeadScorer, EmailValidator
        
        # Test LeadScraper initialization
        scraper = LeadScraper()
        print("  ✓ LeadScraper initialized")
        
        # Test LeadScorer
        scorer = LeadScorer()
        test_lead = {
            'employee_count': 25,
            'automation_level': 'low',
            'pain_point_indicators': '["manual processes"]',
            'industry': 'manufacturing',
            'city': 'Kansas City'
        }
        score = scorer.calculate_score(test_lead)
        print(f"  ✓ LeadScorer test successful (score: {score})")
        
        # Test EmailValidator
        validator = EmailValidator()
        is_valid = validator.validate_email("test@example.com")
        print(f"  ✓ EmailValidator test successful (test@example.com: {is_valid})")
        
        return True
    except Exception as e:
        print(f"  ✗ Scraper test failed: {e}")
        return False

def test_redis():
    """Test Redis connection"""
    print("\n🔴 Testing Redis...")
    
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("  ✓ Redis connection successful")
        return True
    except Exception as e:
        print(f"  ✗ Redis test failed: {e}")
        print("  💡 Make sure Redis is running: redis-server")
        return False

def test_celery():
    """Test Celery configuration"""
    print("\n🔄 Testing Celery...")
    
    try:
        from app import celery
        print("  ✓ Celery configuration successful")
        return True
    except Exception as e:
        print(f"  ✗ Celery test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 B2B Lead Scraper - Setup Test")
    print("=" * 40)
    
    tests = [
        test_imports,
        test_database,
        test_scrapers,
        test_redis,
        test_celery
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"  ✗ Test failed with exception: {e}")
            results.append(False)
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print("🎉 All tests passed! Your setup is ready.")
        print("\n🚀 To start the application:")
        print("   ./start.sh")
        print("   or")
        print("   python run.py")
    else:
        print(f"⚠️  {passed}/{total} tests passed")
        print("\n🔧 Please fix the failed tests before running the application")
        
        if not results[0]:  # imports failed
            print("\n💡 Try installing dependencies:")
            print("   pip install -r requirements.txt")
        
        if not results[3]:  # redis failed
            print("\n💡 Start Redis server:")
            print("   redis-server")
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)