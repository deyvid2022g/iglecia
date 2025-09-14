import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/eventos', label: 'Eventos' },
    { href: '/predicas', label: 'Prédicas' },
    { href: '/blog', label: 'Blog' },
    { href: '/contacto', label: 'Contacto' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };



  return (
    <header 
      role="banner" 
      className={`fixed w-full top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 focus-ring"
            aria-label="Lugar de Refugio - Inicio"
          >
            <img 
              src="/trabajo.png" 
              alt="Lugar de Refugio" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
            <span className="hidden sm:block font-semibold text-lg">
              Lugar de Refugio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            role="navigation" 
            aria-label="Navegación principal"
            className="hidden md:flex items-center space-x-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-4 py-2 rounded-lg transition-colors duration-150 focus-ring ${
                  location.pathname === item.href
                    ? 'bg-gray-100 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex items-center space-x-2 ml-4">
              <Link
                to="/donar"
                className="btn-primary"
              >
                Donacion
              </Link>
              
              {/* Auth Section */}
              {!loading && (
                <div className="flex items-center space-x-2">
                  {isAuthenticated ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 focus-ring"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
                        </span>
                      </button>
                      
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={async () => {
                              await signOut();
                              setShowUserMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-ring"
                    >
                      <User className="w-4 h-4" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 focus-ring"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 top-16 bg-white transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav 
          role="navigation" 
          aria-label="Navegación móvil"
          className="px-4 py-8 space-y-2"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`block px-4 py-3 rounded-lg transition-colors duration-150 text-lg ${
                location.pathname === item.href
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="pt-4 space-y-2">
            <Link
              to="/donar"
              className="btn-primary w-full justify-center"
            >
              Donacion
            </Link>
            
            {/* Mobile Auth Section */}
            {!loading && (
              <div className="pt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await signOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors justify-center"
                  >
                    <User className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
      
      {/* Overlay para cerrar menús al hacer click fuera */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}