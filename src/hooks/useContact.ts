import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// TODO: Generate database types using Supabase CLI
// For now using a placeholder type definition
type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string;
          phone?: string;
          subject: string;
          message: string;
          status: string;
          source?: string;
          metadata?: Record<string, unknown>;
          responded_by?: string;
          responded_at?: string;
          response?: string;
        }
      },
      newsletter_subscriptions: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          name?: string;
          preferences?: Record<string, unknown>;
          is_active: boolean;
          subscribed_at: string;
          unsubscribed_at?: string;
        }
      }
    }
  }
}

type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
type NewsletterSubscription = Database['public']['Tables']['newsletter_subscriptions']['Row'];

// Hook para gestionar mensajes de contacto
export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (message: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      await fetchMessages();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
      throw err;
    }
  };

  const updateMessageStatus = async (id: string, status: string, respondedBy?: string, response?: string) => {
    try {
      const updates: Record<string, unknown> = { status };
      if (status === 'responded' && respondedBy && response) {
        updates.responded_by = respondedBy;
        updates.responded_at = new Date().toISOString();
        updates.response = response;
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar mensaje');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar mensaje');
    }
  };

  const getMessagesByStatus = (status: string) => {
    return messages.filter(m => m.status === status);
  };

  const getMessagesBySubject = (subject: string) => {
    return messages.filter(m => m.subject === subject);
  };

  const getUnreadMessages = () => {
    return messages.filter(m => m.status === 'pending');
  };

  const getMessagesByDateRange = (startDate: string, endDate: string) => {
    return messages.filter(m => {
      const messageDate = new Date(m.created_at).toISOString().split('T')[0];
      return messageDate >= startDate && messageDate <= endDate;
    });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    error,
    createMessage,
    updateMessageStatus,
    deleteMessage,
    getMessagesByStatus,
    getMessagesBySubject,
    getUnreadMessages,
    getMessagesByDateRange,
    refetch: fetchMessages
  };
}

// Hook para gestionar suscripciones al newsletter
export function useNewsletterSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (email: string, name?: string, preferences?: Record<string, unknown>) => {
    try {
      // Verificar si ya existe una suscripción activa
      const { data: existing } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (existing) {
        throw new Error('Este email ya está suscrito al newsletter');
      }

      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{
          email,
          name,
          preferences,
          is_active: true,
          subscribed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchSubscriptions();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse');
      throw err;
    }
  };

  const unsubscribe = async (email: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;
      await fetchSubscriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desuscribirse');
    }
  };

  const updatePreferences = async (email: string, preferences: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ preferences })
        .eq('email', email)
        .eq('is_active', true);

      if (error) throw error;
      await fetchSubscriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar preferencias');
    }
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter(s => s.is_active);
  };

  const getSubscriptionByEmail = (email: string) => {
    return subscriptions.find(s => s.email === email && s.is_active);
  };

  const getSubscriptionStats = () => {
    const active = subscriptions.filter(s => s.is_active).length;
    const inactive = subscriptions.filter(s => !s.is_active).length;
    const total = subscriptions.length;
    
    return {
      active,
      inactive,
      total,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    subscribe,
    unsubscribe,
    updatePreferences,
    getActiveSubscriptions,
    getSubscriptionByEmail,
    getSubscriptionStats,
    refetch: fetchSubscriptions
  };
}

// Hook para envío de emails (requiere configuración de servicio de email)
export function useEmailService() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendContactResponse = async (messageId: string, response: string, recipientEmail: string) => {
    try {
      setSending(true);
      setError(null);

      // Aquí se integraría con un servicio de email como SendGrid, Resend, etc.
      // Por ahora, solo actualizamos el estado del mensaje
      const { error } = await supabase
        .from('contact_messages')
        .update({
          status: 'responded',
          response,
          responded_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      // TODO: Implementar envío real de email
      console.log('Email enviado a:', recipientEmail);
      console.log('Respuesta:', response);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar respuesta');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const sendNewsletter = async (subject: string, _content: string, recipientEmails: string[]) => {
    try {
      setSending(true);
      setError(null);

      // TODO: Implementar envío masivo de newsletter
      console.log('Newsletter enviado a:', recipientEmails.length, 'suscriptores');
      console.log('Asunto:', subject);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar newsletter');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const sendEventNotification = async (eventId: string, _subject: string, _content: string) => {
    try {
      setSending(true);
      setError(null);

      // Obtener emails de usuarios registrados al evento
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select(`
          profiles!inner(email)
        `)
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      const emails = registrations?.map(r => r.profiles?.email).filter(Boolean) || [];
      
      if (emails.length > 0) {
        // TODO: Implementar envío de notificaciones de evento
        console.log('Notificación de evento enviada a:', emails.length, 'participantes');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar notificación');
      throw err;
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    error,
    sendContactResponse,
    sendNewsletter,
    sendEventNotification
  };
}

// Hook para formularios de contacto rápido
export function useQuickContact() {
  const { createMessage } = useContactMessages();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContactForm = async (formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    source?: string;
  }) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      await createMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        source: formData.source || 'website',
        status: 'pending'
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setSubmitting(false);
    }
  };

  const submitPrayerRequest = async (formData: {
    name: string;
    email?: string;
    phone?: string;
    request: string;
    isUrgent?: boolean;
    isPrivate?: boolean;
  }) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      await createMessage({
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone,
        subject: formData.isUrgent ? 'Petición de Oración Urgente' : 'Petición de Oración',
        message: formData.request,
        source: 'prayer_request',
        status: 'pending',
        metadata: {
          isUrgent: formData.isUrgent,
          isPrivate: formData.isPrivate
        }
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar petición');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError(null);
  };

  return {
    submitting,
    success,
    error,
    submitContactForm,
    submitPrayerRequest,
    resetForm
  };
}