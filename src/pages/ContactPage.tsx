import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Facebook,
  Instagram,
  Youtube,
  CheckCircle
} from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    reason: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reasons = [
    { value: 'general', label: 'Conocer más sobre la iglesia' },
    { value: 'prayer', label: 'Necesito oración e intercesión' },
    { value: 'counseling', label: 'Consejería y cuidado pastoral' },
    { value: 'salvation', label: 'Quiero entregar mi vida a Cristo' },
    { value: 'ministry', label: 'Llamado al ministerio' },
    { value: 'healing', label: 'Necesito sanidad y liberación' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after showing success message
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        reason: 'general'
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono principal',
      details: ['+57 (311) 533 1485', 'Lunes a viernes: 8:00 AM - 6:00 PM'],
      action: { label: 'Llamar ahora', href: 'tel:+573115331485' }
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      details: ['+57 (311) 533 1485', 'Respuesta inmediata'],
      action: { label: 'Enviar WhatsApp', href: 'https://wa.me/573115331485' }
    },
    {
      icon: Mail,
      title: 'Correo electrónico',
      details: ['iglecristianalugarderefugio@gmail.com', 'Respuesta en 24 horas'],
      action: { label: 'Enviar email', href: 'mailto:iglecristianalugarderefugio@gmail.com' }
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      details: ['Sede Principal', 'Lugar de Refugio'],
      action: { label: 'Ver en mapa', href: 'https://maps.app.goo.gl/nd7LKuAjmiZNDVTD9?g_st=ic' }
    }
  ];

  const schedules = [
    { day: 'Lunes a Viernes', times: ['8:00 AM - 6:00 PM'] },
    { day: 'Sábado', times: ['9:00 AM - 1:00 PM'] },
    { day: 'Domingo', times: ['Cerrado'] }
  ];

  if (isSubmitted) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">¡Mensaje enviado!</h1>
          <p className="text-gray-600 mb-6">
            Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <strong>Tiempo de respuesta:</strong><br />
              Email: 24 horas • WhatsApp: Inmediato
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Dios tiene un encuentro contigo
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Creemos que cada contacto es una cita divina. Si Dios puso en tu corazón buscarnos, 
              es porque tiene algo especial preparado para ti. Permítenos ser parte de tu historia de fe.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium mb-2">
                        Motivo del contacto
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      >
                        {reasons.map(reason => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Resumen breve de tu mensaje"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn-primary w-full flex items-center justify-center ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                  </button>

                  <p className="text-xs text-gray-600 text-center">
                    Al enviar este formulario, aceptas que utilicemos tu información para responderte. 
                    Respetamos tu privacidad y no compartimos tus datos.
                  </p>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Contact Methods */}
                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="card">
                        <div className="flex items-start">
                          <div className="bg-gray-100 p-3 rounded-lg mr-4">
                            <IconComponent className="w-6 h-6 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{info.title}</h3>
                            {info.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="text-sm text-gray-600">
                                {detail}
                              </div>
                            ))}
                            <a
                              href={info.action.href}
                              target={info.action.href.startsWith('http') ? '_blank' : undefined}
                              rel={info.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="inline-block mt-2 text-black font-medium hover:underline focus-ring"
                            >
                              {info.action.label}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Schedule */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Horarios de atención
                  </h3>
                  <div className="space-y-2">
                    {schedules.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <span className="font-medium">{schedule.day}:</span>
                        <div className="text-right">
                          {schedule.times.map((time, timeIndex) => (
                            <div key={timeIndex} className="text-gray-600">{time}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
                  <div className="space-y-3">
                    <a
                      href="https://www.facebook.com/watch/lugarderefugioad/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors focus-ring"
                    >
                      <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium">Facebook</span>
                    </a>
                    <a
                      href="https://www.instagram.com/iglelugarderefugio?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors focus-ring"
                    >
                      <Instagram className="w-5 h-5 mr-3 text-pink-600" />
                      <span className="font-medium">Instagram</span>
                    </a>
                    <a
                      href="https://www.youtube.com/@iglelugarederfugio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors focus-ring"
                    >
                      <Youtube className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">YouTube</span>
                    </a>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="card bg-red-50 border-red-200">
                  <h3 className="text-lg font-semibold mb-2 text-red-800">Emergencias pastorales</h3>
                  <p className="text-sm text-red-700 mb-3">
                    Para situaciones urgentes que requieren atención pastoral inmediata
                  </p>
                  <a
                    href="tel:+573024941293"
                    className="btn-primary bg-red-600 hover:bg-red-700 text-white border-red-600 w-full text-center"
                  >
                    Llamar línea de emergencia
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Encuéntranos</h2>
            <div className="bg-gray-300 aspect-video rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="w-12 h-12 mx-auto mb-4" />
                <p className="font-medium mb-2">Mapa interactivo</p>
                <p className="text-sm">Barranquilla, Colombia</p>
                <a
                  href="https://maps.app.goo.gl/nd7LKuAjmiZNDVTD9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-4 inline-flex items-center"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Transporte público</h3>
                <p className="text-sm text-gray-600">
                  Buses: Líneas 45, 67, 89<br />
                  Parada más cercana: Plaza Central
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Estacionamiento</h3>
                <p className="text-sm text-gray-600">
                  150 espacios disponibles<br />
                  Gratuito para todos los servicios
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Accesibilidad</h3>
                <p className="text-sm text-gray-600">
                  Rampa de acceso<br />
                  Baños adaptados disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}