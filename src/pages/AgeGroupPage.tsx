import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin,
  User,
  Heart,
  BookOpen,
  Music,
  Gamepad2,
  Target,
  ChevronLeft
} from 'lucide-react';

export function AgeGroupPage() {
  const { ageGroup } = useParams();

  const ageGroupsData = {
    ninos: {
      title: 'Ministerio Infantil',
      subtitle: 'Niños de 0 a 12 años',
      description: 'Un lugar seguro y divertido donde los niños pueden aprender sobre el amor de Dios a través de historias bíblicas, juegos, música y actividades creativas.',
      color: 'bg-green-100 text-green-800 border-green-200',
      image: 'https://images.pexels.com/photos/8613049/pexels-photo-8613049.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      leader: {
        name: 'Maestra Elena Vásquez',
        role: 'Coordinadora Ministerio Infantil',
        bio: 'Con más de 10 años de experiencia en educación cristiana, Elena se especializa en pedagogía bíblica infantil.',
        image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      },
      activities: [
        {
          icon: BookOpen,
          title: 'Escuela Dominical',
          description: 'Lecciones bíblicas adaptadas para cada edad',
          schedule: 'Domingos 9:00 AM - 10:00 AM'
        },
        {
          icon: Music,
          title: 'Alabanza Infantil',
          description: 'Canciones y coreografías para adorar',
          schedule: 'Domingos 10:00 AM - 10:30 AM'
        },
        {
          icon: Gamepad2,
          title: 'Juegos y Dinámicas',
          description: 'Actividades lúdicas con valores cristianos',
          schedule: 'Sábados 3:00 PM - 5:00 PM'
        },
        {
          icon: Heart,
          title: 'Servicio Comunitario Infantil',
          description: 'Proyectos de ayuda apropiados para niños',
          schedule: 'Una vez al mes'
        }
      ],
      upcomingEvents: [
        {
          title: 'Campamento Infantil de Verano',
          date: '2025-03-15',
          time: '8:00 AM - 5:00 PM',
          location: 'Centro Recreativo El Paraíso',
          description: 'Tres días de diversión, juegos y aprendizaje bíblico.'
        },
        {
          title: 'Función de Teatro Bíblico',
          date: '2025-02-28',
          time: '6:00 PM - 7:30 PM',
          location: 'Auditorio Principal',
          description: 'Los niños presentan la historia de Daniel en el foso de los leones.'
        }
      ],
      resources: [
        'Material didáctico semanal para padres',
        'Aplicación móvil con devocionales familiares',
        'Videos educativos de historias bíblicas',
        'Guías para el culto familiar'
      ]
    },
    adolescentes: {
      title: 'Ministerio de Adolescentes',
      subtitle: 'Adolescentes de 13 a 17 años',
      description: 'Un espacio donde los adolescentes pueden explorar su fe, hacer preguntas difíciles y construir amistades sólidas mientras navegan por esta etapa crucial de la vida.',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      image: 'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      leader: {
        name: 'Pastor Daniel Morales',
        role: 'Pastor de Adolescentes',
        bio: 'Especialista en ministerio juvenil con experiencia en consejería adolescente y programas de liderazgo.',
        image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      },
      activities: [
        {
          icon: Users,
          title: 'Grupos Pequeños',
          description: 'Estudios bíblicos en grupos reducidos',
          schedule: 'Miércoles 7:00 PM - 8:30 PM'
        },
        {
          icon: Target,
          title: 'Proyecto Vida',
          description: 'Programa de mentoría y desarrollo personal',
          schedule: 'Sábados 4:00 PM - 6:00 PM'
        },
        {
          icon: Music,
          title: 'Banda de Adoración Teen',
          description: 'Ministerio musical para adolescentes',
          schedule: 'Viernes 7:00 PM - 9:00 PM'
        },
        {
          icon: Heart,
          title: 'Misión Social Teen',
          description: 'Proyectos de servicio comunitario',
          schedule: 'Segundo sábado del mes'
        }
      ],
      upcomingEvents: [
        {
          title: 'Retiro de Adolescentes',
          date: '2025-03-22',
          time: '7:00 AM - 9:00 PM',
          location: 'Centro de Retiros Esperanza',
          description: 'Fin de semana de crecimiento espiritual y diversión sana.'
        },
        {
          title: 'Noche de Talentos',
          date: '2025-02-14',
          time: '7:00 PM - 10:00 PM',
          location: 'Salón de Eventos',
          description: 'Los adolescentes muestran sus talentos y habilidades.'
        }
      ],
      resources: [
        'Plan de lectura bíblica para adolescentes',
        'Consejería pastoral individual',
        'Talleres de prevención de adicciones',
        'Preparación para el bautismo'
      ]
    },
    jovenes: {
      title: 'Ministerio de Jóvenes',
      subtitle: 'Jóvenes de 18 a 30 años',
      description: 'Una comunidad vibrante donde los jóvenes adultos pueden crecer espiritualmente, desarrollar sus talentos, construir relaciones significativas y descubrir su propósito en el plan de Dios.',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      image: 'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      leader: {
        name: 'Pastor Reynel Dueñas',
        role: 'Pastor de Jóvenes',
        bio: 'Pastor principal con una pasión profunda por el ministerio juvenil y la formación de líderes jóvenes.',
        image: '/Pastor Reynel Dueñas P n g.png'
      },
      activities: [
        {
          icon: BookOpen,
          title: 'Células de Crecimiento',
          description: 'Grupos de estudio bíblico y discipulado',
          schedule: 'Jueves 7:30 PM - 9:00 PM'
        },
        {
          icon: Target,
          title: 'Escuela de Líderes',
          description: 'Formación en liderazgo cristiano',
          schedule: 'Sábados 6:00 PM - 8:00 PM'
        },
        {
          icon: Users,
          title: 'Encuentros Jóvenes',
          description: 'Reuniones de adoración y enseñanza',
          schedule: 'Viernes 7:30 PM - 10:00 PM'
        },
        {
          icon: Heart,
          title: 'Impacto Social',
          description: 'Proyectos de transformación comunitaria',
          schedule: 'Tercer sábado del mes'
        }
      ],
      upcomingEvents: [
        {
          title: 'Conferencia Jóvenes 2025',
          date: '2025-04-05',
          time: '8:00 AM - 10:00 PM',
          location: 'Centro de Convenciones Norte',
          description: 'Conferencia anual con invitados internacionales.'
        },
        {
          title: 'Noche de Adoración',
          date: '2025-02-21',
          time: '8:00 PM - 11:00 PM',
          location: 'Auditorio Principal',
          description: 'Tiempo especial de adoración y oración.'
        }
      ],
      resources: [
        'Plan de lectura bíblica anual',
        'Consejería pre-matrimonial',
        'Talleres de finanzas personales',
        'Programa de mentoría profesional'
      ]
    },
    adultos: {
      title: 'Ministerio de Adultos',
      subtitle: 'Adultos mayores de 30 años',
      description: 'Un ministerio integral que fortalece la fe madura, promueve el crecimiento continuo y fomenta el servicio efectivo en todas las etapas de la vida adulta.',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      leader: {
        name: 'Pastor Reynel Dueñas',
        role: 'Pastor Principal',
        bio: 'Pastor principal con una pasión profunda por la enseñanza bíblica expositiva y el cuidado pastoral de la congregación.',
        image: '/Pastor Reynel Dueñas P n g.png'
      },
      activities: [
        {
          icon: BookOpen,
          title: 'Estudios Bíblicos Profundos',
          description: 'Análisis expositivo de las Escrituras',
          schedule: 'Miércoles 7:00 PM - 8:30 PM'
        },
        {
          icon: Users,
          title: 'Grupos de Matrimonios',
          description: 'Fortalecimiento de relaciones matrimoniales',
          schedule: 'Primer viernes del mes 7:00 PM'
        },
        {
          icon: Heart,
          title: 'Ministerio de Intercesión',
          description: 'Grupo de oración y intercesión',
          schedule: 'Martes 6:00 AM - 7:00 AM'
        },
        {
          icon: Target,
          title: 'Escuela de Ministerio',
          description: 'Capacitación para el servicio cristiano',
          schedule: 'Sábados 8:00 AM - 12:00 PM'
        }
      ],
      upcomingEvents: [
        {
          title: 'Retiro de Matrimonios',
          date: '2025-03-08',
          time: '8:00 AM - 8:00 PM',
          location: 'Hotel Campestre Las Flores',
          description: 'Fin de semana para fortalecer las relaciones matrimoniales.'
        },
        {
          title: 'Seminario de Finanzas Bíblicas',
          date: '2025-02-15',
          time: '9:00 AM - 5:00 PM',
          location: 'Aula Magna',
          description: 'Principios bíblicos para la administración financiera.'
        }
      ],
      resources: [
        'Biblioteca teológica especializada',
        'Consejería pastoral y familiar',
        'Programa de visitación hospitalaria',
        'Ministerio de cuidado de adultos mayores'
      ]
    }
  };

  const groupData = ageGroupsData[ageGroup as keyof typeof ageGroupsData];

  if (!groupData) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Grupo no encontrado</h1>
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

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
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 border ${groupData.color.replace('text-', 'text-').replace('bg-', 'bg-white border-')}`}>
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
                      <span>Iglesia Vida Nueva - Varios salones</span>
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