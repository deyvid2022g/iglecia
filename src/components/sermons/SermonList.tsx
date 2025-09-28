import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List as ListIcon, BookOpen } from 'lucide-react';
import { SermonCard } from './SermonCard';
import { useSermons } from '../../hooks/useSermons';
import { useSermonCategories } from '../../hooks/useSermonCategories';
import { Sermon } from '../../services/sermonService';

interface SermonListProps {
  categorySlug?: string;
  searchQuery?: string;
  limit?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  seriesName?: string;
  className?: string;
}

export const SermonList: React.FC<SermonListProps> = ({
  categorySlug,
  searchQuery: initialSearchQuery = '',
  limit,
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  seriesName,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || '');
  const [selectedSeries, setSelectedSeries] = useState(seriesName || '');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'audio' | 'text'>('all');
  const [sortBy, setSortBy] = useState<'sermon_date' | 'view_count' | 'like_count'>('sermon_date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const { 
    sermons, 
    loading, 
    error,
    hasMore,
    fetchSermons,
    searchSermons,
    loadMore
  } = useSermons();

  const { categories } = useSermonCategories();

  const seriesNames = React.useMemo(() => {
    const series = new Set<string>();
    sermons.forEach(sermon => {
      // Los sermones no tienen series_name en la base de datos
      // Podríamos usar tags o category para agrupar
      if (sermon.tags && sermon.tags.length > 0) {
        sermon.tags.forEach((tag: string) => series.add(tag));
      }
    });
    return Array.from(series);
  }, [sermons]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchSermons(searchQuery);
    } else {
      fetchSermons();
    }
  }, [selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchSermons(searchQuery);
    } else {
      fetchSermons();
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const filterSermonsByMedia = (sermons: Sermon[]) => {
    switch (mediaFilter) {
      case 'video':
        return sermons.filter(sermon => sermon.video_url);
      case 'audio':
        return sermons.filter(sermon => sermon.audio_url && !sermon.video_url);
      case 'text':
        return sermons.filter(sermon => !sermon.video_url && !sermon.audio_url);
      default:
        return sermons;
    }
  };

  const filterSermonsBySeries = (sermons: Sermon[]) => {
    if (!selectedSeries) return sermons;
    return sermons.filter(sermon => sermon.tags?.includes(selectedSeries));
  };

  const sortedAndFilteredSermons = React.useMemo(() => {
    let filtered = filterSermonsByMedia(sermons);
    filtered = filterSermonsBySeries(filtered);
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'view_count':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'like_count':
          return (b.like_count || 0) - (a.like_count || 0);
        default:
          const dateA = new Date(a.sermon_date || a.created_at);
        const dateB = new Date(b.sermon_date || b.created_at);
          return dateB.getTime() - dateA.getTime();
      }
    });
  }, [sermons, sortBy, mediaFilter, selectedSeries]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error al cargar los sermones: {error}</p>
        <button
          onClick={() => fetchSermons()}
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
                  placeholder="Buscar sermones por título, predicador o referencia bíblica..."
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

              {/* Media Type Filter */}
              <select
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los medios</option>
                <option value="video">Solo videos</option>
                <option value="audio">Solo audios</option>
                <option value="text">Solo texto</option>
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sermon_date">Más recientes</option>
                <option value="view_count">Más vistos</option>
                <option value="like_count">Más gustados</option>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* Series Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serie
                  </label>
                  <select
                    value={selectedSeries}
                    onChange={(e) => setSelectedSeries(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las series</option>
                    {seriesNames.map((series) => (
                      <option key={series} value={series}>
                        {series}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sermons Grid/List */}
      {loading && sermons.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando sermones...</p>
        </div>
      ) : sortedAndFilteredSermons.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron sermones.</p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {sortedAndFilteredSermons.map((sermon) => (
              <SermonCard
                key={sermon.id}
                sermon={sermon}
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
                {loading ? 'Cargando...' : 'Cargar más sermones'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SermonList;