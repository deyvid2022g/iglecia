import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { SermonsPage } from './pages/PredicasPage';
import { BlogPage } from './pages/BlogPage';
import { DonatePage } from './pages/DonatePage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AgeGroupPage } from './pages/AgeGroupPage';
import { SermonDetailPage } from './pages/PredicaDetailPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { BlogPostPage } from './pages/BlogPostPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-black font-inter">
          <Header />
          <main role="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/eventos" element={<EventsPage />} />
              <Route path="/eventos/:slug" element={<EventDetailPage />} />
              <Route path="/predicas" element={<SermonsPage />} />
              <Route path="/predicas/:slug" element={<SermonDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/donar" element={<DonatePage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
              <Route path="/grupos/:ageGroup" element={<AgeGroupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;