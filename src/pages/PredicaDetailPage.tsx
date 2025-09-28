import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useSermon, 
  useSermonResources, 
  useSermonFilters 
} from '../hooks/useSermons';
import { useSermonInteractions } from '../hooks/useSermonInteractions';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/youtube';
import { 
  Download, 
  Share2, 
  FileText,
  Clock,
  Calendar,
  User,
  Heart,
  MessageCircle,
  ChevronRight,
  ExternalLink,
  Eye,
  Tag,
  BookOpen
} from 'lucide-react';

export function PredicaDetailPage() {
  const { slug } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Get sermon data from hooks
  const { sermon, loading: sermonLoading, error: sermonError } = useSermon(slug || '');
  const { resources, loading: resourcesLoading } = useSermonResources(sermon?.id || '');
  const { 
    interactions: _interactions, 
    loading: interactionsLoading, 
    toggleLike, 
    addComment,
    getLikeCount,
    getCommentCount,
    isLikedByUser,
    getComments
  } = useSermonInteractions({ 
    sermonId: sermon?.id || '',
    userId: undefined, // TODO: Add user context
    realtime: true
  });
  
  // Get related sermons from the same series or category
  const { sermons: relatedSermons } = useSermonFilters({
    category: sermon?.category_id || undefined,
    series: sermon?.series_id || undefined
  }, '', 'created_at', 'desc');



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const jumpToTranscriptTime = (text: string) => {
    const timeMatch = text.match(/\[(\d{2}):(\d{2})\]/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1]);
      const seconds = parseInt(timeMatch[2]);
      const totalSeconds = minutes * 60 + seconds;
      seekTo(totalSeconds);
    }
  };
  
  const shareSermon = async () => {
    try {
      if (navigator.share && sermon) {
        await navigator.share({
          title: sermon.title,
          text: `${sermon.title} - ${sermon.speaker}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const handleLike = async () => {
    if (sermon?.id) {
      await toggleLike();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '' || !sermon?.id) return;
    
    await addComment(newComment);
    setNewComment('');
  };

  const downloadResource = async (resource: any) => {
    if (resource.file_url) {
      // Increment download count and download file
      try {
        const response = await fetch(resource.file_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.title || 'recurso';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error al descargar:', error);
      }
    } else if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    }
  };

  // Handle loading state
  if (sermonLoading) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sermón...</p>
        </div>
      </div>
    );
  }

  // Handle error or not found state
  if (sermonError || !sermon) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Predica no encontrada</h1>
          <p className="text-gray-600 mb-6">
            {sermonError || 'El sermón que buscas no existe o ha sido eliminado.'}
          </p>
          <Link to="/predicas" className="btn-primary">
            Ver todas las prédicas
          </Link>
        </div>
      </div>
    );
  }

  // Filter related sermons to exclude current sermon
  const filteredRelatedSermons = relatedSermons.filter(s => s.id !== sermon.id).slice(0, 3);

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <nav aria-label="Navegación de migas de pan">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-black transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </li>
              <li>
                <Link to="/predicas" className="text-gray-600 hover:text-black transition-colors">
                  Prédicas
                </Link>
              </li>
              {sermon.sermon_series && (
                <>
                  <li>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </li>
                  <li>
                    <span className="text-gray-600">{sermon.sermon_series.name}</span>
                  </li>
                </>
              )}
              <li>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </li>
              <li className="text-black font-medium truncate">{sermon.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-3">
              {/* Video Player */}
              {sermon.video_url && (
                <div className="bg-black rounded-lg overflow-hidden mb-6">
                  <div className="relative aspect-video">
                    {isYouTubeUrl(sermon.video_url) ? (
                      // YouTube iframe embed
                      <iframe
                        src={getYouTubeEmbedUrl(sermon.video_url) || ''}
                        title={`Sermón: ${sermon.title}`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      // Fallback para videos que no son de YouTube
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        poster={sermon.thumbnail_url || undefined}
                        preload="metadata"
                        controls
                      >
                        <source src={sermon.video_url} type="video/mp4" />
                        Tu navegador no soporta video HTML5.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Player for audio-only sermons */}
              {!sermon.video_url && sermon.audio_url && (
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Audio del sermón</h3>
                      <audio controls className="w-full">
                        <source src={sermon.audio_url} type="audio/mpeg" />
                        Tu navegador no soporta audio HTML5.
                      </audio>
                    </div>
                  </div>
                </div>
              )}

              {/* Sermon Info */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold flex-1">{sermon.title}</h1>
                  <div className="flex items-center space-x-2 text-gray-500 ml-4">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{sermon.view_count || 0} vistas</span>
                  </div>
                </div>
                
                {/* Series Info */}
                {sermon.sermon_series && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Parte de la serie:</p>
                        <h3 className="text-lg font-semibold text-blue-800">{sermon.sermon_series.name}</h3>
                        {sermon.sermon_series.description && (
                          <p className="text-sm text-blue-700 mt-1">{sermon.sermon_series.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Speaker Info */}
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    {sermon.speaker_image_url ? (
                      <img 
                        src={sermon.speaker_image_url} 
                        alt={sermon.speaker}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{sermon.speaker}</h3>
                      {sermon.speaker_bio && (
                        <p className="text-gray-600 text-sm leading-relaxed">{sermon.speaker_bio}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{formatDate(sermon.sermon_date)}</span>
                  </div>
                  {sermon.duration && (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{sermon.duration}</span>
                    </div>
                  )}
                  {sermon.sermon_categories && (
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      <span>{sermon.sermon_categories.name}</span>
                    </div>
                  )}
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {sermon.description}
                </p>

                {/* Scripture References */}
                {sermon.scripture_references && sermon.scripture_references.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-amber-800 mb-2">Referencias bíblicas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {sermon.scripture_references.map((reference, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                        >
                          {reference}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {sermon.tags && sermon.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {sermon.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {sermon.has_transcript && (
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="btn-secondary"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {showTranscript ? 'Ocultar' : 'Mostrar'} transcripción
                    </button>
                  )}
                  {sermon.audio_url && (
                    <a
                      href={sermon.audio_url}
                      download
                      className="btn-secondary inline-flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar audio
                    </a>
                  )}
                  <button 
                    onClick={shareSermon}
                    className="btn-secondary"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </button>
                </div>
              </div>

              {/* Transcript */}
              {showTranscript && sermon.transcript && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Transcripción</h3>
                  <div className="prose prose-gray max-w-none">
                    <div className="space-y-4 text-sm leading-relaxed">
                      {sermon.transcript.split('\n\n').map((paragraph, index) => (
                        <p 
                          key={index}
                          className="cursor-pointer hover:bg-white hover:shadow-sm p-2 rounded transition-all"
                          onClick={() => jumpToTranscriptTime(paragraph)}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    💡 Haz clic en cualquier párrafo para ir a ese momento del video
                  </p>
                </div>
              )}

              {/* Resources */}
              {!resourcesLoading && resources && resources.length > 0 && (
                <div className="bg-white border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Recursos adicionales</h3>
                  <div className="space-y-3">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-sm text-gray-600">{resource.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span className="capitalize">{resource.resource_type}</span>
                              {resource.file_size && (
                                <span>{Math.round(resource.file_size / 1024)} KB</span>
                              )}
                              <span>{resource.download_count || 0} descargas</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadResource(resource)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {resource.external_url ? (
                            <ExternalLink className="w-4 h-4" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span>{resource.external_url ? 'Abrir' : 'Descargar'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              {/* Related Sermons */}
              {filteredRelatedSermons.length > 0 && (
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Prédicas relacionadas</h3>
                  <div className="space-y-4">
                    {filteredRelatedSermons.map((relatedSermon) => (
                      <Link
                        key={relatedSermon.id}
                        to={`/predicas/${relatedSermon.slug}`}
                        className="block group focus-ring rounded-lg"
                      >
                        <div className="aspect-video rounded-lg overflow-hidden mb-2">
                          <img
                            src={relatedSermon.thumbnail_url || '/placeholder-sermon.jpg'}
                            alt={relatedSermon.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-medium text-sm mb-1 group-hover:text-gray-700 transition-colors">
                          {relatedSermon.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{relatedSermon.speaker}</p>
                        <p className="text-xs text-gray-500">{formatDate(relatedSermon.sermon_date)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sermon Stats */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vistas</span>
                    <span className="font-medium">{sermon.view_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Me gusta</span>
                    <span className="font-medium">{getLikeCount()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Comentarios</span>
                    <span className="font-medium">{getCommentCount()}</span>
                  </div>
                  {sermon.created_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Publicado</span>
                      <span className="font-medium text-sm">{formatDate(sermon.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Social Interactions */}
          <div className="container mx-auto px-4 sm:px-6 mt-8">
            <div className="flex items-center space-x-6 border-t border-b py-4">
              <button 
                onClick={handleLike}
                className={`flex items-center ${isLikedByUser() ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors focus-ring`}
                disabled={interactionsLoading}
              >
                <Heart className="w-5 h-5 mr-2" fill={isLikedByUser() ? 'currentColor' : 'none'} />
                <span>{getLikeCount()} Me gusta</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center text-gray-600 hover:text-blue-500 transition-colors focus-ring"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                <span>{getCommentCount()} Comentarios</span>
              </button>
              <button
                onClick={shareSermon}
                className="flex items-center text-gray-600 hover:text-black transition-colors focus-ring"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartir
              </button>
            </div>
          </div>
          
          {/* Comments Section */}
          {showComments && (
            <div className="container mx-auto px-4 sm:px-6 mt-8">
              <section className="bg-white rounded-lg border p-6">
                <h3 className="text-xl font-semibold mb-6">
                  Comentarios ({getCommentCount()})
                </h3>
                
                {getComments() && getComments().length > 0 && (
                  <div className="space-y-6 mb-8">
                    {getComments().map((comment: any) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{comment.user_name || 'Usuario'}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <form onSubmit={handleAddComment} className="mt-8">
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Añadir comentario
                    </label>
                    <textarea
                      id="comment"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe tu comentario aquí..."
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={interactionsLoading}
                  >
                    {interactionsLoading ? 'Publicando...' : 'Publicar comentario'}
                  </button>
                </form>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}