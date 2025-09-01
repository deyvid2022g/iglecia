import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
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
export interface ChurchSetting {
  id: string;
  created_at: string;
  updated_at: string;
  setting_key: string;
  setting_value: string;
  category: string;
  description?: string;
  is_public: boolean;
  display_order: number;
}

export interface ServiceSchedule {
  id: string;
  created_at: string;
  updated_at: string;
  service_name: string;
  service_type: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  description?: string;
  is_active: boolean;
  location?: string;
}

export interface OfficeHours {
  id: string;
  created_at: string;
  updated_at: string;
  department: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  notes?: string;
}

export interface SpecialDate {
  id: string;
  created_at: string;
  updated_at: string;
  event_name: string;
  event_date: string;
  event_type: string;
  description?: string;
  is_active: boolean;
}

export interface ChurchFacility {
  id: string;
  created_at: string;
  updated_at: string;
  facility_name: string;
  facility_type: string;
  description?: string;
  capacity: number;
  hourly_rate?: number;
  is_bookable: boolean;
  is_public: boolean;
  floor_level: number;
  is_active: boolean;
}

export interface FacilityBooking {
  id: string;
  created_at: string;
  updated_at: string;
  facility_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  start_datetime: string;
  end_time: string;
  purpose: string;
  status: string;
  total_cost?: number;
  notes?: string;
}

export interface SystemNotification {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Hook principal para configuraciones de la iglesia
export function useChurchSettings() {
  const [settings, setSettings] = useState<ChurchSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = collection(db, 'church_settings');
      const q = query(settingsRef, orderBy('display_order'));
      const querySnapshot = await getDocs(q);
      
      const settingsData: ChurchSetting[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        settingsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as ChurchSetting);
      });
      
      setSettings(settingsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const settingsRef = collection(db, 'church_settings');
      const q = query(settingsRef, where('setting_key', '==', key));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const settingDoc = querySnapshot.docs[0];
        const settingRef = doc(db, 'church_settings', settingDoc.id);
        await updateDoc(settingRef, {
          setting_value: value,
          updated_at: serverTimestamp()
        });
      }
      
      await fetchSettings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar configuración');
    }
  };

  const getSetting = (key: string): string | null => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value || null;
  };

  const getSettingAsync = async (key: string): Promise<string | null> => {
    try {
      const settingsRef = collection(db, 'church_settings');
      const q = query(settingsRef, where('setting_key', '==', key));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const settingDoc = querySnapshot.docs[0];
        const data = settingDoc.data();
        return data.setting_value || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      return null;
    }
  };

  const getPublicSettings = () => {
    return settings.filter(s => s.is_public);
  };

  const getPublicSettingsAsync = async (): Promise<ChurchSetting[]> => {
    try {
      const settingsRef = collection(db, 'church_settings');
      const q = query(
        settingsRef, 
        where('is_public', '==', true),
        orderBy('display_order')
      );
      const querySnapshot = await getDocs(q);
      
      const settingsData: ChurchSetting[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        settingsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as ChurchSetting);
      });
      
      return settingsData;
    } catch (error) {
      console.error('Error al obtener configuraciones públicas:', error);
      return [];
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  const getSettingsByCategoryAsync = async (category: string): Promise<ChurchSetting[]> => {
    try {
      const settingsRef = collection(db, 'church_settings');
      const q = query(
        settingsRef, 
        where('category', '==', category),
        orderBy('display_order')
      );
      const querySnapshot = await getDocs(q);
      
      const settingsData: ChurchSetting[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        settingsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as ChurchSetting);
      });
      
      return settingsData;
    } catch (error) {
      console.error('Error al obtener configuraciones por categoría:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
    getSettingAsync,
    getPublicSettings,
    getPublicSettingsAsync,
    getSettingsByCategory,
    getSettingsByCategoryAsync,
    refetch: fetchSettings
  };
}

// Hook para horarios de servicios
export function useServiceSchedules() {
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const schedulesRef = collection(db, 'service_schedules');
      const q = query(
        schedulesRef,
        where('is_active', '==', true),
        orderBy('day_of_week'),
        orderBy('start_time')
      );
      const querySnapshot = await getDocs(q);
      
      const schedulesData: ServiceSchedule[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        schedulesData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as ServiceSchedule);
      });
      
      setSchedules(schedulesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (schedule: Omit<ServiceSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const schedulesRef = collection(db, 'service_schedules');
      await addDoc(schedulesRef, {
        ...schedule,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      await fetchSchedules();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear horario');
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ServiceSchedule>) => {
    try {
      const scheduleRef = doc(db, 'service_schedules', id);
      await updateDoc(scheduleRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
      
      await fetchSchedules();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar horario');
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const scheduleRef = doc(db, 'service_schedules', id);
      await deleteDoc(scheduleRef);
      
      await fetchSchedules();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar horario');
    }
  };

  const getSchedulesByDay = (dayOfWeek: number) => {
    return schedules.filter(s => s.day_of_week === dayOfWeek);
  };

  const getSchedulesByType = (serviceType: string) => {
    return schedules.filter(s => s.service_type === serviceType);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDay,
    getSchedulesByType,
    refetch: fetchSchedules
  };
}

// Hook para horarios de atención
export function useOfficeHours() {
  const [officeHours, setOfficeHours] = useState<OfficeHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOfficeHours = async () => {
    try {
      setLoading(true);
      const officeHoursRef = collection(db, 'office_hours');
      const q = query(
        officeHoursRef,
        where('is_active', '==', true),
        orderBy('day_of_week'),
        orderBy('start_time')
      );
      const querySnapshot = await getDocs(q);
      
      const officeHoursData: OfficeHours[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        officeHoursData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as OfficeHours);
      });
      
      setOfficeHours(officeHoursData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar horarios de atención');
    } finally {
      setLoading(false);
    }
  };

  const getHoursByDepartment = (department: string) => {
    return officeHours.filter(h => h.department === department);
  };

  const getHoursByDay = (dayOfWeek: number) => {
    return officeHours.filter(h => h.day_of_week === dayOfWeek);
  };

  useEffect(() => {
    fetchOfficeHours();
  }, []);

  return {
    officeHours,
    loading,
    error,
    getHoursByDepartment,
    getHoursByDay,
    refetch: fetchOfficeHours
  };
}

// Hook para fechas especiales
export function useSpecialDates() {
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialDates = async () => {
    try {
      setLoading(true);
      const specialDatesRef = collection(db, 'special_dates');
      const q = query(
        specialDatesRef,
        where('is_active', '==', true),
        orderBy('event_date')
      );
      const querySnapshot = await getDocs(q);
      
      const specialDatesData: SpecialDate[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        specialDatesData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as SpecialDate);
      });
      
      setSpecialDates(specialDatesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar fechas especiales');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingDates = (limit: number = 5) => {
    const today = new Date().toISOString().split('T')[0];
    return specialDates
      .filter(d => d.event_date >= today)
      .slice(0, limit);
  };

  const getDatesByType = (dateType: string) => {
    return specialDates.filter(d => d.event_type === dateType);
  };

  useEffect(() => {
    fetchSpecialDates();
  }, []);

  return {
    specialDates,
    loading,
    error,
    getUpcomingDates,
    getDatesByType,
    refetch: fetchSpecialDates
  };
}

// Hook para instalaciones de la iglesia
export function useChurchFacilities() {
  const [facilities, setFacilities] = useState<ChurchFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const facilitiesRef = collection(db, 'church_facilities');
      const q = query(
        facilitiesRef,
        where('is_active', '==', true),
        orderBy('facility_name')
      );
      const querySnapshot = await getDocs(q);
      
      const facilitiesData: ChurchFacility[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        facilitiesData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as ChurchFacility);
      });
      
      setFacilities(facilitiesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar instalaciones');
    } finally {
      setLoading(false);
    }
  };

  const getFacilitiesByType = (facilityType: string) => {
    return facilities.filter(f => f.facility_type === facilityType);
  };

  const getPublicFacilities = () => {
    return facilities.filter(f => f.is_public);
  };

  const getFacilitiesByFloor = (floorLevel: number) => {
    return facilities.filter(f => f.floor_level === floorLevel);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return {
    facilities,
    loading,
    error,
    getFacilitiesByType,
    getPublicFacilities,
    getFacilitiesByFloor,
    refetch: fetchFacilities
  };
}

// Hook para reservas de instalaciones
export function useFacilityBookings() {
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, 'facility_bookings');
      const q = query(bookingsRef, orderBy('booking_date'), orderBy('start_time'));
      const querySnapshot = await getDocs(q);
      
      const bookingsData: FacilityBooking[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookingsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as FacilityBooking);
      });
      
      setBookings(bookingsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (booking: Omit<FacilityBooking, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const bookingsRef = collection(db, 'facility_bookings');
      await addDoc(bookingsRef, {
        ...booking,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      await fetchBookings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear reserva');
    }
  };

  const updateBookingStatus = async (id: string, status: string, approvedBy?: string, rejectionReason?: string) => {
    try {
      const updates: Record<string, FieldValue | string> = { 
        status,
        updated_at: serverTimestamp()
      };
      if (status === 'approved' && approvedBy) {
        updates.approved_by = approvedBy;
        updates.approved_at = serverTimestamp();
      }
      if (status === 'rejected' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const bookingRef = doc(db, 'facility_bookings', id);
      await updateDoc(bookingRef, updates);
      
      await fetchBookings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar reserva');
    }
  };

  const getBookingsByFacility = (facilityId: string) => {
    return bookings.filter(b => b.facility_id === facilityId);
  };

  const getBookingsByStatus = (status: string) => {
    return bookings.filter(b => b.status === status);
  };

  const getUpcomingBookings = () => {
    const now = new Date().toISOString();
    return bookings.filter(b => b.start_datetime >= now && b.status === 'approved');
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    getBookingsByFacility,
    getBookingsByStatus,
    getUpcomingBookings,
    refetch: fetchBookings
  };
}

// Hook para notificaciones del sistema
export function useSystemNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'system_notifications');
      const now = new Date().toISOString();
      const q = query(
        notificationsRef,
        where('is_active', '==', true),
        where('end_date', '>=', now),
        orderBy('end_date'),
        orderBy('priority', 'desc'),
        orderBy('start_date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notificationsData: SystemNotification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as SystemNotification);
      });
      
      setNotifications(notificationsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notification: Omit<SystemNotification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const notificationsRef = collection(db, 'system_notifications');
      await addDoc(notificationsRef, {
        ...notification,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      await fetchNotifications();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear notificación');
    }
  };

  const markAsRead = async (notificationId: string, userId: string) => {
    try {
      const readsRef = collection(db, 'notification_reads');
      const q = query(
        readsRef,
        where('notification_id', '==', notificationId),
        where('user_id', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await addDoc(readsRef, {
          notification_id: notificationId,
          user_id: userId,
          read_at: serverTimestamp(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      } else {
        const docRef = doc(db, 'notification_reads', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          read_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al marcar como leída');
    }
  };

  const dismissNotification = async (notificationId: string, userId: string) => {
    try {
      const readsRef = collection(db, 'notification_reads');
      const q = query(
        readsRef,
        where('notification_id', '==', notificationId),
        where('user_id', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await addDoc(readsRef, {
          notification_id: notificationId,
          user_id: userId,
          read_at: serverTimestamp(),
          dismissed_at: serverTimestamp(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      } else {
        const docRef = doc(db, 'notification_reads', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          read_at: serverTimestamp(),
          dismissed_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al descartar notificación');
    }
  };

  const getNotificationsByPriority = (priority: string) => {
    return notifications.filter(n => n.priority === priority);
  };

  const getNotificationsByType = (notificationType: string) => {
    return notifications.filter(n => n.notification_type === notificationType);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    createNotification,
    markAsRead,
    dismissNotification,
    getNotificationsByPriority,
    getNotificationsByType,
    refetch: fetchNotifications
  };
}

// Hook para obtener configuración específica de la iglesia
export function useChurchInfo() {
  const { getSetting, loading, error } = useChurchSettings();

  const churchInfo = {
    name: getSetting('church_name') || 'Iglesia Cristiana',
    tagline: getSetting('church_tagline') || '',
    vision: getSetting('church_vision') || '',
    mission: getSetting('church_mission') || '',
    address: getSetting('church_address') || '',
    phone: getSetting('church_phone') || '',
    whatsapp: getSetting('church_whatsapp') || '',
    email: getSetting('church_email') || '',
    website: getSetting('church_website') || '',
    facebook: getSetting('facebook_url') || '',
    instagram: getSetting('instagram_url') || '',
    youtube: getSetting('youtube_url') || '',
    logo: getSetting('logo_url') || '/Pastor Reynel Dueñas P n g.png',
    primaryColor: getSetting('primary_color') || '#2563eb',
    secondaryColor: getSetting('secondary_color') || '#64748b'
  };

  return {
    churchInfo,
    loading,
    error
  };
}