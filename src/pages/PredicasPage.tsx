import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Share2, Clock, Tag, Search, Heart, MessageCircle, Filter, Grid, List, Calendar, User, BookOpen, Video, Headphones, FileText } from 'lucide-react';
import { 
  useSermonCategories, 
  useSermonSeries, 
  useSermonFilters,
  useSermonInteractions 
} from '../hooks/useSermons';

export function PredicasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [hasTranscript, setHasTranscript] = useState<boolean | undefined>(undefined);
  const [hasVideo, setHasVideo] = useState<boolean | undefined>(undefined);
  const [hasAudio, setHasAudio] = useState<boolean | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'sermon_date' | 'title' | 'view_count' | 'likes_count'>('sermon_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Hooks for data
  const { categories } = useSermonCategories();
  const { series } = useSermonSeries();
  
  // Build filters object
  const filters = {
    category: selectedCategory || undefined,
    series: selectedSeries || undefined,
    speaker: selectedSpeaker || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
    hasTranscript,
    hasVideo,
    hasAudio,
    dateRange: (dateRange.start || dateRange.end) ? dateRange : undefined
  };

  const { sermons, loading, error } = useSermonFilters(filters, searchTerm, sortBy, sortOrder);
  const { toggleLike } = useSermonInteractions();
  
  // Get unique speakers from sermons
  const speakers = Array.from(new Set((sermons || []).map(sermon => sermon.speaker).filter(Boolean)));
  const tags = Array.from(new Set((sermons || []).flatMap(sermon => sermon.tags || [])));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeries('');
    setSelectedSpeaker('');
    setSelectedTag('');
    setHasTranscript(undefined);
    setHasVideo(undefined);
    setHasAudio(undefined);
    setDateRange({});
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedSeries || selectedSpeaker || 
    selectedTag || hasTranscript !== undefined || hasVideo !== undefined || 
    hasAudio !== undefined || dateRange.start || dateRange.end;
  
  // Function to handle liking a sermon
  const handleLike = async (sermonId: string | number) => {
    try {
      await toggleLike(String(sermonId));
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };
  
  // Function to share a sermon
  const shareSermon = (sermon: { title: string; speaker: string; slug: string }) => {
    if (navigator.share) {
      navigator.share({
        title: sermon.title,
        text: `Te recomiendo escuchar esta prédica: ${sermon.title} por ${sermon.speaker}`,
        url: window.location.origin + '/predicas/' + sermon.slug
      })
      .catch((error) => console.log('Error compartiendo:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      const dummyInput = document.createElement('input');
      document.body.appendChild(dummyInput);
      dummyInput.value = window.location.origin + '/predicas/' + sermon.slug;
      dummyInput.select();
      document.execCommand('copy');
      document.body.removeChild(dummyInput);
      alert('Enlace copiado al portapapeles. ¡Compártelo con tus amigos!');
    }
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Prédicas que Transforman Vidas
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Mensajes ungidos que revelan los misterios del Reino. Cada palabra predicada aquí 
              lleva el poder de transformar destinos y liberar el propósito divino en tu vida.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Main Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Buscar prédicas, temas o predicadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                aria-label="Buscar sermones"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                aria-label="Vista en cuadrícula"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                aria-label="Vista en lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'sermon_date' | 'title' | 'view_count' | 'likes_count')}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="sermon_date">Fecha</option>
                <option value="title">Título</option>
                <option value="view_count">Visualizaciones</option>
                <option value="likes_count">Me gusta</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-white text-black text-xs px-2 py-1 rounded-full">
                  {[searchTerm, selectedCategory, selectedSeries, selectedSpeaker, selectedTag, 
                    hasTranscript !== undefined ? 'transcript' : '', 
                    hasVideo !== undefined ? 'video' : '', 
                    hasAudio !== undefined ? 'audio' : '',
                    dateRange.start || dateRange.end ? 'date' : ''].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Series Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serie</label>
                  <select
                    value={selectedSeries}
                    onChange={(e) => setSelectedSeries(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">Todas las series</option>
                    {series.map(serie => (
                      <option key={serie.id} value={serie.id}>
                        {serie.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speaker Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Predicador</label>
                  <select
                    value={selectedSpeaker}
                    onChange={(e) => setSelectedSpeaker(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">Todos los predicadores</option>
                    {speakers.map(speaker => (
                      <option key={speaker} value={speaker}>
                        {speaker}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta</label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">Todas las etiquetas</option>
                    {tags.map(tag => (
                      <option key={tag} value={tag}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                  <input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              {/* Content Type Filters */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de contenido</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasVideo === true}
                      onChange={(e) => setHasVideo(e.target.checked ? true : undefined)}
                      className="mr-2 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <Video className="w-4 h-4 mr-1" />
                    Con video
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasAudio === true}
                      onChange={(e) => setHasAudio(e.target.checked ? true : undefined)}
                      className="mr-2 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <Headphones className="w-4 h-4 mr-1" />
                    Con audio
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasTranscript === true}
                      onChange={(e) => setHasTranscript(e.target.checked ? true : undefined)}
                      className="mr-2 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <FileText className="w-4 h-4 mr-1" />
                    Con transcripción
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-black border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Count and Status */}
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              {error ? (
                'Error al cargar prédicas'
              ) : (
                `Mostrando ${sermons.length} prédicas`
              )}
            </div>
            
            {/* Active Filters Summary */}
            {hasActiveFilters && !showFilters && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 bg-black text-white text-sm rounded-full">
                    Búsqueda: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 bg-black text-white text-sm rounded-full">
                    Categoría: {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedSeries && (
                  <span className="inline-flex items-center px-3 py-1 bg-black text-white text-sm rounded-full">
                    Serie: {series.find(s => s.id === selectedSeries)?.title}
                    <button
                      onClick={() => setSelectedSeries('')}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sermons Grid/List */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando prédicas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error al cargar las prédicas</p>
              <p className="text-gray-500 mt-2">{error}</p>
            </div>
          ) : sermons.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-4">No se encontraron prédicas</h3>
              <p className="text-gray-600 mb-6">
                Intenta con diferentes términos de búsqueda o filtros.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Ver todas las prédicas
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8" 
              : "space-y-6"
            }>
              {(sermons || []).map((sermon) => (
                <article 
                  key={sermon.id} 
                  className={`card group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={`relative overflow-hidden rounded-lg ${
                    viewMode === 'list' 
                      ? 'w-48 h-32 flex-shrink-0 mr-6' 
                      : 'aspect-video mb-4'
                  }`}>
                    <img
                      src={sermon.thumbnail_url || '/default-sermon-thumbnail.jpg'}
                      alt={`Portada del sermón: ${sermon.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        to={`/predicas/${sermon.slug}`}
                        className="bg-white rounded-full p-4 hover:bg-gray-100 transition-colors focus-ring"
                        aria-label={`Reproducir sermón: ${sermon.title}`}
                      >
                        <Play className="w-8 h-8 text-black ml-1" />
                      </Link>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {sermon.duration}
                    </div>
                    {/* Series Badge */}
                    {sermon.sermon_series && (
                      <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        <BookOpen className="w-3 h-3 inline mr-1" />
                        {sermon.sermon_series.name}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`space-y-3 ${
                    viewMode === 'list' ? 'flex-1' : ''
                  }`}>
                    <div className={viewMode === 'list' ? 'flex justify-between h-full' : ''}>
                      <div className={viewMode === 'list' ? 'flex-1 pr-4' : ''}>
                        <div>
                          <h2 className="text-xl font-semibold mb-2 group-hover:text-gray-700 transition-colors">
                            <Link 
                              to={`/predicas/${sermon.slug}`}
                              className="focus-ring"
                            >
                              {sermon.title}
                            </Link>
                          </h2>
                          <div className="flex items-center text-gray-600 text-sm space-x-4 mb-3">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {sermon.speaker}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(sermon.sermon_date)}
                            </span>
                            <span>•</span>
                            <span>{sermon.view_count?.toLocaleString() || 0} visualizaciones</span>
                          </div>
                          {sermon.sermon_categories && (
                            <p className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                              <Tag className="w-4 h-4" />
                              {sermon.sermon_categories.name}
                            </p>
                          )}
                        </div>

                        {sermon.scripture_references && (
                          <p className="text-sm text-blue-600 mb-2 font-medium">
                            📖 {sermon.scripture_references}
                          </p>
                        )}

                        <p className="text-gray-700 leading-relaxed mb-3">
                          {sermon.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {sermon.tags?.slice(0, viewMode === 'list' ? 2 : 3).map((tag: string) => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(tag)}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors focus-ring"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </button>
                          ))}
                          {sermon.tags && sermon.tags.length > (viewMode === 'list' ? 2 : 3) && (
                            <span className="text-xs text-gray-500">
                              +{sermon.tags.length - (viewMode === 'list' ? 2 : 3)} más
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`flex ${
                        viewMode === 'list' 
                          ? 'flex-col items-end justify-between' 
                          : 'items-center justify-between pt-4 border-t'
                      }`}>
                        <div className={`flex items-center space-x-4 ${
                          viewMode === 'list' ? 'mb-3' : ''
                        }`}>
                          <Link
                            to={`/predicas/${sermon.slug}`}
                            className="inline-flex items-center text-black font-medium hover:underline focus-ring"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Ver completo
                          </Link>
                          
                          {/* Content Type Indicators */}
                          <div className="flex items-center gap-2">
                            {sermon.video_url && (
                              <Video className="w-4 h-4 text-red-500" />
                            )}
                            {sermon.audio_url && (
                              <Headphones className="w-4 h-4 text-green-500" />
                            )}
                            {sermon.transcript && (
                              <FileText className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleLike(Number(sermon.id))}
                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors focus-ring flex items-center"
                            aria-label="Me gusta"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            <span className="text-sm">{sermon.like_count || 0}</span>
                          </button>
                          <Link
                            to={`/predicas/${sermon.slug}`}
                            className="p-2 text-gray-600 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors focus-ring flex items-center"
                            aria-label="Ver comentarios"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{sermon.comment_count || 0}</span>
                          </Link>
                          <button
                            onClick={() => shareSermon({ 
                              title: sermon.title,
                              speaker: sermon.speaker || '',
                              slug: sermon.slug
                            })}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                            aria-label="Compartir sermón"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {sermon.audio_url && (
                            <a
                              href={sermon.audio_url}
                              download
                              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                              aria-label="Descargar audio"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Speakers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Predicadores Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speakers.slice(0, 6).map((speaker) => {
              const speakerSermons = (sermons || []).filter(s => s.speaker === speaker);
              const totalViews = speakerSermons.reduce((sum, s) => sum + (s.view_count || 0), 0);
              const totalLikes = speakerSermons.reduce((sum, s) => sum + (s.like_count || 0), 0);
              
              return (
                <div key={speaker} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{speaker}</h3>
                  <p className="text-gray-600 mb-4">
                    {speakerSermons.length} prédica{speakerSermons.length !== 1 ? 's' : ''}
                  </p>
                  <div className="text-gray-700 text-sm space-y-1 mb-4">
                    <p>{totalViews.toLocaleString()} visualizaciones totales</p>
                    <p>{totalLikes.toLocaleString()} me gusta totales</p>
                  </div>
                  <button
                    onClick={() => setSelectedSpeaker(speaker)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    Ver prédicas
                  </button>
                </div>
              );
            })}
          </div>
          
          {speakers.length === 0 && (
            <div className="text-center text-gray-500">
              <p>No hay predicadores disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}