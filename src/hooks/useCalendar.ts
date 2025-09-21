import { useState } from 'react';
import { Database } from '../types/database';

interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export const useCalendar = () => {
  const [isAdding, setIsAdding] = useState(false);

  const formatEventForCalendar = (event: Database['public']['Tables']['events']['Row']): CalendarEvent => {
    // Manejar el formato de Supabase Database
    const eventDate = event.event_date;
    const startTime = event.start_time;
    const endTime = event.end_time;
    
    // Validar que tenemos los datos necesarios
    if (!eventDate || !startTime) {
      console.error('Event missing required date/time fields:', event);
      throw new Error('Event missing required date/time fields');
    }
    
    const startDate = new Date(`${eventDate}T${startTime}`);
    
    // Validar que la fecha es válida
    if (isNaN(startDate.getTime())) {
      console.error('Invalid date created from:', { eventDate, startTime });
      throw new Error('Invalid date format');
    }
    
    // Calcular fecha de fin
    let endDate: Date;
    if (endTime) {
      endDate = new Date(`${eventDate}T${endTime}`);
      if (isNaN(endDate.getTime())) {
        // Si end_time es inválido, usar 2 horas por defecto
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      }
    } else {
      // Asume 2 horas de duración si no hay end_time
      endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    }

    return {
      title: event.title,
      description: event.description || '',
      startDate,
      endDate,
      location: (event as any).location_name || (event as any).location || ''
    };
  };

  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICSContent = (calendarEvent: CalendarEvent): string => {
    const startDateStr = formatDateForICS(calendarEvent.startDate);
    const endDateStr = formatDateForICS(calendarEvent.endDate);
    const now = formatDateForICS(new Date());

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Iglesia App//Event Calendar//ES
BEGIN:VEVENT
UID:${Date.now()}@iglesia-app.com
DTSTAMP:${now}
DTSTART:${startDateStr}
DTEND:${endDateStr}
SUMMARY:${calendarEvent.title}
DESCRIPTION:${calendarEvent.description}
LOCATION:${calendarEvent.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  };

  const downloadICSFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const addToGoogleCalendar = (calendarEvent: CalendarEvent) => {
    const startDate = calendarEvent.startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = calendarEvent.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: calendarEvent.title,
      dates: `${startDate}/${endDate}`,
      details: calendarEvent.description,
      location: calendarEvent.location || '',
      trp: 'false'
    });

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(url, '_blank');
  };

  const addToOutlookCalendar = (calendarEvent: CalendarEvent) => {
    const startDate = calendarEvent.startDate.toISOString();
    const endDate = calendarEvent.endDate.toISOString();
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: calendarEvent.title,
      startdt: startDate,
      enddt: endDate,
      body: calendarEvent.description,
      location: calendarEvent.location || ''
    });

    const url = `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    window.open(url, '_blank');
  };

  const addEventToCalendar = async (event: Event, method: 'google' | 'outlook' | 'ics' = 'ics') => {
    setIsAdding(true);
    
    try {
      const calendarEvent = formatEventForCalendar(event);
      
      switch (method) {
        case 'google':
          addToGoogleCalendar(calendarEvent);
          break;
        case 'outlook':
          addToOutlookCalendar(calendarEvent);
          break;
        case 'ics':
        default:
          const icsContent = generateICSContent(calendarEvent);
          const filename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
          downloadICSFile(icsContent, filename);
          break;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      return { success: false, error: 'Error al agregar el evento al calendario' };
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addEventToCalendar,
    isAdding
  };
};