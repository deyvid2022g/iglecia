import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Heart, Target, MapPin, Phone, Mail } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Lugar de Refugio
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Impactando y transformando las generaciones por medio de los principios bíblicos
            </p>
          </div>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">¿Quiénes Somos?</h2>
            <div className="prose prose-lg mx-auto">
              <p>
                Somos una comunidad cristiana del Concilio de Asambleas de Dios en Colombia, que extiende el Reino de Dios a las nuevas generaciones, adorando y honrando a Dios a través de nuestro servicio y compromiso con Su palabra.
              </p>
              <p>
                En Lugar de Refugio, creemos en la transformación integral de las personas a través del poder del Evangelio. Nuestro enfoque está en crear un ambiente acogedor donde cada persona pueda experimentar el amor de Dios, crecer espiritualmente y desarrollar su propósito divino.
              </p>
              <p>
                Bajo el liderazgo de nuestros pastores, nos esforzamos por ser una iglesia relevante que responde a las necesidades de nuestra comunidad mientras permanecemos fieles a los principios bíblicos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
                <p className="text-gray-700">
                  Acogemos a cada persona generando espacios de adoración y comunión, facilitando su restauración integral mediante la predicación y enseñanza bíblica, de tal manera que el creyente pueda servir a Dios.
                </p>
              </div>
              
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Nuestra Visión</h2>
                <p className="text-gray-700">
                  Impactar y transformar las generaciones por medio de los principios bíblicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ministerios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestros Ministerios</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Alabanza</h3>
                <p className="text-gray-600 text-sm">
                  Adoración y música para glorificar a Dios
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Danza</h3>
                <p className="text-gray-600 text-sm">
                  Expresión artística como forma de adoración
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Zona Kids</h3>
                <p className="text-gray-600 text-sm">
                  Formación espiritual para los más pequeños
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Familias</h3>
                <p className="text-gray-600 text-sm">
                  Fortalecimiento de los hogares cristianos
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Parejas</h3>
                <p className="text-gray-600 text-sm">
                  Apoyo y consejería para matrimonios
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Jóvenes</h3>
                <p className="text-gray-600 text-sm">
                  Formación y actividades para la nueva generación
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Producción</h3>
                <p className="text-gray-600 text-sm">
                  Tecnología y medios para expandir el mensaje
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Caballeros</h3>
                <p className="text-gray-600 text-sm">
                  Formación de hombres con carácter de Cristo
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mujeres</h3>
                <p className="text-gray-600 text-sm">
                  Empoderamiento y crecimiento espiritual femenino
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Escuelas de Formación */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Escuelas de Formación</h2>
            
            <div className="prose prose-lg mx-auto">
              <p>
                En Lugar de Refugio, creemos en la importancia de la formación continua para el crecimiento espiritual. Nuestras escuelas de formación están diseñadas para equipar a los creyentes con conocimiento bíblico sólido y habilidades prácticas para el ministerio.
              </p>
              
              <h3>Programas disponibles:</h3>
              <ul>
                <li><strong>Fundamentos de la Fe</strong> - Para nuevos creyentes</li>
                <li><strong>Escuela de Liderazgo</strong> - Formación para líderes emergentes</li>
                <li><strong>Estudios Bíblicos Avanzados</strong> - Profundización en las Escrituras</li>
                <li><strong>Escuela de Adoración</strong> - Desarrollo de talentos musicales</li>
                <li><strong>Discipulado Integral</strong> - Crecimiento personal y espiritual</li>
              </ul>
              
              <p>
                Nuestras escuelas se reúnen los miércoles a las 6:45 P.M. y están abiertas para todos los miembros de la iglesia y visitantes interesados en crecer en su fe.
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/contacto" className="btn-primary">
                Más información sobre nuestras escuelas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Soy Nuevo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Soy Nuevo</h2>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">¡Bienvenido a Lugar de Refugio!</h3>
              <p className="text-gray-700 mb-6">
                Estamos emocionados de que hayas decidido visitarnos. Queremos que tu experiencia sea memorable y significativa. Si eres nuevo en nuestra iglesia, aquí hay información importante para ti:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Nuestros Servicios</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Adoración y Palabra</li>
                    <li>Ministerio de Niños</li>
                    <li>Ministerio de Jóvenes</li>
                    <li>Grupos de Crecimiento</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Qué Esperar</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Ambiente acogedor y familiar</li>
                    <li>Adoración contemporánea</li>
                    <li>Mensaje bíblico relevante</li>
                    <li>Programas para niños durante el servicio</li>
                    <li>Oportunidad de conocer nuevas personas</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Contacto para Nuevos Miembros</h4>
                <p className="text-gray-600 mb-4">
                  Nos encantaría conocerte mejor y ayudarte a conectar con nuestra comunidad. Por favor, déjanos tus datos:
                </p>
                
                <div className="flex items-center space-x-4 mb-2">
                  <Phone className="w-5 h-5 text-gray-700" />
                  <span>+57 (311) 533 1485</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-gray-700" />
                  <span>iglecristianalugarderefugio@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consejería Virtual */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Consejería Virtual</h2>
            
            <div className="card text-center">
              <p className="text-xl text-gray-700 mb-8">
                Si no te congregas en ninguna iglesia y deseas crecer espiritualmente, agenda una cita para conocerte.
              </p>
              
              <Link to="/contacto" className="btn-primary inline-block">
                Agendar Consejería
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestras Sedes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestras Sedes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Sede Principal</h3>
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">
                    Villavicencio, Meta
                  </p>
                </div>
                <a 
                  href="https://maps.app.goo.gl/nd7LKuAjmiZNDVTD9?g_st=ic" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-center"
                >
                  Ver en mapa
                </a>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Sede El Jordán Paraíso</h3>
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">
                    Barrio El Jordán, Villavicencio, Meta
                  </p>
                </div>
                <a 
                  href="https://share.google/pOa3lL5tp5YZBwWc1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-center"
                >
                  Ver en mapa
                </a>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Sede Apiay</h3>
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">
                    Base Aérea de Apiay, Villavicencio, Meta
                  </p>
                </div>
                <div className="flex items-start space-x-2 mb-4">
                  <Phone className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">
                    +57 (311) 533 1485
                  </p>
                </div>
                <a 
                  href="#" 
                  className="btn-secondary w-full text-center opacity-50 cursor-not-allowed"
                >
                  Próximamente
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Te esperamos en Lugar de Refugio
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Un lugar donde encontrarás paz, propósito y una familia espiritual.
          </p>
          <Link 
            to="/contacto"
            className="btn-primary bg-white text-black hover:bg-gray-100"
          >
            Contáctanos
          </Link>
        </div>
      </section>
    </div>
  );
}