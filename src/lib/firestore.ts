import { collection, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

// Reutilizando las interfaces existentes
export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  role: 'admin' | 'pastor' | 'leader' | 'member'
  join_date: string
  last_login?: string
  is_active: boolean
  bio?: string
  created_at: string
  updated_at: string
}

export interface Location {
    id: string;
    name: string;
    address: string;
    full_address: string;
    latitude: number;
    longitude: number;
}

export interface Event {
  id: string
  slug: string
  title: string
  description: string
  detailed_description?: string
  event_date: any
  start_time: string
  end_time: string
  type: string
  location_id?: string
  capacity?: number
  current_registrations: number
  image_url?: string
  host_name?: string // Changed from host to host_name
  host_description?: string // Changed from host_bio to host_description
  requires_rsvp: boolean
  cost: string
  requirements?: string[]
  tags?: string[]
  contact_phone?: string
  contact_email?: string
  is_published: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EventWithLocation extends Event {
    location: Location | null;
}


export interface Sermon {
  id: string
  slug: string
  title: string
  description: string
  speaker: string
  sermon_date: string
  duration?: string
  thumbnail_url?: string
  video_url?: string
  audio_url?: string
  transcript?: string
  has_transcript: boolean
  view_count: number
  like_count: number
  comment_count: number
  tags?: string[]
  category_id?: string
  is_published: boolean
  featured: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featured_image_url?: string
  author_id?: string
  category_id?: string
  tags?: string[]
  published_at?: any
  read_time?: number
  view_count: number
  like_count: number
  comment_count: number
  is_published: boolean
  is_featured: boolean
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

export interface Ministry {
  id: string
  name: string
  slug: string
  description: string
  detailed_description?: string
  icon?: string
  color?: string
  image_url?: string
  leader_id?: string
  target_age_group?: string
  meeting_schedule?: string
  meeting_location?: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ChurchSetting {
  id: string
  setting_key: string
  setting_value: string
  category: string
  description?: string
  data_type: 'string' | 'number' | 'boolean' | 'json'
  is_public: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ServiceSchedule {
  id: string
  service_name: string
  day_of_week: number
  start_time: string
  end_time: string
  service_type: string
  location?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OfficeHours {
  id: string
  department: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpecialDate {
  id: string
  title: string
  description?: string
  date: string
  date_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChurchFacility {
  id: string
  name: string
  description?: string
  facility_type: string
  capacity?: number
  floor_level?: number
  is_public: boolean
  is_active: boolean
  display_order: number
  amenities?: string[]
  booking_rules?: string
  hourly_rate?: number
  contact_person?: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

export interface FacilityBooking {
  id: string
  facility_id: string
  booked_by: string
  event_title: string
  event_description?: string
  start_datetime: string
  end_datetime: string
  attendee_count?: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  special_requirements?: string
  contact_phone?: string
  contact_email?: string
  created_at: string
  updated_at: string
}

export interface BlogPostWithAuthor extends BlogPost {
    author: Profile | null;
}

export async function getBlogPostsWithAuthors(): Promise<BlogPostWithAuthor[]> {
    try {
        const postsCollection = collection(db, 'blog_posts');
        const q = query(postsCollection, where("is_published", "==", true), orderBy('published_at', 'desc'));
        const postSnapshots = await getDocs(q);
        const posts: BlogPost[] = postSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

        const postsWithAuthors = await Promise.all(posts.map(async (post) => {
            let author: Profile | null = null;
            if (post.author_id) {
                const authorDoc = await getDoc(doc(db, 'profiles', post.author_id));
                if (authorDoc.exists()) {
                    author = authorDoc.data() as Profile;
                }
            }
            return { ...post, author };
        }));

        return postsWithAuthors;
    } catch (error) {
        console.error("Error fetching blog posts with authors:", error);
        return [];
    }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
    try {
        const postsCollection = collection(db, 'blog_posts');
        const q = query(postsCollection, where('slug', '==', slug), limit(1));
        const postSnapshots = await getDocs(q);

        if (postSnapshots.empty) {
            return null;
        }

        const post = { id: postSnapshots.docs[0].id, ...postSnapshots.docs[0].data() } as BlogPost;
        let author: Profile | null = null;

        if (post.author_id) {
            const authorDoc = await getDoc(doc(db, 'profiles', post.author_id));
            if (authorDoc.exists()) {
                author = authorDoc.data() as Profile;
            }
        }

        return { ...post, author };
    } catch (error) {
        console.error(`Error fetching blog post with slug ${slug}:`, error);
        return null;
    }
}

export async function getEvents(options?: { published?: boolean, limit?: number, type?: string }): Promise<Event[]> {
    try {
        const eventsCollection = collection(db, 'events');
        let q = query(eventsCollection, orderBy('event_date', 'asc'));

        if (options?.published !== undefined) {
            q = query(q, where('is_published', '==', options.published));
        }
        if (options?.type) {
            q = query(q, where('type', '==', options.type));
        }
        if (options?.limit) {
            q = query(q, limit(options.limit));
        }

        const eventSnapshots = await getDocs(q);
        const events: Event[] = eventSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        
        return events;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export async function getLocationById(id: string): Promise<Location | null> {
    try {
        const locDoc = await getDoc(doc(db, 'locations', id));
        if (locDoc.exists()) {
            return { id: locDoc.id, ...locDoc.data() } as Location;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching location with id ${id}:`, error);
        return null;
    }
}

export async function getEventBySlug(slug: string): Promise<EventWithLocation | null> {
    try {
        const eventsCollection = collection(db, 'events');
        const q = query(eventsCollection, where('slug', '==', slug), limit(1));
        const eventSnapshots = await getDocs(q);

        if (eventSnapshots.empty) {
            return null;
        }

        const event = { id: eventSnapshots.docs[0].id, ...eventSnapshots.docs[0].data() } as Event;
        let location: Location | null = null;

        if (event.location_id) {
            location = await getLocationById(event.location_id);
        }

        return { ...event, location };
    } catch (error) {
        console.error(`Error fetching event with slug ${slug}:`, error);
        return null;
    }
}
