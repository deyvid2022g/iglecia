import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const eventTypes = ['Culto', 'Niños', 'Jóvenes', 'Grupo Pequeño', 'Evento Especial'];

  const events = [
    {
      id: 1,
      slug: 'culto-dominical-febrero-2',
      title: 'Culto Dominical',
      date: '2025-02-02',
      startTime: '10:00',
      endTime: '12:00',
      type: 'Culto',
      location: {
        name: 'Lugar de Refugio',
        address: 'Barranquilla'
      },
      description: 'Culto dominical con alabanza, adoración y mensaje inspirador.',
      capacity: 300,
      registrations: 85,
      image: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      host: 'Pastor Juan Pérez',
      requiresRSVP: false
    },
    {
      id: 2,
      slug: 'taller-matrimonios',
      title: 'Taller para Matrimonios',
      date: '2025-02-08',
      startTime: '15:00',
      endTime: '18:00',
      type: 'Evento Especial',
      location: {
        name: 'Salón de Eventos',
        address: 'Sede Norte - Salón A'
      },
      description: 'Taller intensivo para fortalecer las relaciones matrimoniales con bases bíblicas.',
      capacity: 50,
      registrations: 32,
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      host: 'Pastores Juan y María',
      requiresRSVP: true
    },
    {
      id: 3,
      slug: 'encuentro-juvenil',
      title: 'Encuentro Juvenil',
      date: '2025-02-14',
      startTime: '19:00',
      endTime: '21:30',
      type: 'Jóvenes',
      location: {
        name: 'Centro Juvenil',
        address: 'Sede Norte - Piso 2'
      },
      description: 'Noche especial de San Valentín con dinámicas, música y mensaje sobre el amor verdadero.',
      capacity: 80,
      registrations: 64,
      image: 'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      host: 'Pastor Carlos Ruiz',
      requiresRSVP: true
    },
    {
      id: 4,
      slug: 'escuela-biblica-infantil',
      title: 'Escuela Bíblica Infantil',
      date: '2025-02-09',
      startTime: '09:00',
      endTime: '11:00',
      type: 'Niños',
      location: {
        name: 'Salón Infantil',
        address: 'Sede Principal - Piso 1'
      },
      description: 'Clase especial para niños con actividades didácticas, juegos y enseñanza bíblica.',
      capacity: 40,
      registrations: 23,
      image: 'https://images.pexels.com/photos/8613049/pexels-photo-8613049.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      host: 'Maestra Elena Vásquez',
      requiresRSVP: true
    },
    {
      id: 5,
      slug: 'retiro-espiritual',
      title: 'Retiro Espiritual de Fin de Semana',
      date: '2025-02-22',
      startTime: '08:00',
      endTime: '18:00',
      type: 'Evento Especial',
      location: {
        name: 'Centro de Retiros El Refugio',
        address: 'Vía Santa Marta, Km 15'
      },
      description: 'Retiro de dos días para renovación espiritual, incluye comidas y hospedaje.',
      capacity: 60,
      registrations: 45,
      image: 'https://images.pexels.com/photos/247851/pexels-photo-247851.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      host: 'Equipo Pastoral',
      requiresRSVP: true
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.host.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || event.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Culto': 'bg-blue-100 text-blue-800',
      'Niños': 'bg-green-100 text-green-800',
      'Jóvenes': 'bg-purple-100 text-purple-800',
      'Grupo Pequeño': 'bg-yellow-100 text-yellow-800',
      'Evento Especial': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Calendario de Eventos
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Mantente conectado con todas las actividades de nuestra comunidad. 
              Encuentra eventos que fortalezcan tu fe y te conecten con otros creyentes.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Buscar eventos, ubicaciones o anfitriones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                aria-label="Buscar eventos"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-black focus:border-black"
                aria-label="Filtrar por tipo de evento"
              >
                <option value="">Todos los tipos</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Calendario
              </button>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedType) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-gray-600 hover:text-black border border-gray-300 rounded-lg hover:border-gray-400 transition-colors whitespace-nowrap"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-gray-600">
            {filteredEvents.length === events.length ? (
              `${events.length} eventos programados`
            ) : (
              `${filteredEvents.length} de ${events.length} eventos`
            )}
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">No se encontraron eventos</h3>
              <p className="text-gray-600 mb-6">
                Intenta con diferentes términos de búsqueda o filtros.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Ver todos los eventos
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredEvents.map((event) => (
                <article key={event.id} className="card group">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Event Image */}
                    <div className="lg:col-span-1">
                      <div className="aspect-video lg:aspect-square rounded-lg overflow-hidden">
                        <img
                          src={event.image}
                          alt={`Imagen del evento: ${event.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          {event.requiresRSVP && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              Requiere inscripción
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-gray-700 transition-colors">
                          <Link 
                            to={`/eventos/${event.slug}`}
                            className="focus-ring"
                          >
                            {event.title}
                          </Link>
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.location.name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            {event.registrations}/{event.capacity} inscritos
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Anfitrión:</strong> {event.host}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <Link
                          to={`/eventos/${event.slug}`}
                          className="btn-primary w-full text-center"
                        >
                          Ver detalles
                        </Link>
                        
                        {event.requiresRSVP && (
                          <button className="btn-secondary w-full">
                            Inscribirse
                          </button>
                        )}

                        <button className="btn-secondary w-full">
                          Agregar al calendario
                        </button>
                      </div>

                      {/* Capacity Indicator */}
                      {event.requiresRSVP && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Inscripciones</span>
                            <span>{Math.round((event.registrations / event.capacity) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-black h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(event.registrations / event.capacity) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Información importante
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-4">Eventos regulares</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nuestros cultos dominicales y estudios bíblicos semanales no requieren 
                  inscripción previa. ¡Solo ven y sé parte de la familia!
                </p>
              </div>
              
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-4">Eventos especiales</h3>
                <p className="text-gray-600 leading-relaxed">
                  Para talleres, retiros y eventos con capacidad limitada, 
                  la inscripción previa es necesaria para garantizar tu lugar.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                ¿Tienes preguntas sobre algún evento? No dudes en contactarnos.
              </p>
              <Link to="/contacto" className="btn-primary">
                Contactar organizadores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}