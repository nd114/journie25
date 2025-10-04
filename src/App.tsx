import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import LibraryLanding from './pages/LibraryLanding';
import BrowsePapers from './pages/BrowsePapers';
import PaperDetail from './pages/PaperDetail';
import AuthPage from './pages/AuthPage';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import PaperEditor from './pages/PaperEditor';
import UserProfile from './pages/UserProfile';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import { ResearchCommunities } from './pages/ResearchCommunities';
import { TrendingResearch } from './pages/TrendingResearch';
import { LearningPaths } from './pages/LearningPaths';
import { ResearchTools } from './pages/ResearchTools';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LibraryLanding />} />
      <Route path="/library" element={<BrowsePapers />} />
      <Route path="/paper/:id" element={<PaperDetail />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/communities" element={<ResearchCommunities />} />
      <Route path="/trending" element={<TrendingResearch />} />
      <Route path="/learning-paths" element={<LearningPaths />} />
      <Route path="/tools" element={<ResearchTools />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <WorkspaceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/editor/:id?"
        element={
          <ProtectedRoute>
            <PaperEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}