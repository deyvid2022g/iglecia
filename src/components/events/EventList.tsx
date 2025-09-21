import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Grid, List as ListIcon } from 'lucide-react';
import { EventCard } from './EventCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { eventService } from '../../services/eventService';
import { Database } from '../../types/database';
import { useEvents } from '../../hooks/useEvents';
import { useEventCategories } from '../../hooks/useEventCategories';

type Event = Database['public']['Tables']['events']['Row'];

interface EventListProps {
  categorySlug?: string;
  searchQuery?: string;
  limit?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  eventType?: 'upcoming' | 'past' | 'all';
  className?: string;
}

export const EventList: React.FC<EventListProps> = ({
  categorySlug,
  searchQuery: initialSearchQuery = '',
  limit,
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  eventType = 'all',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || '');
  const [selectedEventType, setSelectedEventType] = useState(eventType);
  const [sortBy, setSortBy] = useState<'event_date' | 'current_attendees' | 'created_at'>('event_date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const { 
    events, 
    loading, 
    error, 
    hasMore, 
    searchEvents, 
    loadMore, 
    fetchEvents 
  } = useEvents();

  const { categories } = useEventCategories();

  useEffect(() => {
    if (searchQuery.trim()) {
      searchEvents(searchQuery, selectedCategory, limit);
    } else {
      fetchEvents();
    }
  }, [selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchEvents(searchQuery, selectedCategory, limit);
    } else {
      fetchEvents();
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const filterEventsByType = (events: Event[]) => {
    const now = new Date();
    
    switch (selectedEventType) {
      case 'upcoming':
        return events.filter(event => {
          const eventDate = new Date(event.event_date);
          return eventDate > now;
        });
      case 'past':
        return events.filter(event => {
          const eventDate = new Date(event.event_date);
          return eventDate < now;
        });
      default:
        return events;
    }
  };

  const sortedAndFilteredEvents = React.useMemo(() => {
    const filtered = filterEventsByType(events);
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'current_attendees':
          return (b.current_attendees || 0) - (a.current_attendees || 0);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'event_date':
        default:
          return selectedEventType === 'past' 
            ? new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
            : new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      }
    });
  }, [events, sortBy, selectedEventType]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error al cargar los eventos: {error}</p>
        <button
          onClick={() => fetchEvents()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Search Bar */}
          {showSearch && (
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar eventos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          )}

          {/* Filters and View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {showFilters && (
                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
              )}

              {/* Event Type Filter */}
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los eventos</option>
                <option value="upcoming">Próximos</option>
                <option value="past">Pasados</option>
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="event_date">Por fecha</option>
                <option value="current_attendees">Más asistentes</option>
                <option value="created_at">Más recientes</option>
              </select>
            </div>

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Filters Panel */}
          {showFiltersPanel && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events Grid/List */}
      {loading && events.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando eventos...</p>
        </div>
      ) : sortedAndFilteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {selectedEventType === 'upcoming' 
              ? 'No hay eventos próximos.' 
              : selectedEventType === 'past'
              ? 'No hay eventos pasados.'
              : 'No se encontraron eventos.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {sortedAndFilteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                className={viewMode === 'list' ? 'md:flex md:items-center' : ''}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Cargando...' : 'Cargar más eventos'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;