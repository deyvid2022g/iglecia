
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { BlogPost, Profile, Event, Location, EventWithLocation } from './supabase'; // Reutilizando las interfaces existentes

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
