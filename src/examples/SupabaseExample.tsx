import React, { useEffect, useState } from 'react';
import { sermonService, eventService, blogService } from '../services/supabaseService';

// Este es un componente de ejemplo que muestra cómo utilizar los servicios de Supabase
export function SupabaseExample() {
  const [sermons, setSermons] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    sermons: true,
    events: true,
    posts: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar prédicas
    const loadSermons = async () => {
      try {
        const data = await sermonService.getAllSermons();
        setSermons(data);
      } catch (err) {
        console.error('Error al cargar prédicas:', err);
        setError('Error al cargar prédicas');
      } finally {
        setLoading(prev => ({ ...prev, sermons: false }));
      }
    };

    // Cargar eventos
    const loadEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        setEvents(data);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
        setError('Error al cargar eventos');
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };

    // Cargar posts del blog
    const loadPosts = async () => {
      try {
        const data = await blogService.getAllPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error al cargar posts:', err);
        setError('Error al cargar posts');
      } finally {
        setLoading(prev => ({ ...prev, posts: false }));
      }
    };

    loadSermons();
    loadEvents();
    loadPosts();
  }, []);

  // Ejemplo de cómo crear un nuevo evento
  const handleCreateEvent = async () => {
    try {
      const newEvent = {
        title: 'Nuevo Evento',
        date: '2025-06-15',
        start_time: '10:00',
        end_time: '12:00',
        type: 'Evento Especial',
        location: {
          name: 'Sede Principal',
          address: 'Calle Principal #123'
        },
        description: 'Descripción del nuevo evento',
        capacity: 100,
        registrations: 0,
        image: 'https://example.com/image.jpg',
        host: 'Pastor Juan Pérez',
        requires_rsvp: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const createdEvent = await eventService.createEvent(newEvent);
      setEvents(prev => [...prev, createdEvent]);
      alert('Evento creado con éxito!');
    } catch (err) {
      console.error('Error al crear evento:', err);
      alert('Error al crear evento');
    }
  };

  if (loading.sermons || loading.events || loading.posts) {
    return <div className="p-8">Cargando datos de Supabase...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Ejemplo de Supabase</h1>
      
      {/* Sección de Prédicas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Prédicas ({sermons.length})</h2>
        <ul className="space-y-2">
          {sermons.slice(0, 3).map(sermon => (
            <li key={sermon.id} className="p-4 border rounded">
              <h3 className="font-medium">{sermon.title}</h3>
              <p className="text-sm text-gray-600">{sermon.speaker} - {sermon.date}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Sección de Eventos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Eventos ({events.length})</h2>
        <button 
          onClick={handleCreateEvent}
          className="mb-4 bg-black text-white px-4 py-2 rounded"
        >
          Crear Nuevo Evento
        </button>
        <ul className="space-y-2">
          {events.slice(0, 3).map(event => (
            <li key={event.id} className="p-4 border rounded">
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.date} - {event.location.name}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Sección de Blog */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Posts del Blog ({posts.length})</h2>
        <ul className="space-y-2">
          {posts.slice(0, 3).map(post => (
            <li key={post.id} className="p-4 border rounded">
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-sm text-gray-600">{post.published_at} - {post.author.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}