import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Share2,
  ChevronLeft,
  ExternalLink,
  Check,
  AlertCircle,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useEvent } from '../hooks/useEvents';

// Definir interfaz para los comentarios
interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { event, loading, error } = useEvent(slug || '');
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    specialRequests: ''
  });
  
  // Estado para los comentarios y likes
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');



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
      'Evento Especial': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Inicializar likes y comentarios
  useEffect(() => {
    // Simular datos iniciales
    setLikesCount(15);
    setComments([
      { id: 1, author: 'Carlos Mendoza', content: 'Excelente evento, ¡no puedo esperar para asistir!', date: '2025-01-15T14:30:00' },
      { id: 2, author: 'Laura Gómez', content: 'El taller del año pasado fue increíble, seguro este será aún mejor.', date: '2025-01-16T09:20:00' },
    ]);
  }, []);

  // Función para añadir un nuevo comentario
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    const newCommentObj = {
      id: comments.length + 1,
      author: 'Usuario',
      content: newComment,
      date: new Date().toISOString()
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  // Función para compartir el evento
  const shareEvent = async () => {
    if (!event) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `${event.title} - ${formatDate(event.event_date)}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      }
    } catch (_) {
      console.error('Error al compartir:', _);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setRsvpSubmitted(true);
      setShowRSVPForm(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addToCalendar = () => {
    if (!event) return;
    
    const startDateTime = new Date(`${event.event_date}T${event.start_time}`);
    const endDateTime = new Date(`${event.event_date}T${event.end_time}`);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent((event as any).locations?.full_address || (event as any).locations?.name || 'Ubicación por confirmar')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const openMap = () => {
    if (!event) return;
    
    const address = (event as any).locations?.full_address || (event as any).locations?.name || 'Ubicación por confirmar';
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapUrl, '_blank');
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar evento: {error}</p>
          <Link to="/eventos" className="btn-primary">
            Volver a eventos
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
          <Link to="/eventos" className="btn-primary">
            Ver todos los eventos
          </Link>
        </div>
      </div>
    );
  }

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
              <li>
                <Link to="/eventos" className="text-gray-600 hover:text-black transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </li>
              <li className="text-black font-medium truncate">{event.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Image */}
      <section className="relative h-64 md:h-96">
        <img
          src={event.image_url || 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop'}
          alt={`Imagen del evento: ${event.title}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-6 left-6 text-white">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 border ${getEventTypeColor(event.type)}`}>
            {event.type}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">{formatDate(event.event_date)}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">{(event as any)?.locations?.name || 'Ubicación por confirmar'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">{event.capacity ? (event.capacity - (event.current_registrations || 0)) : 'Sin límite'} lugares disponibles</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Descripción del evento</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {event.requirements && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Requisitos</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">{event.requirements}</p>
                  </div>
                </div>
              )}

              {/* Host Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Organizadores</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <User className="w-8 h-8 text-gray-600 mr-3" />
                    <h4 className="text-lg font-semibold">{event.host}</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{event?.host_bio}</p>
                </div>
              </div>

              {/* Location */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Ubicación</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{(event as any)?.locations?.name || 'Ubicación por confirmar'}</h4>
                      <p className="text-gray-600">{(event as any)?.locations?.full_address || 'Dirección por confirmar'}</p>
                    </div>
                    <button
                      onClick={openMap}
                      className="btn-secondary flex items-center"
                    >
                      Ver en mapa
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Registration Status */}
                {rsvpSubmitted ? (
                  <div className="card border-green-200 bg-green-50">
                    <div className="text-center">
                      <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        ¡Inscripción confirmada!
                      </h3>
                      <p className="text-green-700 text-sm">
                        Recibirás un email de confirmación con todos los detalles.
                      </p>
                    </div>
                  </div>
                ) : event.requires_rsvp ? (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Inscripción</h3>
                    
                    {event.capacity && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Lugares ocupados</span>
                          <span>{event.current_registrations || 0}/{event.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-black h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${((event.current_registrations || 0) / event.capacity) * 100}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {event.capacity - (event.current_registrations || 0)} lugares disponibles
                        </p>
                      </div>
                    )}

                    {!event.capacity || (event.capacity - (event.current_registrations || 0)) > 0 ? (
                      <button
                        onClick={() => setShowRSVPForm(true)}
                        className="btn-primary w-full mb-4"
                      >
                        Inscribirse al evento
                      </button>
                    ) : (
                      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-red-800 font-medium">Evento lleno</p>
                        <p className="text-red-700 text-sm">No hay lugares disponibles</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 text-center">
                      * La inscripción es gratuita pero obligatoria
                    </p>
                  </div>
                ) : (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Acceso libre</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Este evento no requiere inscripción previa. ¡Solo ven y participa!
                    </p>
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">Entrada libre</p>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
                  <div className="space-y-3">
                    <button
                      onClick={addToCalendar}
                      className="btn-secondary w-full flex items-center justify-center"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agregar al calendario
                    </button>
                    <button
                      onClick={shareEvent}
                      className="btn-secondary w-full flex items-center justify-center"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir evento
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                {(event.contact_phone || event.contact_email) && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Información de contacto</h3>
                    <div className="space-y-3 text-sm">
                      {event.contact_phone && (
                        <div>
                          <strong>Teléfono:</strong>
                          <br />
                          <a 
                            href={`tel:${event.contact_phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {event.contact_phone}
                          </a>
                        </div>
                      )}
                      {event.contact_email && (
                        <div>
                          <strong>Email:</strong>
                          <br />
                          <a 
                            href={`mailto:${event.contact_email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {event.contact_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de interacción social */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Interacción</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    setLiked(!liked);
                    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
                  }}
                  className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors focus-ring`}
                >
                  <Heart className="w-5 h-5 mr-2" fill={liked ? 'currentColor' : 'none'} />
                  <span>{likesCount} Me gusta</span>
                </button>
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center text-gray-600 hover:text-blue-500 transition-colors focus-ring"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>{comments.length} Comentarios</span>
                </button>
                <button
                  onClick={shareEvent}
                  className="flex items-center text-gray-600 hover:text-black transition-colors focus-ring"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Compartir
                </button>
              </div>
            </div>
            
            {/* Sección de comentarios */}
            {showComments && (
              <section className="bg-white rounded-lg border p-6">
                <h3 className="text-xl font-semibold mb-6">Comentarios ({comments.length})</h3>
                
                <div className="space-y-6 mb-8">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{comment.author}</div>
                        <div className="text-sm text-gray-500">{new Date(comment.date).toLocaleDateString()}</div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={addComment} className="mt-8">
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Añadir comentario</label>
                    <textarea
                      id="comment"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe tu comentario aquí..."
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Publicar comentario
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRSVPForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Inscripción al evento</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <label htmlFor="guests" className="block text-sm font-medium mb-1">
                  Número de asistentes (incluyéndote)
                </label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} persona{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="specialRequests" className="block text-sm font-medium mb-1">
                  Solicitudes especiales
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Alergias alimentarias, necesidades de accesibilidad, etc."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRSVPForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Confirmar inscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}