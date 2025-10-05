import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Lazy load pages
const LibraryLanding = lazy(() => import('./pages/LibraryLanding'));
const BrowsePapers = lazy(() => import('./pages/BrowsePapers'));
const PaperDetail = lazy(() => import('./pages/PaperDetail'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const WorkspaceDashboard = lazy(() => import('./pages/WorkspaceDashboard'));
const PaperEditor = lazy(() => import('./pages/PaperEditor'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const About = lazy(() => import('./pages/About'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ResearchCommunities = lazy(() => import('./pages/ResearchCommunities').then(m => ({ default: m.ResearchCommunities })));
const TrendingResearch = lazy(() => import('./pages/TrendingResearch').then(m => ({ default: m.TrendingResearch })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
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
      {/* Redirect unimplemented pages to home */}
      <Route path="/learning-paths" element={<Navigate to="/" replace />} />
      <Route path="/tools" element={<Navigate to="/" replace />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
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
    </Suspense>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}