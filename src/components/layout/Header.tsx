import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { AnimatedLogo } from '../AnimatedLogo';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  // Función para determinar si el usuario es administrador
  const isAdmin = () => {
    if (!user) return false;
    return user.email?.includes('admin') || user.email === 'camplaygo@gmail.com';
  };

  // Función para obtener el rol del usuario
  const getUserRole = () => {
    return isAdmin() ? 'Admin' : 'Usuario';
  };

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
            <AnimatedLogo className="w-8 h-8" />
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
            
            {user ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus-ring"
                >
                  <img
                    src="/default-avatar.svg"
                    alt="Usuario"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/default-avatar.svg';
                    }}
                  />
                  <span className="hidden lg:block text-sm font-medium">{user?.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-500">{getUserRole()}</p>
                    </div>
                    {isAdmin() ? (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span>Panel de Control</span>
                      </Link>
                    ) : null}
                    <Link
                      to="/donar"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>Donación</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to="/login"
                  className="btn-secondary"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/donar"
                  className="btn-primary"
                >
                  Donacion
                </Link>
              </div>
            )}
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
            {user ? (
              <>
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <img
                    src="/default-avatar.svg"
                    alt="Usuario"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-sm text-gray-600">{getUserRole()}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 rounded-lg text-lg hover:bg-gray-50"
                >
                  Panel de Control
                </Link>
                <Link
                  to="/donar"
                  className="btn-primary w-full justify-center"
                >
                  Donacion
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary w-full justify-center"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary w-full justify-center"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/donar"
                  className="btn-primary w-full justify-center"
                >
                  Sembrar
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
      
      {/* Overlay para cerrar menús al hacer click fuera */}
      {(isMenuOpen || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsMenuOpen(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}