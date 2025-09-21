import React from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Database } from '../../types/database';

type Event = Database['public']['Tables']['events']['Row'];

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5); // HH:MM format
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      service: 'Servicio',
      conference: 'Conferencia',
      workshop: 'Taller',
      social: 'Actividad Social',
      outreach: 'Evangelización',
      other: 'Otro'
    };
    return typeLabels[type] || type;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {event.featured_image && (
        <img 
          src={event.featured_image} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          
          {event.start_time && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                {formatTime(event.start_time)}
                {event.end_time && ` - ${formatTime(event.end_time)}`}
              </span>
            </div>
          )}
          
          {(event.location_name || event.location_address) && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>
                {event.location_name}
                {event.location_address && `, ${event.location_address}`}
              </span>
            </div>
          )}
          
          {event.max_attendees && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>Máximo {event.max_attendees} asistentes</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {getTypeLabel(event.type)}
          </span>
          {event.is_featured && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Destacado
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;