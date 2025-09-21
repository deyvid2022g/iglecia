import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { RealtimeProvider } from './contexts/RealtimeContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { EventsPage } from './pages/EventsPage'
import { PredicasPage } from './pages/PredicasPage'
import { PredicaDetailPage } from './pages/PredicaDetailPage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { DonatePage } from './pages/DonatePage'
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <RealtimeProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/eventos" element={<EventsPage />} />
              <Route path="/sermons" element={<PredicasPage />} />
              <Route path="/predicas" element={<PredicasPage />} />
              <Route path="/sermons/:slug" element={<PredicaDetailPage />} />
              <Route path="/predicas/:slug" element={<PredicaDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/donar" element={<DonatePage />} />
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
      </RealtimeProvider>
    </ErrorBoundary>
  )
}

export default App