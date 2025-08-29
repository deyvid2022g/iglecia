import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Share2, Clock, Tag, Search, Heart, MessageCircle } from 'lucide-react';

export function SermonsPage() {
  // Renamed from SermonsPage but keeping the same function name for compatibility
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  // Define interfaces for sermon data
  interface Sermon {
    id: number;
    slug: string;
    title: string;
    speaker: string;
    date: string;
    duration: string;
    thumbnail: string;
    description: string;
    tags: string[];
    videoUrl: string;
    audioUrl: string;
    hasTranscript: boolean;
    viewCount: number;
  }

  // Define types for likes and comments
  type LikesMap = Record<number, number>;
  type CommentsMap = Record<number, number>;

  const [sermonLikes, setSermonLikes] = useState<LikesMap>({});
  const [sermonComments, setSermonComments] = useState<CommentsMap>({});

  const sermons = [
    {
      id: 1,
      slug: 'fe-que-transforma',
      title: 'Diseñados para la Gloria de Dios',
      speaker: 'Pastor Juan Pérez',
      date: '2025-01-06',
      duration: '38:20',
      thumbnail: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      description: 'Descubre tu identidad divina y camina en la excelencia para la cual fuiste creado. Un mensaje profético sobre el diseño original de Dios para tu vida.',
      tags: ['identidad', 'propósito', 'gloria'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      audioUrl: '/audio/sermon-001.mp3',
      hasTranscript: true,
      viewCount: 1204
    },
    {
      id: 2,
      slug: 'amor-y-servicio',
      title: 'El Corazón del Padre Revelado',
      speaker: 'Pastora María Gómez',
      date: '2025-01-13',
      duration: '35:15',
      thumbnail: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      description: 'Una revelación poderosa del amor incondicional del Padre celestial y cómo este amor transforma nuestra manera de servir y amar a otros.',
      tags: ['amor paternal', 'servicio', 'revelación'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      audioUrl: '/audio/sermon-002.mp3',
      hasTranscript: true,
      viewCount: 892
    },
    {
      id: 3,
      slug: 'esperanza-en-tiempos-dificiles',
      title: 'Inquebrantables en Su Fidelidad',
      speaker: 'Pastor Juan Pérez',
      date: '2025-01-20',
      duration: '42:10',
      thumbnail: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      description: 'Cuando las circunstancias desafían tu fe, descubre cómo mantenerte firme en las promesas eternas de Dios. Un mensaje de victoria y esperanza profética.',
      tags: ['fidelidad', 'victoria', 'promesas'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      audioUrl: '/audio/sermon-003.mp3',
      hasTranscript: true,
      viewCount: 1567
    },
    {
      id: 4,
      slug: 'el-perdon-que-libera',
      title: 'Libertad Sobrenatural del Perdón',
      speaker: 'Pastor Carlos Ruiz',
      date: '2025-01-27',
      duration: '29:45',
      thumbnail: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
      description: 'El perdón no es solo una decisión, es un acto sobrenatural que libera el poder de Dios en tu vida. Descubre cómo caminar en libertad total.',
      tags: ['perdón', 'libertad', 'sanidad interior'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      audioUrl: '/audio/sermon-004.mp3',
      hasTranscript: false,
      viewCount: 723
    }
  ];

  // const allTags = [...new Set(sermons.flatMap(sermon => sermon.tags))];
  // const allSpeakers = [...new Set(sermons.map(sermon => sermon.speaker))];

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || sermon.tags.includes(selectedTag);
    const matchesSpeaker = !selectedSpeaker || sermon.speaker === selectedSpeaker;
    
    return matchesSearch && matchesTag && matchesSpeaker;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSelectedSpeaker('');
  };
  
  // Initialize likes and comments
  useEffect(() => {
    // Initialize with random likes for each sermon
    const initialLikes: LikesMap = {};
    const initialComments: CommentsMap = {};
    
    sermons.forEach(sermon => {
      initialLikes[sermon.id] = Math.floor(Math.random() * 50) + 10; // Random likes between 10-59
      initialComments[sermon.id] = Math.floor(Math.random() * 10) + 1; // Random comments between 1-10
    });
    
    setSermonLikes(initialLikes);
    setSermonComments(initialComments);
  }, []);
  
  // Function to handle liking a sermon
  const handleLike = (sermonId: number) => {
    setSermonLikes(prev => {
      const currentLikes = prev[sermonId] || 0;
      return {
        ...prev,
        [sermonId]: currentLikes + 1
      };
    });
  };
  
  // Function to share a sermon
  const shareSermon = (sermon: Sermon) => {
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
          <div className="flex flex-col lg:flex-row gap-4">
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

            {/* Tag Filter */}

            {/* Speaker Filter */}

            {/* Clear Filters */}
            {(searchTerm || selectedTag || selectedSpeaker) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-gray-600 hover:text-black border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-gray-600">
            {filteredSermons.length === sermons.length ? (
              `Mostrando ${sermons.length} prédicas`
            ) : (
              `${filteredSermons.length} de ${sermons.length} prédicas`
            )}
          </div>
        </div>
      </section>

      {/* Sermons Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          {filteredSermons.length === 0 ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredSermons.map((sermon) => (
                <article key={sermon.id} className="card group">
                  <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={sermon.thumbnail}
                      alt={`Portada del sermón: ${sermon.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        to={`/sermones/${sermon.slug}`}
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
                  </div>

                  <div className="space-y-3">
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
                        <span>{sermon.speaker}</span>
                        <span>•</span>
                        <span>{formatDate(sermon.date)}</span>
                        <span>•</span>
                        <span>{sermon.viewCount.toLocaleString()} visualizaciones</span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {sermon.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {sermon.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors focus-ring"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/predicas/${sermon.slug}`}
                          className="inline-flex items-center text-black font-medium hover:underline focus-ring"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Ver completo
                        </Link>
                        {sermon.hasTranscript && (
                          <span className="inline-flex items-center text-gray-600 text-sm">
                            📄 Transcripción disponible
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(sermon.id)}
                          className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors focus-ring flex items-center"
                          aria-label="Me gusta"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="text-sm">{sermonLikes[sermon.id] || 0}</span>
                        </button>
                        <Link
                          to={`/predicas/${sermon.slug}`}
                          className="p-2 text-gray-600 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors focus-ring flex items-center"
                          aria-label="Ver comentarios"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">{sermonComments[sermon.id] || 0}</span>
                        </Link>
                        <button
                          onClick={() => shareSermon(sermon)}
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                          aria-label="Compartir sermón"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        {sermon.audioUrl && (
                          <button
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                            aria-label="Descargar audio"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Predicadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <h3 className="text-xl font-semibold mb-2">Pastor Juan Pérez</h3>
            <p className="text-gray-600 mb-4">Pastor Principal</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Con más de 15 años de ministerio, el Pastor Juan comparte mensajes 
              profundos con aplicación práctica para la vida diaria.
            </p>
            
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
                  alt="Pastora María Gómez"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pastora María Gómez</h3>
              <p className="text-gray-600 mb-4">Pastora Asociada</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Especializada en ministerio familiar y de mujeres, la Pastora María 
                trae perspectivas únicas sobre la fe en el hogar.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100">
                <img
                  src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
                  alt="Pastor Carlos Ruiz"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pastor Carlos Ruiz</h3>
              <p className="text-gray-600 mb-4">Pastor de Jóvenes</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Líder dinámico del ministerio juvenil, el Pastor Carlos conecta 
                con las nuevas generaciones a través de mensajes relevantes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}