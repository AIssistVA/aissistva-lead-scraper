const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const competitorRoutes = require('./routes/competitors');
const opportunityRoutes = require('./routes/opportunities');
const prospectRoutes = require('./routes/prospects');
const analyticsRoutes = require('./routes/analytics');
const alertsRoutes = require('./routes/alerts');

// Import services
const DataEnrichmentService = require('./services/DataEnrichmentService');
const LeadScoringService = require('./services/LeadScoringService');
const CompetitiveIntelligenceService = require('./services/CompetitiveIntelligenceService');
const AlertService = require('./services/AlertService');
const DataScrapingService = require('./services/DataScrapingService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/market-intelligence', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/prospects', prospectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertsRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-dashboard', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined dashboard`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Initialize services
const dataEnrichmentService = new DataEnrichmentService();
const leadScoringService = new LeadScoringService();
const competitiveIntelligenceService = new CompetitiveIntelligenceService();
const alertService = new AlertService(io);
const dataScrapingService = new DataScrapingService();

// Scheduled tasks
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled data enrichment...');
  try {
    await dataEnrichmentService.enrichAllLeads();
    await leadScoringService.updateAllScores();
    await competitiveIntelligenceService.updateCompetitorData();
    console.log('Scheduled tasks completed successfully');
  } catch (error) {
    console.error('Scheduled tasks error:', error);
  }
});

cron.schedule('0 */2 * * *', async () => {
  console.log('Running competitive intelligence update...');
  try {
    await competitiveIntelligenceService.monitorCompetitors();
    await alertService.checkForAlerts();
    console.log('Competitive intelligence update completed');
  } catch (error) {
    console.error('Competitive intelligence update error:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Catch all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;