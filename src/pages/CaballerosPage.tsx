import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin,
  User,
  BookOpen,
  Shield,
  Target,
  ChevronLeft
} from 'lucide-react';

export function CaballerosPage() {
  const groupData = {
    title: 'Ministerio de Caballeros',
    subtitle: 'Hombres de fe comprometidos con Dios',
    description: 'Un ministerio dedicado a formar hombres íntegros según el corazón de Dios. Nos enfocamos en el crecimiento espiritual, el liderazgo cristiano y el fortalecimiento de la familia, equipando a los hombres para ser líderes en sus hogares, trabajo y comunidad.',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    leader: {
      name: 'Pastor Reynel Dueñas',
      role: 'Director Ministerio de Caballeros',
      bio: 'Pastor principal con una pasión profunda por formar hombres íntegros según el corazón de Dios y fortalecer la familia cristiana.',
      image: '/Pastor Reynel Dueñas P n g.png'
    },
    activities: [
      {
        icon: Shield,
        title: 'Reuniones de Hermandad',
        description: 'Encuentros para fortalecer la fe y la amistad',
        schedule: 'Sábados 7:00 AM - 9:00 AM'
      },
      {
        icon: BookOpen,
        title: 'Estudio Bíblico Masculino',
        description: 'Profundización en la Palabra desde perspectiva masculina',
        schedule: 'Miércoles 7:00 PM - 8:30 PM'
      },
      {
        icon: Users,
        title: 'Actividades de Servicio',
        description: 'Proyectos comunitarios y de ayuda social',
        schedule: 'Segundo sábado del mes 8:00 AM'
      },
      {
        icon: Target,
        title: 'Mentorías y Discipulado',
        description: 'Acompañamiento espiritual entre hermanos',
        schedule: 'Según disponibilidad personal'
      }
    ],
    upcomingEvents: [
      {
        title: 'Retiro de Caballeros',
        date: '2025-03-20',
        time: '8:00 AM - 6:00 PM',
        location: 'Centro de Retiros',
        description: 'Día completo de reflexión, oración y fortalecimiento espiritual para hombres de fe.'
      },
      {
        title: 'Conferencia de Liderazgo',
        date: '2025-02-25',
        time: '7:00 PM - 9:00 PM',
        location: 'Auditorio Principal',
        description: 'Enseñanza sobre liderazgo cristiano en el hogar y la comunidad.'
      }
    ],
    resources: [
      'Biblioteca de libros sobre liderazgo cristiano',
      'Material de estudio bíblico especializado',
      'Espacio para reuniones y actividades',
      'Red de mentores experimentados'
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
                        <div className="flex items-start mb-4">
                          <div className="bg-gray-100 p-3 rounded-lg mr-4">
                            <IconComponent className="w-6 h-6 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              {activity.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{activity.schedule}</span>
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
                    <article key={index} className="card">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-black">
                              {new Date(event.date).getDate()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(event.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-3">
                          <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <p className="text-gray-700">{event.description}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Resources */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Recursos disponibles</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <ul className="space-y-3">
                    {groupData.resources.map((resource, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-black rounded-full mr-3 mt-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Leader Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Liderazgo
                  </h3>
                  <div className="text-center">
                    <img
                      src={groupData.leader.image}
                      alt={groupData.leader.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3"
                    />
                    <h4 className="font-semibold text-lg mb-1">{groupData.leader.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{groupData.leader.role}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{groupData.leader.bio}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Información de contacto</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Reuniones regulares según actividades</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Iglesia Vida Nueva - Salón de Caballeros</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{groupData.subtitle}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
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
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¡Únete a nosotros!
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Te invitamos a ser parte de esta comunidad donde podrás crecer, servir y impactar vidas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contacto"
              className="btn-primary bg-white text-black hover:bg-gray-100"
            >
              Obtener más información
            </Link>
            <Link 
              to="/eventos"
              className="btn-secondary border-white text-white hover:bg-white hover:text-black"
            >
              Ver próximos eventos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}