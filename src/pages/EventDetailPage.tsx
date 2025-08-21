import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Share2,
  Download,
  ChevronLeft,
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';

export function EventDetailPage() {
  const { slug } = useParams();
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    specialRequests: ''
  });

  // Simulated event data - in real app this would come from an API
  const event = {
    id: 2,
    title: 'Taller para Matrimonios',
    date: '2025-02-08',
    startTime: '15:00',
    endTime: '18:00',
    type: 'Evento Especial',
    location: {
      name: 'Salón de Eventos',
      address: 'Sede Norte - Salón A',
      fullAddress: 'Barranquilla, Colombia',
      coordinates: { lat: 10.9685, lng: -74.7813 }
    },
    description: 'Un taller intensivo diseñado especialmente para matrimonios que desean fortalecer su relación con bases bíblicas sólidas. Durante estas tres horas exploraremos temas fundamentales como la comunicación efectiva, la resolución de conflictos, el manejo de las finanzas familiares y cómo mantener viva la chispa del amor a lo largo de los años.',
    detailedDescription: `Este taller está dirigido a matrimonios de todas las edades y etapas de su relación. No importa si son recién casados o llevan décadas juntos, siempre hay algo nuevo que aprender para fortalecer el vínculo matrimonial.

**Temas a cubrir:**
• Comunicación asertiva y empática
• Manejo constructivo de conflictos
• Administración sabia de recursos familiares  
• Intimidad emocional y espiritual
• Construcción de tradiciones familiares
• Crianza en equipo (para parejas con hijos)

**Metodología:**
Combinaremos enseñanza bíblica con dinámicas prácticas, ejercicios en pareja y tiempo de reflexión personal. Cada pareja recibirá un manual de trabajo que podrán llevar a casa para continuar aplicando lo aprendido.

**Material incluido:**
• Manual de trabajo (40 páginas)
• Plantillas para planificación financiera familiar
• Guía de comunicación efectiva
• Refrigerio y café durante el descanso`,
    capacity: 50,
    registrations: 32,
    availableSpots: 18,
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    host: 'Pastores Juan y María Pérez',
    hostBio: 'Los pastores Juan y María llevan 20 años casados y 15 años en el ministerio matrimonial. Han ayudado a cientos de parejas a fortalecer sus relaciones y son autores del libro "Matrimonio que Perdura".',
    requiresRSVP: true,
    cost: 'Gratuito',
    requirements: [
      'Asistir en pareja (ambos cónyuges)',
      'Traer libreta para notas',
      'Actitud abierta al aprendizaje'
    ],
    tags: ['matrimonio', 'relaciones', 'familia', 'comunicación'],
    contact: {
      phone: '+57 302 494 1293',
      email: 'eventos@iglesiavidanueva.com'
    }
  };

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

  const shareEvent = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const addToCalendar = () => {
    const startDateTime = new Date(`${event.date}T${event.startTime}`);
    const endDateTime = new Date(`${event.date}T${event.endTime}`);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location.fullAddress)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const openMap = () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.fullAddress)}`;
    window.open(mapUrl, '_blank');
  };

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
          src={event.image}
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
                  <div className="text-sm font-medium">{formatDate(event.date)}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">{event.location.name}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">{event.availableSpots} lugares disponibles</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Descripción del evento</h2>
                <div className="prose prose-gray max-w-none">
                  {event.detailedDescription.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="mb-4">
                      {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                        <h3 className="text-lg font-semibold mb-2">
                          {paragraph.slice(2, -2)}
                        </h3>
                      ) : paragraph.startsWith('•') ? (
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {paragraph.split('\n').map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-700">
                              {item.replace('• ', '')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {event.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Requisitos</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {event.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
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
                  <p className="text-gray-700 leading-relaxed">{event.hostBio}</p>
                </div>
              </div>

              {/* Location */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Ubicación</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{event.location.name}</h4>
                      <p className="text-gray-600">{event.location.fullAddress}</p>
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
                ) : event.requiresRSVP ? (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Inscripción</h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Lugares ocupados</span>
                        <span>{event.registrations}/{event.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(event.registrations / event.capacity) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {event.availableSpots} lugares disponibles
                      </p>
                    </div>

                    {event.availableSpots > 0 ? (
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
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Información de contacto</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Teléfono:</strong>
                      <br />
                      <a 
                        href={`tel:${event.contact.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {event.contact.phone}
                      </a>
                    </div>
                    <div>
                      <strong>Email:</strong>
                      <br />
                      <a 
                        href={`mailto:${event.contact.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {event.contact.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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