import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

// Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import LeadIntelligence from './components/leads/LeadIntelligence';
import CompetitiveIntelligence from './components/competitors/CompetitiveIntelligence';
import MarketOpportunities from './components/opportunities/MarketOpportunities';
import ProspectResearch from './components/prospects/ProspectResearch';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/Settings';

// Hooks
import { useSocket } from './hooks/useSocket';
import { useAuth } from './hooks/useAuth';

// Store
import { useAppStore } from './store/appStore';

// Utils
import { cn } from './utils/cn';

function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { socket, connected } = useSocket();
  const { setSocket, setConnected } = useAppStore();

  // Update socket in store
  useEffect(() => {
    if (socket) {
      setSocket(socket);
      setConnected(connected);
    }
  }, [socket, connected, setSocket, setConnected]);

  // Join user to dashboard room when connected
  useEffect(() => {
    if (socket && user && connected) {
      socket.emit('join-dashboard', user.id);
    }
  }, [socket, user, connected]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Market Intelligence Platform
            </h1>
            <p className="text-gray-600 mb-8">
              Please log in to access your dashboard
            </p>
            <button className="btn-primary w-full">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Market Intelligence Platform</title>
        <meta name="description" content="Comprehensive market intelligence and lead generation platform" />
      </Helmet>

      <div className="h-screen flex overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/leads" element={<LeadIntelligence />} />
                  <Route path="/competitors" element={<CompetitiveIntelligence />} />
                  <Route path="/opportunities" element={<MarketOpportunities />} />
                  <Route path="/prospects" element={<ProspectResearch />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Connection status indicator */}
      {!connected && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Reconnecting...</span>
          </div>
        </div>
      )}
    </>
  );
}

export default App;