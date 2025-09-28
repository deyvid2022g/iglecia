import React, { useState } from 'react';
import { X, User, Mail, Phone, Users, MessageSquare, AlertCircle, Check, Loader } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { Database } from '../types/database';

interface EventRSVPModalProps {
  event: Database['public']['Tables']['events']['Row'];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  guests: number;
  special_requests: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  guests?: string;
  general?: string;
}

export function EventRSVPModal({ event, isOpen, onClose, onSuccess }: EventRSVPModalProps) {
  const { registerForEvent } = useEvents();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    special_requests: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido';
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.phone.trim()) {
      const phoneRegex = /^[+]?[0-9\s\-()]{8,}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Por favor ingresa un teléfono válido';
      }
    }

    // Validar número de invitados
    if (formData.guests < 1) {
      newErrors.guests = 'Debe haber al menos 1 persona';
    } else if (formData.guests > 10) {
      newErrors.guests = 'Máximo 10 personas por inscripción';
    }

    // Validar capacidad del evento
    if (event.max_attendees) {
      const availableSpots = event.max_attendees - (event.current_attendees || 0);
      if (formData.guests > availableSpots) {
        newErrors.guests = `Solo quedan ${availableSpots} lugares disponibles`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 1 : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await registerForEvent(event.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        guests: formData.guests,
        special_requests: formData.special_requests.trim() || undefined
      });

      if (result.error) {
        setErrors({ general: 'Error al procesar la inscripción. Por favor intenta de nuevo.' });
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          // Reset form
          setFormData({
            name: '',
            email: '',
            phone: '',
            guests: 1,
            special_requests: ''
          });
          setIsSuccess(false);
        }, 2000);
      }
    } catch (_error) {
      setErrors({ general: 'Error inesperado. Por favor intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setErrors({});
      setIsSuccess(false);
    }
  };

  if (!isOpen) return null;

  const availableSpots = event.max_attendees ? event.max_attendees - (event.current_attendees || 0) : null;
  const isEventFull = availableSpots !== null && availableSpots <= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Inscripción al evento</h3>
            <p className="text-sm text-gray-600 mt-1">{event.title}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">¡Inscripción exitosa!</h4>
            <p className="text-green-700">
              Recibirás un email de confirmación con todos los detalles del evento.
            </p>
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Event Full Warning */}
            {isEventFull && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Evento lleno</h4>
                  <p className="text-sm text-red-700">
                    No hay lugares disponibles para este evento.
                  </p>
                </div>
              </div>
            )}

            {/* Capacity Info */}
            {!isEventFull && availableSpots !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {availableSpots} lugares disponibles
                  </span>
                </div>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((event.current_attendees || 0) / event.max_attendees!) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Tu nombre completo"
                  disabled={isSubmitting || isEventFull}
                />
              </div>
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                  disabled={isSubmitting || isEventFull}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 234 567 8900"
                  disabled={isSubmitting || isEventFull}
                />
              </div>
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Guests Field */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                Número de personas *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.guests ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting || isEventFull}
                >
                  {Array.from({ length: Math.min(10, availableSpots || 10) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </div>
              {errors.guests && <p className="text-sm text-red-600 mt-1">{errors.guests}</p>}
            </div>

            {/* Special Requests Field */}
            <div>
              <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-1">
                Solicitudes especiales (opcional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  id="special_requests"
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Necesidades dietéticas, accesibilidad, etc."
                  disabled={isSubmitting || isEventFull}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isEventFull}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Inscribiendo...
                  </>
                ) : (
                  'Inscribirse'
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              * Campos obligatorios. La inscripción es gratuita.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}