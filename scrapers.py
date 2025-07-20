import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import re
import json
from fake_useragent import UserAgent
from utils import LeadScorer, EmailValidator
import os

class LeadScraper:
    """Main scraper class that coordinates scraping from multiple sources"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.scorer = LeadScorer()
        self.email_validator = EmailValidator()
        
        # Target industries and locations
        self.industries = [
            'manufacturing', 'woodworking', 'metal fabrication', 'furniture',
            'construction', 'logistics', 'distribution', 'professional services',
            'healthcare', 'dental', 'law', 'accounting', 'real estate',
            'retail', 'restaurant', 'auto repair', 'landscaping', 'cleaning',
            'consulting'
        ]
        
        self.locations = [
            'Kansas City MO', 'Kansas City KS', 'Overland Park', 'Olathe',
            'Independence', 'Lee\'s Summit', 'Shawnee', 'Blue Springs',
            'Lenexa', 'Leawood'
        ]
        
        # Search queries
        self.search_queries = [
            '{industry} company {location} 10-50 employees',
            '{industry} business {location} family owned',
            '{industry} services {location} established',
            'local {industry} {location} custom manual'
        ]
    
    def scrape_all_sources(self, industries=None, locations=None, employee_range='10-50', revenue_range='500K-2M'):
        """Scrape leads from all sources"""
        if industries is None:
            industries = self.industries
        if locations is None:
            locations = self.locations
            
        all_leads = []
        
        # Scrape from different sources
        sources = [
            self.scrape_google_maps,
            self.scrape_yelp,
            self.scrape_linkedin,
            self.scrape_yellow_pages,
            self.scrape_chamber_commerce
        ]
        
        for source_func in sources:
            try:
                leads = source_func(industries, locations, employee_range, revenue_range)
                all_leads.extend(leads)
                time.sleep(2)  # Rate limiting
            except Exception as e:
                print(f"Error scraping from {source_func.__name__}: {e}")
                continue
        
        # Remove duplicates and score leads
        unique_leads = self.remove_duplicates(all_leads)
        scored_leads = self.score_leads(unique_leads)
        
        return scored_leads
    
    def scrape_google_maps(self, industries, locations, employee_range, revenue_range):
        """Scrape business listings from Google Maps"""
        leads = []
        
        for industry in industries:
            for location in locations:
                for query_template in self.search_queries:
                    query = query_template.format(industry=industry, location=location)
                    
                    try:
                        # Use Google Maps API or web scraping
                        search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
                        
                        # Setup Chrome driver
                        chrome_options = Options()
                        chrome_options.add_argument('--headless')
                        chrome_options.add_argument('--no-sandbox')
                        chrome_options.add_argument(f'--user-agent={self.ua.random}')
                        
                        driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
                        driver.get(search_url)
                        
                        # Wait for results to load
                        WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.CLASS_NAME, "hfpxzc"))
                        )
                        
                        # Extract business listings
                        listings = driver.find_elements(By.CSS_SELECTOR, "[data-result-index]")
                        
                        for listing in listings[:20]:  # Limit to first 20 results
                            try:
                                lead_data = self.extract_google_maps_data(listing, driver)
                                if lead_data:
                                    lead_data['source'] = 'google_maps'
                                    leads.append(lead_data)
                            except Exception as e:
                                continue
                        
                        driver.quit()
                        time.sleep(3)  # Rate limiting
                        
                    except Exception as e:
                        print(f"Error scraping Google Maps for {query}: {e}")
                        continue
        
        return leads
    
    def extract_google_maps_data(self, listing_element, driver):
        """Extract data from Google Maps listing"""
        try:
            # Click on listing to get details
            listing_element.click()
            time.sleep(2)
            
            # Extract company name
            name_element = driver.find_element(By.CSS_SELECTOR, "h1.DUwDvf")
            company_name = name_element.text if name_element else ""
            
            # Extract website
            website = ""
            try:
                website_element = driver.find_element(By.CSS_SELECTOR, "a[data-item-id='authority']")
                website = website_element.get_attribute("href")
            except:
                pass
            
            # Extract phone
            phone = ""
            try:
                phone_element = driver.find_element(By.CSS_SELECTOR, "button[data-item-id='phone:tel:']")
                phone = phone_element.text
            except:
                pass
            
            # Extract address
            address = ""
            try:
                address_element = driver.find_element(By.CSS_SELECTOR, "button[data-item-id='address']")
                address = address_element.text
            except:
                pass
            
            # Parse location
            city, state = self.parse_location(address)
            
            # Determine industry from business name/description
            industry = self.classify_industry(company_name)
            
            # Estimate employee count
            employee_count = self.estimate_employee_count(company_name, website)
            
            return {
                'company_name': company_name,
                'website': website,
                'phone': phone,
                'city': city,
                'state': state,
                'industry': industry,
                'employee_count': employee_count,
                'contact_name': self.find_contact_name(website),
                'email': self.find_email(website),
                'linkedin_url': self.find_linkedin_url(company_name, city, state),
                'pain_point_indicators': json.dumps(self.detect_pain_points(website, company_name)),
                'automation_level': self.assess_automation_level(website),
                'priority_score': 0  # Will be calculated later
            }
            
        except Exception as e:
            return None
    
    def scrape_yelp(self, industries, locations, employee_range, revenue_range):
        """Scrape business listings from Yelp"""
        leads = []
        
        for industry in industries:
            for location in locations:
                try:
                    # Yelp search URL
                    search_url = f"https://www.yelp.com/search?find_desc={industry}&find_loc={location}"
                    
                    headers = {
                        'User-Agent': self.ua.random,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    }
                    
                    response = requests.get(search_url, headers=headers)
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extract business listings
                    listings = soup.find_all('div', {'data-testid': 'serp-ia-card'})
                    
                    for listing in listings[:20]:
                        try:
                            lead_data = self.extract_yelp_data(listing)
                            if lead_data:
                                lead_data['source'] = 'yelp'
                                leads.append(lead_data)
                        except Exception as e:
                            continue
                    
                    time.sleep(2)  # Rate limiting
                    
                except Exception as e:
                    print(f"Error scraping Yelp for {industry} in {location}: {e}")
                    continue
        
        return leads
    
    def extract_yelp_data(self, listing_element):
        """Extract data from Yelp listing"""
        try:
            # Extract company name
            name_element = listing_element.find('a', {'data-testid': 'business-link'})
            company_name = name_element.text.strip() if name_element else ""
            
            # Extract website
            website = ""
            website_element = listing_element.find('a', href=re.compile(r'http'))
            if website_element:
                website = website_element['href']
            
            # Extract phone
            phone = ""
            phone_element = listing_element.find('span', string=re.compile(r'\d{3}-\d{3}-\d{4}'))
            if phone_element:
                phone = phone_element.text
            
            # Extract address
            address = ""
            address_element = listing_element.find('span', {'data-testid': 'address'})
            if address_element:
                address = address_element.text
            
            # Parse location
            city, state = self.parse_location(address)
            
            # Determine industry
            industry = self.classify_industry(company_name)
            
            # Estimate employee count
            employee_count = self.estimate_employee_count(company_name, website)
            
            return {
                'company_name': company_name,
                'website': website,
                'phone': phone,
                'city': city,
                'state': state,
                'industry': industry,
                'employee_count': employee_count,
                'contact_name': self.find_contact_name(website),
                'email': self.find_email(website),
                'linkedin_url': self.find_linkedin_url(company_name, city, state),
                'pain_point_indicators': json.dumps(self.detect_pain_points(website, company_name)),
                'automation_level': self.assess_automation_level(website),
                'priority_score': 0
            }
            
        except Exception as e:
            return None
    
    def scrape_linkedin(self, industries, locations, employee_range, revenue_range):
        """Scrape company pages from LinkedIn"""
        leads = []
        
        for industry in industries:
            for location in locations:
                try:
                    # LinkedIn company search
                    search_url = f"https://www.linkedin.com/search/results/companies/?keywords={industry}&location={location}"
                    
                    # Note: LinkedIn scraping requires authentication and may be against ToS
                    # This is a simplified version
                    
                    headers = {
                        'User-Agent': self.ua.random,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    }
                    
                    # For demo purposes, we'll create sample data
                    sample_company = f"Sample {industry.title()} Company"
                    
                    lead_data = {
                        'company_name': sample_company,
                        'website': f"https://www.{sample_company.lower().replace(' ', '')}.com",
                        'phone': '(555) 123-4567',
                        'city': location.split()[0],
                        'state': 'MO' if 'MO' in location else 'KS',
                        'industry': industry,
                        'employee_count': 25,
                        'contact_name': 'John Doe',
                        'email': 'john@example.com',
                        'linkedin_url': f"https://www.linkedin.com/company/{sample_company.lower().replace(' ', '-')}",
                        'pain_point_indicators': json.dumps(['manual processes']),
                        'automation_level': 'low',
                        'priority_score': 0,
                        'source': 'linkedin'
                    }
                    
                    leads.append(lead_data)
                    
                except Exception as e:
                    print(f"Error scraping LinkedIn for {industry} in {location}: {e}")
                    continue
        
        return leads
    
    def scrape_yellow_pages(self, industries, locations, employee_range, revenue_range):
        """Scrape business listings from Yellow Pages"""
        leads = []
        
        for industry in industries:
            for location in locations:
                try:
                    # Yellow Pages search URL
                    search_url = f"https://www.yellowpages.com/search?search_terms={industry}&geo_location_terms={location}"
                    
                    headers = {
                        'User-Agent': self.ua.random,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    }
                    
                    response = requests.get(search_url, headers=headers)
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extract business listings
                    listings = soup.find_all('div', class_='result')
                    
                    for listing in listings[:20]:
                        try:
                            lead_data = self.extract_yellow_pages_data(listing)
                            if lead_data:
                                lead_data['source'] = 'yellow_pages'
                                leads.append(lead_data)
                        except Exception as e:
                            continue
                    
                    time.sleep(2)  # Rate limiting
                    
                except Exception as e:
                    print(f"Error scraping Yellow Pages for {industry} in {location}: {e}")
                    continue
        
        return leads
    
    def extract_yellow_pages_data(self, listing_element):
        """Extract data from Yellow Pages listing"""
        try:
            # Extract company name
            name_element = listing_element.find('a', class_='business-name')
            company_name = name_element.text.strip() if name_element else ""
            
            # Extract website
            website = ""
            website_element = listing_element.find('a', class_='track-visit-website')
            if website_element:
                website = website_element['href']
            
            # Extract phone
            phone = ""
            phone_element = listing_element.find('div', class_='phones phone primary')
            if phone_element:
                phone = phone_element.text.strip()
            
            # Extract address
            address = ""
            address_element = listing_element.find('div', class_='street-address')
            if address_element:
                address = address_element.text.strip()
            
            # Parse location
            city, state = self.parse_location(address)
            
            # Determine industry
            industry = self.classify_industry(company_name)
            
            # Estimate employee count
            employee_count = self.estimate_employee_count(company_name, website)
            
            return {
                'company_name': company_name,
                'website': website,
                'phone': phone,
                'city': city,
                'state': state,
                'industry': industry,
                'employee_count': employee_count,
                'contact_name': self.find_contact_name(website),
                'email': self.find_email(website),
                'linkedin_url': self.find_linkedin_url(company_name, city, state),
                'pain_point_indicators': json.dumps(self.detect_pain_points(website, company_name)),
                'automation_level': self.assess_automation_level(website),
                'priority_score': 0
            }
            
        except Exception as e:
            return None
    
    def scrape_chamber_commerce(self, industries, locations, employee_range, revenue_range):
        """Scrape Chamber of Commerce member lists"""
        leads = []
        
        # This would require specific Chamber of Commerce websites
        # For demo purposes, we'll create sample data
        
        for industry in industries:
            for location in locations:
                sample_company = f"{location} {industry.title()} Chamber Member"
                
                lead_data = {
                    'company_name': sample_company,
                    'website': f"https://www.{sample_company.lower().replace(' ', '')}.com",
                    'phone': '(555) 987-6543',
                    'city': location.split()[0],
                    'state': 'MO' if 'MO' in location else 'KS',
                    'industry': industry,
                    'employee_count': 30,
                    'contact_name': 'Jane Smith',
                    'email': 'jane@example.com',
                    'linkedin_url': f"https://www.linkedin.com/company/{sample_company.lower().replace(' ', '-')}",
                    'pain_point_indicators': json.dumps(['paper-based systems']),
                    'automation_level': 'low',
                    'priority_score': 0,
                    'source': 'chamber_commerce'
                }
                
                leads.append(lead_data)
        
        return leads
    
    def parse_location(self, address):
        """Parse city and state from address"""
        if not address:
            return "", ""
        
        # Simple parsing - in production, use a proper address parser
        parts = address.split(',')
        if len(parts) >= 2:
            city = parts[0].strip()
            state = parts[1].strip().split()[0] if parts[1].strip() else ""
            return city, state
        
        return "", ""
    
    def classify_industry(self, company_name):
        """Classify industry based on company name"""
        company_lower = company_name.lower()
        
        industry_keywords = {
            'manufacturing': ['manufacturing', 'factory', 'production'],
            'woodworking': ['woodworking', 'cabinets', 'furniture'],
            'metal fabrication': ['metal', 'fabrication', 'welding'],
            'construction': ['construction', 'contractor', 'building'],
            'logistics': ['logistics', 'shipping', 'transportation'],
            'healthcare': ['medical', 'healthcare', 'clinic'],
            'dental': ['dental', 'dentist'],
            'law': ['law', 'attorney', 'legal'],
            'accounting': ['accounting', 'cpa', 'tax'],
            'real estate': ['real estate', 'realtor', 'property'],
            'retail': ['retail', 'store', 'shop'],
            'restaurant': ['restaurant', 'cafe', 'dining'],
            'auto repair': ['auto', 'car', 'repair', 'mechanic'],
            'landscaping': ['landscaping', 'lawn', 'garden'],
            'cleaning': ['cleaning', 'janitorial', 'maintenance'],
            'consulting': ['consulting', 'consultant', 'advisory']
        }
        
        for industry, keywords in industry_keywords.items():
            if any(keyword in company_lower for keyword in keywords):
                return industry
        
        return 'professional services'
    
    def estimate_employee_count(self, company_name, website):
        """Estimate employee count based on company name and website"""
        # This is a simplified estimation
        # In production, you'd use more sophisticated methods
        
        # Check for size indicators in company name
        size_indicators = {
            'small': 15,
            'medium': 30,
            'large': 50,
            'family': 20,
            'boutique': 10,
            'enterprise': 100
        }
        
        company_lower = company_name.lower()
        for indicator, count in size_indicators.items():
            if indicator in company_lower:
                return count
        
        # Default to middle of target range
        return 25
    
    def find_contact_name(self, website):
        """Find contact name from website"""
        if not website:
            return ""
        
        try:
            headers = {'User-Agent': self.ua.random}
            response = requests.get(website, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for common contact name patterns
            contact_patterns = [
                'about us', 'team', 'contact', 'leadership',
                'owner', 'president', 'ceo', 'founder'
            ]
            
            for pattern in contact_patterns:
                elements = soup.find_all(text=re.compile(pattern, re.I))
                for element in elements:
                    # Look for names in nearby elements
                    parent = element.parent
                    if parent:
                        text = parent.get_text()
                        # Simple name extraction (in production, use NLP)
                        words = text.split()
                        for i, word in enumerate(words):
                            if word.lower() in ['owner', 'president', 'ceo', 'founder']:
                                if i + 1 < len(words):
                                    return f"{words[i+1]} {words[i+2]}" if i + 2 < len(words) else words[i+1]
            
        except Exception as e:
            pass
        
        return ""
    
    def find_email(self, website):
        """Find email address from website"""
        if not website:
            return ""
        
        try:
            headers = {'User-Agent': self.ua.random}
            response = requests.get(website, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for email patterns
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, response.text)
            
            if emails:
                return emails[0]
            
        except Exception as e:
            pass
        
        return ""
    
    def find_linkedin_url(self, company_name, city, state):
        """Find LinkedIn company page URL"""
        # This would require LinkedIn API or search
        # For demo purposes, return a constructed URL
        company_slug = company_name.lower().replace(' ', '-').replace('&', 'and')
        return f"https://www.linkedin.com/company/{company_slug}"
    
    def detect_pain_points(self, website, company_name):
        """Detect pain points from website content and company name"""
        pain_points = []
        
        if not website:
            return pain_points
        
        try:
            headers = {'User-Agent': self.ua.random}
            response = requests.get(website, headers=headers, timeout=10)
            content = response.text.lower()
            
            pain_point_indicators = [
                'manual processes', 'spreadsheet', 'paper-based',
                'looking for efficiency', 'growing team', 'hiring',
                'overwhelmed', 'need better organization',
                'traditional', 'family-owned', 'established'
            ]
            
            for indicator in pain_point_indicators:
                if indicator in content:
                    pain_points.append(indicator)
            
        except Exception as e:
            pass
        
        return pain_points
    
    def assess_automation_level(self, website):
        """Assess automation level based on website and company characteristics"""
        if not website:
            return 'low'
        
        try:
            headers = {'User-Agent': self.ua.random}
            response = requests.get(website, headers=headers, timeout=10)
            content = response.text.lower()
            
            # Check for automation indicators
            automation_indicators = [
                'automated', 'digital', 'tech-enabled', 'software',
                'platform', 'api', 'integration', 'cloud'
            ]
            
            automation_count = sum(1 for indicator in automation_indicators if indicator in content)
            
            if automation_count >= 3:
                return 'high'
            elif automation_count >= 1:
                return 'medium'
            else:
                return 'low'
            
        except Exception as e:
            return 'low'
    
    def remove_duplicates(self, leads):
        """Remove duplicate leads based on company name and location"""
        seen = set()
        unique_leads = []
        
        for lead in leads:
            key = (lead['company_name'].lower(), lead['city'].lower(), lead['state'].lower())
            if key not in seen:
                seen.add(key)
                unique_leads.append(lead)
        
        return unique_leads
    
    def score_leads(self, leads):
        """Score leads based on various factors"""
        for lead in leads:
            score = self.scorer.calculate_score(lead)
            lead['priority_score'] = score
        
        # Sort by priority score
        leads.sort(key=lambda x: x['priority_score'], reverse=True)
        return leads