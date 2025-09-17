import { Routes, Route } from 'react-router-dom';

// Importar componentes
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Importar páginas
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { EventsPage } from './pages/EventsPage';
import { ContactPage } from './pages/ContactPage';
import { ZonaKidsPage } from './pages/ZonaKidsPage';
import { FamiliasPage } from './pages/FamiliasPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/zona-kids" element={<ZonaKidsPage />} />
        <Route path="/familias" element={<FamiliasPage />} />
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
      <Footer />
    </main>
  );
}

export default App;