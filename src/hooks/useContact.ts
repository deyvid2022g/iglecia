import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Firebase type definitions
export interface ContactMessage {
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

export interface NewsletterSubscription {
  id: string;
  created_at: string;
  email: string;
  name?: string;
  preferences?: Record<string, unknown>;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
}

// Hook para gestionar mensajes de contacto
export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, 'contact_messages');
      const q = query(messagesRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const messagesData: ContactMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
          responded_at: data.responded_at?.toDate?.()?.toISOString() || data.responded_at
        } as ContactMessage);
      });
      
      setMessages(messagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (message: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const messagesRef = collection(db, 'contact_messages');
      const newMessage = {
        ...message,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(messagesRef, newMessage);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const createdMessage = {
          id: docSnap.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as ContactMessage;
        
        await fetchMessages();
        return createdMessage;
      }
      throw new Error('Error al crear el mensaje');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
      throw err;
    }
  };

  const updateMessageStatus = async (id: string, status: string, respondedBy?: string, response?: string) => {
    try {
      const messageRef = doc(db, 'contact_messages', id);
      const updates: { [x: string]: FieldValue | Partial<unknown> | undefined } = { 
        status,
        updated_at: serverTimestamp()
      };
      
      if (status === 'responded' && respondedBy && response) {
        updates.responded_by = respondedBy;
        updates.responded_at = serverTimestamp();
        updates.response = response;
      }

      await updateDoc(messageRef, updates);
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar mensaje');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const messageRef = doc(db, 'contact_messages', id);
      await deleteDoc(messageRef);
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
      const subscriptionsRef = collection(db, 'newsletter_subscriptions');
      const q = query(subscriptionsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const subscriptionsData: NewsletterSubscription[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        subscriptionsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          subscribed_at: data.subscribed_at?.toDate?.()?.toISOString() || data.subscribed_at,
          unsubscribed_at: data.unsubscribed_at?.toDate?.()?.toISOString() || data.unsubscribed_at
        } as NewsletterSubscription);
      });
      
      setSubscriptions(subscriptionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (email: string, name?: string, preferences?: Record<string, unknown>) => {
    try {
      // Verificar si ya existe una suscripción activa
      const subscriptionsRef = collection(db, 'newsletter_subscriptions');
      const q = query(
        subscriptionsRef, 
        where('email', '==', email),
        where('is_active', '==', true)
      );
      const existingSnapshot = await getDocs(q);

      if (!existingSnapshot.empty) {
        throw new Error('Este email ya está suscrito al newsletter');
      }

      const newSubscription = {
        email,
        name,
        preferences,
        is_active: true,
        created_at: serverTimestamp(),
        subscribed_at: serverTimestamp()
      };
      
      const docRef = await addDoc(subscriptionsRef, newSubscription);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const createdSubscription = {
          id: docSnap.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          subscribed_at: data.subscribed_at?.toDate?.()?.toISOString() || data.subscribed_at
        } as NewsletterSubscription;
        
        await fetchSubscriptions();
        return createdSubscription;
      }
      throw new Error('Error al crear la suscripción');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse');
      throw err;
    }
  };

  const unsubscribe = async (email: string) => {
    try {
      const subscriptionsRef = collection(db, 'newsletter_subscriptions');
      const q = query(subscriptionsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(docSnapshot => {
        const subscriptionRef = doc(db, 'newsletter_subscriptions', docSnapshot.id);
        return updateDoc(subscriptionRef, {
          is_active: false,
          unsubscribed_at: serverTimestamp()
        });
      });
      
      await Promise.all(updatePromises);
      await fetchSubscriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desuscribirse');
    }
  };

  const updatePreferences = async (email: string, preferences: Record<string, unknown>) => {
    try {
      const subscriptionsRef = collection(db, 'newsletter_subscriptions');
      const q = query(
        subscriptionsRef, 
        where('email', '==', email),
        where('is_active', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(docSnapshot => {
        const subscriptionRef = doc(db, 'newsletter_subscriptions', docSnapshot.id);
        return updateDoc(subscriptionRef, { preferences });
      });
      
      await Promise.all(updatePromises);
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
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, {
        status: 'responded',
        response,
        responded_at: serverTimestamp()
      });

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
      const registrationsRef = collection(db, 'event_registrations');
      const q = query(
        registrationsRef,
        where('event_id', '==', eventId),
        where('status', '==', 'confirmed')
      );
      const querySnapshot = await getDocs(q);
      
      const emails: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.user_email) {
          emails.push(data.user_email);
        }
      });
      
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