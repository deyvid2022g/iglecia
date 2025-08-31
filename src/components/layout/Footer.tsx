import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo y Descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/trabajo.png" 
                alt="Lugar de Refugio" 
                className="w-10 h-10 object-contain bg-white rounded-full p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
              />
              <span className="font-semibold text-lg">Lugar de Refugio</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Una familia espiritual donde experimentas la presencia de Dios, descubres tu propósito divino y vives la excelencia del Reino.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/watch/lugarderefugioad/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors focus-ring-white"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/iglelugarderefugio?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors focus-ring-white"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@iglelugarederfugio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors focus-ring-white"
                aria-label="Suscríbete a nuestro canal de YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Información Adicional */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Información
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <div className="font-medium text-white">Servicios</div>
                <div>Adoración y Palabra</div>
              </div>
              <div>
                <div className="font-medium text-white">Ministerios</div>
                <div>Familia, Jóvenes, Niños</div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3 text-sm text-gray-300">

              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Teléfono</div>
                  <a href="tel:+573115331485" className="hover:underline">
                    +57 311 533 1485
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Email</div>
                  <a href="mailto:iglecristianalugarderefugio@gmail.com" className="hover:underline">
                  iglecristianalugarderefugio@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <div className="space-y-2 text-sm">
              <Link to="/eventos" className="block text-gray-300 hover:text-white transition-colors">
                Encuentros Proféticos
              </Link>
              <Link to="/predicas" className="block text-gray-300 hover:text-white transition-colors">
                  Prédicas
              </Link>
              <Link to="/grupos/ninos" className="block text-gray-300 hover:text-white transition-colors">
                Reino Kids
              </Link>
              <Link to="/grupos/jovenes" className="block text-gray-300 hover:text-white transition-colors">
                Impacto Joven
              </Link>
              <Link to="/donar" className="block text-gray-300 hover:text-white transition-colors">
                Donación Profética
              </Link>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Palabra Semanal</h4>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Recibe bendición"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm focus-ring-white"
                >
                  Recibir
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2025 Lugar de Refugio. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/nosotros" className="hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/nosotros" className="hover:text-white transition-colors">
                Términos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}