import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Search, Filter, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Database } from '../types/database';
import { AnimatedCard } from '../components/AnimatedCard';
import { useEvents } from '../hooks/useEvents';
import { useEventInteractions } from '../hooks/useEventInteractions';
import { EventComments } from '../components/EventComments';
import { EventRSVPModal } from '../components/EventRSVPModal';
import { AddToCalendarModal } from '../components/AddToCalendarModal';

type Event = Database['public']['Tables']['events']['Row'];

export function EventsPage() {
  const [_currentDate, _setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [commentsEventId, setCommentsEventId] = useState<string | null>(null);
  const [rsvpEventId, setRsvpEventId] = useState<string | null>(null);
  const [calendarEventId, setCalendarEventId] = useState<string | null>(null);

  // Usar el hook de eventos
  const { events, loading, error } = useEvents({ published: true });
  
  // Usar el hook de interacciones
  const { 
    toggleLike, 
    getLikesCount, 
    getCommentsCount,
    hasUserLiked,
    loading: interactionsLoading 
  } = useEventInteractions();

  const eventTypes = ['Culto', 'Niños', 'Jóvenes', 'Grupo Pequeño', 'Evento Especial'];
  
  // Función para manejar los likes
  const handleLike = async (eventId: string) => {
    const result = await toggleLike(eventId);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  // Función para abrir comentarios
  const openComments = (eventId: string) => {
    setCommentsEventId(eventId);
  };

  // Función para cerrar comentarios
  const closeComments = () => {
    setCommentsEventId(null);
  };

  const openRSVP = (eventId: string) => {
    setRsvpEventId(eventId);
  };

  const closeRSVP = () => {
    setRsvpEventId(null);
  };

  const openCalendar = (eventId: string) => {
    setCalendarEventId(eventId);
  };

  const closeCalendar = () => {
    setCalendarEventId(null);
  };
  
  // Función para compartir un evento
  const shareEvent = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Te invito a este evento: ${event.title}`,
        url: window.location.origin + '/eventos/' + (event.slug || event.id)
      })
      .catch((_) => console.log('Error compartiendo:', _));
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const dummyInput = document.createElement('input');
      document.body.appendChild(dummyInput);
      dummyInput.value = window.location.origin + '/eventos/' + (event.slug || event.id);
      dummyInput.select();
      document.execCommand('copy');
      document.body.removeChild(dummyInput);
      alert('Enlace copiado al portapapeles. ¡Compártelo con tus amigos!');
    }
  };



  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.created_by && event.created_by.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !selectedType || selectedType === 'all';
    
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

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar eventos: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }



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
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
              {filteredEvents.map((event, index) => (
                <AnimatedCard key={event.id} delay={index * 0.1} className="card group">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Event Image */}
                    <div className="lg:col-span-1">
                      <div className="aspect-video lg:aspect-square rounded-lg overflow-hidden">
                        <img
                          src={event.featured_image || 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop'}
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
                          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                            Evento
                          </span>
                          {event.requires_rsvp && (
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
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{event.start_time ? formatTime(event.start_time) : 'Hora por confirmar'} - {event.end_time ? formatTime(event.end_time) : 'Hora por confirmar'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.location_name || 'Ubicación por confirmar'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            {event.current_attendees || 0}/{event.max_attendees || 'Sin límite'} inscritos
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Organizador:</strong> {event.host_contact || 'Por confirmar'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {event.requires_rsvp && (
                          <button 
                            onClick={() => openRSVP(event.id)}
                            className="btn-primary w-full"
                          >
                            Inscribirse
                          </button>
                        )}

                        <button 
                          onClick={() => openCalendar(event.id)}
                          className="btn-secondary w-full"
                        >
                          Agregar al calendario
                        </button>
                        
                        {/* Botones de interacción social */}
                        <div className="flex justify-between mt-4">
                          <button
                            onClick={() => handleLike(event.id)}
                            disabled={interactionsLoading}
                            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors focus-ring flex items-center ${
                              hasUserLiked(event.id) 
                                ? 'text-red-500' 
                                : 'text-gray-600 hover:text-red-500'
                            }`}
                            aria-label="Me gusta"
                          >
                            <Heart 
                              className={`w-4 h-4 mr-1 ${hasUserLiked(event.id) ? 'fill-current' : ''}`} 
                            />
                            <span className="text-sm">{getLikesCount(event.id)}</span>
                          </button>
                          <button
                            onClick={() => openComments(event.id)}
                            className="p-2 text-gray-600 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors focus-ring flex items-center"
                            aria-label="Ver comentarios"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{getCommentsCount(event.id)}</span>
                          </button>
                          <button
                            onClick={() => shareEvent(event)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                            aria-label="Compartir evento"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Capacity Indicator */}
                      {event.requires_rsvp && event.max_attendees && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Inscripciones</span>
                            <span>{Math.round(((event.current_attendees || 0) / event.max_attendees) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-black h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${((event.current_attendees || 0) / event.max_attendees) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
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
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
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

      {/* Modal de comentarios */}
      {commentsEventId && (
        <EventComments
          eventId={commentsEventId}
          isOpen={true}
          onClose={closeComments}
        />
      )}

      {/* Modal de RSVP */}
      {rsvpEventId && (
        <EventRSVPModal
          event={events.find(e => e.id === rsvpEventId)!}
          isOpen={true}
          onClose={closeRSVP}
        />
      )}

      {/* Modal de Calendario */}
      {calendarEventId && (
        <AddToCalendarModal
          event={events.find(e => e.id === calendarEventId)!}
          onClose={closeCalendar}
        />
      )}
    </div>
  );
}