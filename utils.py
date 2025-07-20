import re
import requests
from email_validator import validate_email, EmailNotValidError
import json

class LeadScorer:
    """Class for scoring leads based on various criteria"""
    
    def __init__(self):
        # Scoring weights for different factors
        self.weights = {
            'employee_count': 0.15,
            'automation_level': 0.25,
            'pain_points': 0.30,
            'industry': 0.10,
            'location': 0.10,
            'contact_info': 0.10
        }
        
        # Industry priority scores
        self.industry_scores = {
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
        
        # Location priority scores (Kansas City metro focus)
        self.location_scores = {
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
    
    def calculate_score(self, lead):
        """Calculate priority score for a lead (0-100)"""
        score = 0
        
        # Employee count score (target: 10-50 employees)
        employee_score = self.score_employee_count(lead.get('employee_count', 0))
        score += employee_score * self.weights['employee_count']
        
        # Automation level score (lower automation = higher score)
        automation_score = self.score_automation_level(lead.get('automation_level', 'unknown'))
        score += automation_score * self.weights['automation_level']
        
        # Pain points score
        pain_points_score = self.score_pain_points(lead.get('pain_point_indicators', '[]'))
        score += pain_points_score * self.weights['pain_points']
        
        # Industry score
        industry_score = self.score_industry(lead.get('industry', ''))
        score += industry_score * self.weights['industry']
        
        # Location score
        location_score = self.score_location(lead.get('city', ''))
        score += location_score * self.weights['location']
        
        # Contact info score
        contact_score = self.score_contact_info(lead)
        score += contact_score * self.weights['contact_info']
        
        return int(score)
    
    def score_employee_count(self, count):
        """Score based on employee count (target: 10-50)"""
        if not count:
            return 50
        
        if 10 <= count <= 50:
            return 100
        elif 5 <= count <= 60:
            return 80
        elif count < 5:
            return 30
        else:
            return 20
    
    def score_automation_level(self, level):
        """Score based on automation level (lower = higher score)"""
        automation_scores = {
            'low': 100,
            'medium': 60,
            'high': 20,
            'unknown': 50
        }
        return automation_scores.get(level.lower(), 50)
    
    def score_pain_points(self, pain_points_str):
        """Score based on pain point indicators"""
        try:
            pain_points = json.loads(pain_points_str) if isinstance(pain_points_str, str) else pain_points_str
        except:
            pain_points = []
        
        if not pain_points:
            return 30
        
        # High-value pain points
        high_value = ['manual processes', 'spreadsheet tracking', 'paper-based systems', 'overwhelmed with paperwork']
        # Medium-value pain points
        medium_value = ['looking for efficiency', 'growing team', 'hiring', 'need better organization']
        # Low-value pain points
        low_value = ['traditional', 'family-owned', 'established']
        
        score = 0
        for point in pain_points:
            point_lower = point.lower()
            if any(hv in point_lower for hv in high_value):
                score += 25
            elif any(mv in point_lower for mv in medium_value):
                score += 15
            elif any(lv in point_lower for lv in low_value):
                score += 5
        
        return min(score, 100)
    
    def score_industry(self, industry):
        """Score based on industry priority"""
        return self.industry_scores.get(industry.lower(), 50)
    
    def score_location(self, city):
        """Score based on location priority"""
        for location, score in self.location_scores.items():
            if location.lower() in city.lower():
                return score
        return 50
    
    def score_contact_info(self, lead):
        """Score based on completeness of contact information"""
        score = 0
        
        # Email (most important)
        if lead.get('email'):
            score += 40
        # Phone
        if lead.get('phone'):
            score += 25
        # Contact name
        if lead.get('contact_name'):
            score += 20
        # Website
        if lead.get('website'):
            score += 15
        
        return score

class EmailValidator:
    """Class for email validation and verification"""
    
    def __init__(self):
        self.validated_emails = {}
    
    def validate_email(self, email):
        """Validate email format"""
        if not email:
            return False
        
        try:
            validate_email(email)
            return True
        except EmailNotValidError:
            return False
    
    def verify_email(self, email):
        """Verify if email exists (basic check)"""
        if not self.validate_email(email):
            return False
        
        # Check if we've already verified this email
        if email in self.validated_emails:
            return self.validated_emails[email]
        
        # Basic verification (in production, use a proper email verification service)
        # This is a simplified check - real verification would use services like:
        # - Hunter.io
        # - NeverBounce
        # - ZeroBounce
        # - EmailListVerify
        
        # For demo purposes, we'll do basic format checking
        is_valid = self.validate_email(email)
        self.validated_emails[email] = is_valid
        
        return is_valid
    
    def find_company_email(self, company_name, contact_name, website):
        """Generate possible email addresses for a contact"""
        if not contact_name or not company_name:
            return []
        
        # Clean company name for domain
        domain = self.extract_domain(website) if website else self.generate_domain(company_name)
        
        if not domain:
            return []
        
        # Parse contact name
        name_parts = contact_name.lower().split()
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        
        # Common email patterns
        patterns = [
            f"{first_name}@{domain}",
            f"{first_name}.{last_name}@{domain}",
            f"{first_name}{last_name}@{domain}",
            f"{first_name[0]}{last_name}@{domain}",
            f"{first_name}_{last_name}@{domain}",
            f"{contact_name.lower().replace(' ', '.')}@{domain}",
            f"{contact_name.lower().replace(' ', '')}@{domain}"
        ]
        
        return [email for email in patterns if self.validate_email(email)]
    
    def extract_domain(self, website):
        """Extract domain from website URL"""
        if not website:
            return None
        
        # Remove protocol
        domain = website.replace('http://', '').replace('https://', '')
        
        # Remove path
        domain = domain.split('/')[0]
        
        # Remove www
        domain = domain.replace('www.', '')
        
        return domain
    
    def generate_domain(self, company_name):
        """Generate domain from company name"""
        if not company_name:
            return None
        
        # Clean company name
        clean_name = re.sub(r'[^\w\s]', '', company_name.lower())
        words = clean_name.split()
        
        # Common domain patterns
        patterns = [
            f"{clean_name.replace(' ', '')}.com",
            f"{words[0]}{words[-1]}.com" if len(words) > 1 else f"{words[0]}.com",
            f"{'-'.join(words)}.com"
        ]
        
        return patterns[0] if patterns else None

class DataEnricher:
    """Class for enriching lead data with additional information"""
    
    def __init__(self):
        self.enrichment_cache = {}
    
    def enrich_company_data(self, lead):
        """Enrich company data with additional information"""
        company_name = lead.get('company_name', '')
        
        if not company_name:
            return lead
        
        # Check cache first
        if company_name in self.enrichment_cache:
            enriched_data = self.enrichment_cache[company_name]
            lead.update(enriched_data)
            return lead
        
        # Enrich with additional data
        enriched_data = {
            'revenue_estimate': self.estimate_revenue(lead),
            'founded_year': self.find_founded_year(lead),
            'social_media_presence': self.check_social_media(lead),
            'technology_stack': self.identify_tech_stack(lead),
            'growth_indicators': self.identify_growth_indicators(lead)
        }
        
        # Cache the results
        self.enrichment_cache[company_name] = enriched_data
        lead.update(enriched_data)
        
        return lead
    
    def estimate_revenue(self, lead):
        """Estimate company revenue based on industry and employee count"""
        employee_count = lead.get('employee_count', 25)
        industry = lead.get('industry', 'professional services')
        
        # Average revenue per employee by industry
        revenue_per_employee = {
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
        
        avg_revenue = revenue_per_employee.get(industry, 120000)
        estimated_revenue = employee_count * avg_revenue
        
        return estimated_revenue
    
    def find_founded_year(self, lead):
        """Find company founded year from website or other sources"""
        website = lead.get('website', '')
        if not website:
            return None
        
        try:
            # This would require web scraping to find founding year
            # For demo purposes, return None
            return None
        except:
            return None
    
    def check_social_media(self, lead):
        """Check social media presence"""
        company_name = lead.get('company_name', '')
        website = lead.get('website', '')
        
        social_media = {
            'linkedin': False,
            'facebook': False,
            'twitter': False,
            'instagram': False
        }
        
        # Check for social media links on website
        if website:
            try:
                # This would require web scraping
                # For demo purposes, return basic structure
                pass
            except:
                pass
        
        return social_media
    
    def identify_tech_stack(self, lead):
        """Identify technology stack from website"""
        website = lead.get('website', '')
        if not website:
            return []
        
        try:
            # This would require web scraping and technology detection
            # For demo purposes, return empty list
            return []
        except:
            return []
    
    def identify_growth_indicators(self, lead):
        """Identify growth indicators"""
        indicators = []
        
        # Check for hiring indicators
        if lead.get('pain_point_indicators'):
            pain_points = json.loads(lead.get('pain_point_indicators', '[]'))
            if any('hiring' in point.lower() for point in pain_points):
                indicators.append('hiring')
        
        # Check for expansion indicators
        if lead.get('automation_level') == 'low':
            indicators.append('manual_processes')
        
        return indicators

class ExportFormatter:
    """Class for formatting data for export"""
    
    def __init__(self):
        self.csv_headers = [
            'Company_Name', 'Contact_Name', 'Email', 'Phone', 'Website',
            'Employees', 'Industry', 'Location', 'Pain_Point_Indicators',
            'Automation_Level', 'Priority_Score', 'Revenue_Estimate',
            'LinkedIn_URL', 'Source', 'Created_Date'
        ]
    
    def format_for_csv(self, leads):
        """Format leads for CSV export"""
        formatted_data = []
        
        for lead in leads:
            row = {
                'Company_Name': lead.get('company_name', ''),
                'Contact_Name': lead.get('contact_name', ''),
                'Email': lead.get('email', ''),
                'Phone': lead.get('phone', ''),
                'Website': lead.get('website', ''),
                'Employees': lead.get('employee_count', ''),
                'Industry': lead.get('industry', ''),
                'Location': f"{lead.get('city', '')}, {lead.get('state', '')}",
                'Pain_Point_Indicators': self.format_pain_points(lead.get('pain_point_indicators', '[]')),
                'Automation_Level': lead.get('automation_level', ''),
                'Priority_Score': lead.get('priority_score', ''),
                'Revenue_Estimate': lead.get('revenue_estimate', ''),
                'LinkedIn_URL': lead.get('linkedin_url', ''),
                'Source': lead.get('source', ''),
                'Created_Date': lead.get('created_at', '')
            }
            formatted_data.append(row)
        
        return formatted_data
    
    def format_pain_points(self, pain_points_str):
        """Format pain points for CSV"""
        try:
            pain_points = json.loads(pain_points_str) if isinstance(pain_points_str, str) else pain_points_str
            return '; '.join(pain_points)
        except:
            return ''
    
    def format_for_crm(self, leads, crm_type='salesforce'):
        """Format leads for CRM import"""
        if crm_type == 'salesforce':
            return self.format_for_salesforce(leads)
        elif crm_type == 'hubspot':
            return self.format_for_hubspot(leads)
        else:
            return self.format_for_csv(leads)
    
    def format_for_salesforce(self, leads):
        """Format leads for Salesforce import"""
        # Salesforce specific formatting
        return self.format_for_csv(leads)
    
    def format_for_hubspot(self, leads):
        """Format leads for HubSpot import"""
        # HubSpot specific formatting
        return self.format_for_csv(leads)