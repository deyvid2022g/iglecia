import React from 'react';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import { Database } from '../types/database';

type Event = Database['public']['Tables']['events']['Row'];

interface AddToCalendarModalProps {
  event: Event;
  onClose: () => void;
}

export const AddToCalendarModal: React.FC<AddToCalendarModalProps> = ({ event, onClose }) => {
  const formatDateTime = (date: string, time?: string) => {
    const eventDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes));
    }
    return eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDateTime = formatDateTime(event.event_date, event.start_time || undefined);
  const endDateTime = formatDateTime(event.event_date, event.end_time || undefined);

  const generateGoogleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDateTime}/${endDateTime}`,
      details: event.description || '',
      location: event.location_address ? `${event.location_name}, ${event.location_address}` : event.location_name || '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookUrl = () => {
    const params = new URLSearchParams({
      subject: event.title,
      startdt: startDateTime,
      enddt: endDateTime,
      body: event.description || '',
      location: event.location_address ? `${event.location_name}, ${event.location_address}` : event.location_name || '',
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateICSFile = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Iglesia//Event Calendar//ES',
      'BEGIN:VEVENT',
      `UID:${event.id}@iglesia.com`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location_address ? `${event.location_name}, ${event.location_address}` : event.location_name || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Agregar al Calendario</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(event.event_date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {(event.start_time || event.end_time) && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {event.start_time && new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {event.end_time && ` - ${new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
              </div>
            )}
            {event.location_name && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <div>
                  <div>{event.location_name}</div>
                  {event.location_address && (
                    <div className="text-xs text-gray-500">{event.location_address}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.open(generateGoogleCalendarUrl(), '_blank')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Google Calendar
          </button>

          <button
            onClick={() => window.open(generateOutlookUrl(), '_blank')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Outlook
          </button>

          <button
            onClick={generateICSFile}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Descargar archivo .ics
          </button>
        </div>
      </div>
    </div>
  );
};