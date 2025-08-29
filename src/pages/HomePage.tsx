import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Heart, ArrowRight, Users, Baby, MapPin, Mail, Phone, Building } from 'lucide-react';
import { HeroLogo } from '../components/HeroLogo';

export function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const ageGroups = [
    {
      id: 'zonakids',
      title: 'Zona Kids',
      icon: Baby,
      description: 'Formando pequeños discípulos con corazón de adoradores',
      activities: ['Escuela Bíblica Dominical', 'Adoración Infantil', 'Actividades Recreativas'],
      color: 'bg-gray-50'
    },
    {
      id: 'jovenes',
      title: 'Jóvenes',
      icon: Users,
      description: 'Jóvenes apasionados viviendo el llamado de Dios',
      activities: ['Reuniones Semanales', 'Retiros Espirituales', 'Actividades de Integración'],
      color: 'bg-gray-100'
    },
    {
      id: 'familias',
      title: 'Familias',
      icon: Users,
      description: 'Fortaleciendo el núcleo familiar según principios bíblicos',
      activities: ['Consejería Familiar', 'Talleres para Padres', 'Actividades Familiares'],
      color: 'bg-gray-50'
    },
    {
      id: 'parejas',
      title: 'Parejas',
      icon: Users,
      description: 'Construyendo matrimonios sólidos en Cristo',
      activities: ['Consejería Matrimonial', 'Encuentros de Parejas', 'Talleres Prácticos'],
      color: 'bg-gray-100'
    },
    {
      id: 'alabanza',
      title: 'Alabanza',
      icon: Users,
      description: 'Adorando a Dios con excelencia y pasión',
      activities: ['Ensayos Semanales', 'Talleres de Adoración', 'Participación en Servicios'],
      color: 'bg-gray-50'
    },
    {
      id: 'danza',
      title: 'Danza',
      icon: Users,
      description: 'Expresando adoración a través del movimiento',
      activities: ['Coreografías Ministeriales', 'Talleres de Danza', 'Presentaciones Especiales'],
      color: 'bg-gray-100'
    },
    {
      id: 'produccion',
      title: 'Producción',
      icon: Users,
      description: 'Sirviendo con excelencia técnica para la gloria de Dios',
      activities: ['Sonido', 'Iluminación', 'Transmisiones en Vivo'],
      color: 'bg-gray-50'
    },
    {
      id: 'caballeros',
      title: 'Caballeros',
      icon: Users,
      description: 'Formando hombres íntegros según el corazón de Dios',
      activities: ['Reuniones de Varones', 'Estudios Bíblicos', 'Actividades de Integración'],
      color: 'bg-gray-100'
    },
    {
      id: 'mujeres',
      title: 'Mujeres',
      icon: Users,
      description: 'Desarrollando mujeres virtuosas y de propósito',
      activities: ['Encuentros de Damas', 'Estudios Bíblicos', 'Actividades Especiales'],
      color: 'bg-gray-50'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'María González',
      text: 'En Lugar de Refugio descubrí mi identidad en Cristo. Dios restauró mi matrimonio y me reveló Su propósito para mi vida. Esta iglesia es un oasis de esperanza.',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      text: 'La Palabra predicada aquí ha revolucionado mi negocio y mi familia. Dios me ha prosperado en todo aspecto porque aprendí a honrarlo primero.',
      image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      text: 'Llegamos quebrantados y Dios nos sanó completamente. Nuestros hijos ahora son líderes y nosotros servimos en misiones. ¡Gloria a Dios!',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section 
        className="relative bg-white py-24 md:py-32 overflow-hidden"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <HeroLogo className="mb-6" />
            <h1 
              id="hero-title"
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              Lugar de Refugio
            </h1>
            <p 
              className={`text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              Impactando y transformando las generaciones por medio de los principios bíblicos. Un lugar donde acogemos a cada persona generando espacios de adoración y comunión.
            </p>
            <div 
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <a 
                href="#horarios"
                className="btn-primary text-center"
              >
                Experimenta Su presencia
              </a>
              <Link 
                to="/predicas"
                className="btn-secondary text-center"
              >
                Palabra que transforma
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Quick Action Cards */}
      <section className="py-16 bg-white" aria-labelledby="quick-actions">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 id="quick-actions" className="sr-only">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Próximo Evento */}
            <div className="card group">
              <div className="flex items-center mb-4">
                <Calendar className="w-8 h-8 mr-3 text-gray-700" />
                <h3 className="text-xl font-semibold">Próximo Servicio</h3>
              </div>
              <p className="text-gray-600 mb-4">
                <strong>Servicios Semanales</strong><br />
                Adoración y Palabra para toda la familia
              </p>
              <Link 
                to="/eventos"
                className="inline-flex items-center text-black font-medium hover:underline focus-ring"
              >
                Ver próximos eventos
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Contacto */}
            <div className="card group">
              <div className="flex items-center mb-4">
                <Phone className="w-8 h-8 mr-3 text-gray-700" />
                <h3 className="text-xl font-semibold">Contáctanos</h3>
              </div>
              <p className="text-gray-600 mb-4">
                <strong>+57 (311) 533 1485</strong><br />
                info@lugarderefugio.com
              </p>
              <Link 
                to="/contacto"
                className="inline-flex items-center text-black font-medium hover:underline focus-ring"
              >
                Más información
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Donar */}
            <div className="card group">
              <div className="flex items-center mb-4">
                <Heart className="w-8 h-8 mr-3 text-gray-700" />
                <h3 className="text-xl font-semibold">Donaciones</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Cuenta Bancolombia: 39500004883<br />
                NIT: 900364627<br />
                IGLESIA CRISTIANA EL ALFARERO
              </p>
              <Link 
                to="/donar"
                className="btn-primary group-hover:scale-105 transition-transform"
              >
                Más información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Age Groups Section */}
      <section className="py-16 bg-gray-50" aria-labelledby="age-groups">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 id="age-groups" className="text-3xl md:text-4xl font-bold text-center mb-4">
            Ministerios de Excelencia
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Cada generación tiene un llamado divino. Descubre el tuyo y camina en tu destino profético.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ageGroups.map((group) => {
              const IconComponent = group.icon;
              const isExpanded = expandedGroup === group.id;
              
              return (
                <div
                  key={group.id}
                  className={`card cursor-pointer transition-all duration-300 ${group.color} ${
                    isExpanded ? 'ring-2 ring-black' : ''
                  }`}
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedGroup(isExpanded ? null : group.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  aria-controls={`activities-${group.id}`}
                >
                  <div className="flex items-center mb-4">
                    <IconComponent className="w-8 h-8 mr-3 text-gray-700" />
                    <h3 className="text-xl font-semibold">{group.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {group.description}
                  </p>
                  
                  <div 
                    id={`activities-${group.id}`}
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <h4 className="font-medium mb-2">Actividades:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {group.activities.map((activity, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4">
                    <Link 
                      to={`/grupos/${group.id}`}
                      className="inline-flex items-center text-black font-medium hover:underline focus-ring"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver actividades
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nuestras Sedes */}
      <section className="py-16 bg-white" aria-labelledby="sedes">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 id="sedes" className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nuestras Sedes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 mr-3 text-gray-700" />
                <h3 className="text-xl font-semibold">Sede Principal</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Nuestra sede principal donde se realizan todos los servicios generales y actividades principales.
              </p>
              <a 
                href="https://maps.app.goo.gl/nd7LKuAjmiZNDVTD9?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center"
              >
                Ver ubicación
                <MapPin className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 mr-3 text-gray-700" />
                <h3 className="text-xl font-semibold">Sede El Jordán Paraíso</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Nuestra sede en El Jordán Paraíso, donde también ofrecemos servicios y actividades para la comunidad.
              </p>
              <a 
                href="https://share.google/pOa3lL5tp5YZBwWc1"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center"
              >
                Ver ubicación
                <MapPin className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 mr-3 text-gray-700" />
                <h3 className="text-xl font-semibold">Sede Apiay</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Nuestra sede en Apiay, sirviendo a la comunidad local con nuestros servicios y actividades.
              </p>
              <p className="text-sm text-gray-500 italic">
                Próximamente enlace a ubicación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}


      {/* Misión y Visión */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="card">
              <h2 className="text-3xl font-bold mb-6">Misión</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Acogemos a cada persona generando espacios de adoración y comunión, facilitando su restauración integral, mediante la predicación y enseñanza bíblica, de tal manera que el creyente pueda servir a Dios.
              </p>
            </div>
            
            <div className="card">
              <h2 className="text-3xl font-bold mb-6">Visión</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Impactar y transformar las generaciones por medio de los principios bíblicos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consejería Virtual */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Consejería Virtual
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Si no te congregas en ninguna iglesia y quieres crecer espiritualmente, agenda una cita para conocerte.
          </p>
          <Link 
            to="/contacto"
            className="btn-primary"
          >
            Agendar una cita
          </Link>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Soy Nuevo
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            ¿Primera vez en Lugar de Refugio? Nos encantaría conocerte y ayudarte a conectar con nuestra comunidad.
          </p>
          <Link 
            to="/soy-nuevo"
            className="btn-primary bg-white text-black hover:bg-gray-100"
          >
            Quiero conectarme
          </Link>
        </div>
      </section>
    </div>
  );
}