import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { PredicasPage } from './pages/PredicasPage';
import { BlogPage } from './pages/BlogPage';
import { DonatePage } from './pages/DonatePage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AgeGroupPage } from './pages/AgeGroupPage';
import { ZonaKidsPage } from './pages/ZonaKidsPage';
import { FamiliasPage } from './pages/FamiliasPage';
import { ParejasPage } from './pages/ParejasPage';
import { AlabanzaPage } from './pages/AlabanzaPage';
import { DanzaPage } from './pages/DanzaPage';
import { ProduccionPage } from './pages/ProduccionPage';
import { CaballerosPage } from './pages/CaballerosPage';
import { MujeresPage } from './pages/MujeresPage';
import { SermonDetailPage } from './pages/PredicaDetailPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { BlogPostPage } from './pages/BlogPostPage';
import AdminPage from './pages/AdminPage';
import { useScrollToTop } from './hooks/useScrollToTop';
import './index.css';

function App() {
  return (
    <FirebaseAuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white text-black font-inter">
          <Header />
          <main role="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/eventos" element={<EventsPage />} />
              <Route path="/eventos/:slug" element={<EventDetailPage />} />
              <Route path="/predicas" element={<PredicasPage />} />
              <Route path="/predicas/:slug" element={<SermonDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/donar" element={<DonatePage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/nosotros" element={<AboutPage />} />
              <Route path="/grupos/:ageGroup" element={<AgeGroupPage />} />
              <Route path="/zona-kids" element={<ZonaKidsPage />} />
              <Route path="/familias" element={<FamiliasPage />} />
              <Route path="/parejas" element={<ParejasPage />} />
              <Route path="/alabanza" element={<AlabanzaPage />} />
              <Route path="/danza" element={<DanzaPage />} />
              <Route path="/produccion" element={<ProduccionPage />} />
              <Route path="/caballeros" element={<CaballerosPage />} />
              <Route path="/mujeres" element={<MujeresPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </FirebaseAuthProvider>
  );
}

function ScrollToTop() {
  useScrollToTop();
  return null;
}

export default App;