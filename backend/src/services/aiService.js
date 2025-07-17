const OpenAI = require('openai');
const { logger } = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async qualifyLead(companyData) {
    try {
      const prompt = this.buildQualificationPrompt(companyData);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert business analyst specializing in identifying automation opportunities for small to medium businesses. Analyze the provided business information and score their potential for AI automation services."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const analysis = response.choices[0].message.content;
      return this.parseQualificationResponse(analysis);
    } catch (error) {
      logger.error(`Error qualifying lead: ${error.message}`);
      return {
        score: 5,
        painPoints: [],
        opportunities: [],
        insights: "Unable to analyze due to technical error"
      };
    }
  }

  buildQualificationPrompt(companyData) {
    return `
Analyze this business for AI automation opportunities:

Company: ${companyData.company_name}
Industry: ${companyData.industry || 'Unknown'}
Website: ${companyData.website || 'N/A'}
Employee Count: ${companyData.employee_count || 'Unknown'}
Technology Stack: ${companyData.technology_stack || 'Unknown'}
Address: ${companyData.address || 'N/A'}

Please provide:
1. Lead Score (1-10): Rate their potential for AI automation services
2. Pain Points: List specific manual processes or inefficiencies
3. Automation Opportunities: Specific AI solutions that could help
4. Growth Signals: Indicators of business growth or expansion
5. Revenue Estimate: Based on available data
6. Decision Maker Insights: Best approach for outreach

Format your response as JSON:
{
  "score": number,
  "painPoints": ["point1", "point2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "growthSignals": ["signal1", "signal2"],
  "revenueEstimate": "string",
  "insights": "string",
  "recommendedApproach": "string"
}
    `;
  }

  parseQualificationResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return {
        score: this.extractScore(response),
        painPoints: this.extractList(response, 'pain points'),
        opportunities: this.extractList(response, 'opportunities'),
        growthSignals: this.extractList(response, 'growth signals'),
        revenueEstimate: this.extractRevenue(response),
        insights: response,
        recommendedApproach: this.extractApproach(response)
      };
    } catch (error) {
      logger.error(`Error parsing AI response: ${error.message}`);
      return {
        score: 5,
        painPoints: [],
        opportunities: [],
        insights: response
      };
    }
  }

  extractScore(text) {
    const scoreMatch = text.match(/score[:\s]*(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 5;
  }

  extractList(text, keyword) {
    const regex = new RegExp(`${keyword}[:\s]*\\[([^\\]]+)\\]`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].split(',').map(item => item.trim().replace(/['"]/g, ''));
    }
    return [];
  }

  extractRevenue(text) {
    const revenueMatch = text.match(/revenue[:\s]*([^,\n]+)/i);
    return revenueMatch ? revenueMatch[1].trim() : 'Unknown';
  }

  extractApproach(text) {
    const approachMatch = text.match(/approach[:\s]*([^,\n]+)/i);
    return approachMatch ? approachMatch[1].trim() : 'Direct outreach';
  }

  async generateOutreachContent(leadData) {
    try {
      const prompt = `
Generate personalized outreach content for this business:

Company: ${leadData.company_name}
Industry: ${leadData.industry}
Pain Points: ${leadData.pain_points?.join(', ') || 'Unknown'}
Automation Opportunities: ${leadData.automation_opportunities?.join(', ') || 'Unknown'}
Lead Score: ${leadData.lead_score}/10

Create:
1. A compelling subject line for email outreach
2. A personalized email template (150-200 words)
3. Key talking points for a phone call
4. LinkedIn connection request message

Format as JSON:
{
  "subjectLine": "string",
  "emailTemplate": "string",
  "talkingPoints": ["point1", "point2"],
  "linkedinMessage": "string"
}
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert sales professional specializing in AI automation services. Create compelling, personalized outreach content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { emailTemplate: content };
    } catch (error) {
      logger.error(`Error generating outreach content: ${error.message}`);
      return {
        subjectLine: "AI Automation Opportunity for Your Business",
        emailTemplate: "I'd like to discuss how AI automation could benefit your business...",
        talkingPoints: ["Automation opportunities", "Cost savings", "Efficiency gains"],
        linkedinMessage: "I'd love to connect and discuss AI automation opportunities for your business."
      };
    }
  }

  async enrichLeadData(leadData) {
    try {
      const prompt = `
Enrich this lead data with additional insights:

Company: ${leadData.company_name}
Industry: ${leadData.industry}
Website: ${leadData.website}

Provide:
1. Estimated employee count range
2. Annual revenue range
3. Technology stack analysis
4. Social media presence
5. Recent business news or growth indicators

Format as JSON:
{
  "employeeCount": "string",
  "revenueRange": "string",
  "techStack": ["tech1", "tech2"],
  "socialMedia": {"linkedin": "url", "facebook": "url"},
  "growthIndicators": ["indicator1", "indicator2"]
}
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a business intelligence analyst. Provide accurate estimates and insights based on available data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const enrichment = response.choices[0].message.content;
      const jsonMatch = enrichment.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      logger.error(`Error enriching lead data: ${error.message}`);
      return {};
    }
  }
}

module.exports = AIService;