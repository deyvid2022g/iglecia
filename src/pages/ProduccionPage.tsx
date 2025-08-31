import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin,
  BookOpen,
  Camera,
  Target,
  ChevronLeft
} from 'lucide-react';

export function ProduccionPage() {
  const groupData = {
    title: 'Ministerio de Producción',
    subtitle: 'Comunicando el mensaje con excelencia',
    description: 'Un ministerio dedicado a la producción audiovisual y comunicación de la iglesia. Nos enfocamos en capturar y transmitir los momentos especiales de la congregación, crear contenido multimedia de calidad y apoyar la difusión del mensaje del evangelio a través de medios digitales.',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    leader: {
      name: 'Pastor David Morales',
      role: 'Director Ministerio de Producción',
      bio: 'Especialista en comunicación audiovisual con más de 10 años de experiencia en producción de contenido religioso y medios digitales.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    activities: [
      {
        icon: Camera,
        title: 'Producción Audiovisual',
        description: 'Grabación y edición de servicios y eventos',
        schedule: 'Domingos y eventos especiales'
      },
      {
        icon: BookOpen,
        title: 'Capacitación Técnica',
        description: 'Entrenamiento en equipos y software de producción',
        schedule: 'Sábados 2:00 PM - 4:00 PM'
      },
      {
        icon: Users,
        title: 'Transmisiones en Vivo',
        description: 'Streaming de servicios y eventos especiales',
        schedule: 'Domingos según programación'
      },
      {
        icon: Target,
        title: 'Contenido Digital',
        description: 'Creación de material para redes sociales',
        schedule: 'Miércoles 7:00 PM - 9:00 PM'
      }
    ],
    upcomingEvents: [
      {
        title: 'Taller de Edición de Video',
        date: '2025-03-15',
        time: '2:00 PM - 6:00 PM',
        location: 'Sala de Producción',
        description: 'Aprende técnicas avanzadas de edición de video para crear contenido impactante para el ministerio.'
      },
      {
        title: 'Capacitación en Streaming',
        date: '2025-02-22',
        time: '10:00 AM - 2:00 PM',
        location: 'Auditorio Principal',
        description: 'Entrenamiento completo en transmisiones en vivo, configuración de equipos y mejores prácticas.'
      }
    ],
    resources: [
      'Equipos de grabación profesional',
      'Software de edición especializado',
      'Estudio de grabación equipado',
      'Plataformas de streaming'
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <nav aria-label="Navegación de migas de pan">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-black transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </li>
              <li className="text-black font-medium">{groupData.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-64 md:h-96">
        <img
          src={groupData.image}
          alt={`Imagen del ${groupData.title}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-6 left-6 text-white">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 border bg-white ${groupData.color.split(' ')[1]} ${groupData.color.split(' ')[2]}`}>
            {groupData.subtitle}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold">{groupData.title}</h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-12">
              {/* Description */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Acerca de nuestro ministerio</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {groupData.description}
                </p>
              </section>

              {/* Activities */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Nuestras actividades</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupData.activities.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={index} className="card">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                            <p className="text-gray-600 mb-3">{activity.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {activity.schedule}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Upcoming Events */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Próximos eventos</h2>
                <div className="space-y-6">
                  {groupData.upcomingEvents.map((event, index) => (
                    <div key={index} className="card">
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                            <Calendar className="w-6 h-6 text-gray-700 mb-1" />
                            <span className="text-xs font-medium text-gray-600">
                              {new Date(event.date).getDate()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </div>
                          </div>
                          <p className="text-gray-700">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Resources */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Recursos disponibles</h2>
                <div className="card">
                  <ul className="space-y-3">
                    {groupData.resources.map((resource, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-gray-700">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Leader Info */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Líder del ministerio</h3>
                <div className="flex items-start space-x-4">
                  <img
                    src={groupData.leader.image}
                    alt={groupData.leader.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{groupData.leader.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{groupData.leader.role}</p>
                    <p className="text-sm text-gray-700">{groupData.leader.bio}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">¿Interesado en participar?</h3>
                <p className="text-gray-600 mb-4">
                  ¡Nos encantaría conocerte! Únete a nuestro ministerio y sé parte de esta gran familia.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/contacto"
                    className="btn-primary w-full text-center"
                  >
                    Contactar al ministerio
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Enlaces útiles</h3>
                <div className="space-y-2">
                  <Link 
                    to="/eventos"
                    className="block text-gray-700 hover:text-black transition-colors py-2"
                  >
                    Ver todos los eventos
                  </Link>
                  <Link 
                    to="/blog"
                    className="block text-gray-700 hover:text-black transition-colors py-2"
                  >
                    Recursos y artículos
                  </Link>
                  <Link 
                    to="/donar"
                    className="block text-gray-700 hover:text-black transition-colors py-2"
                  >
                    Apoyar el ministerio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para ser parte del {groupData.title}?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a nosotros y descubre cómo puedes usar tus talentos para servir a Dios y bendecir a otros.
          </p>
          <Link
            to="/contacto"
            className="btn-primary inline-block"
          >
            Contáctanos hoy
          </Link>
        </div>
      </section>
    </div>
  );
}