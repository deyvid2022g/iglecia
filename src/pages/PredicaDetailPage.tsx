import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Share2, 
  Heart, 
  MessageCircle, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  FileText, 
  Download,
  ArrowLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useSermon } from '../hooks/useSermons';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/videoUtils';

export function SermonDetailPage() {
  // Renamed from SermonDetailPage but keeping the same function name for compatibility
  const { slug } = useParams<{ slug: string }>();
  const { sermon, loading, error } = useSermon(slug || '');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(45); // Initial likes count
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: number; author: string; text: string; date: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  useEffect(() => {
    if (sermon?.video_url) {
      const isYT = isYouTubeUrl(sermon.video_url);
      setIsYouTubeVideo(isYT);
      
      if (isYT) {
        const embedUrl = getYouTubeEmbedUrl(sermon.video_url);
        setEmbedUrl(embedUrl);
      } else {
        setEmbedUrl(null);
      }
    }
  }, [sermon?.video_url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTubeVideo) return;

    const updateTime = () => {
      if (video && !video.paused) {
        setCurrentTime(video.currentTime);
      }
    };
    const updateDuration = () => {
      if (video && video.duration) {
        setDuration(video.duration);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      }
    };
  }, [isYouTubeVideo, sermon?.video_url]);

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (error) {
      // Silently handle AbortError and other play interruptions
      if (error.name !== 'AbortError') {
        console.warn('Error during video playback:', error);
      }
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  
  // Function to share the sermon
  const shareSermon = async () => {
    if (!sermon) return;
    try {
      const text = `¡Escucha esta increíble prédica: "${sermon.title}" por ${sermon.speaker_name || 'Predicador'}!`;
      if (navigator.share) {
        await navigator.share({
          title: sermon.title,
          text: text,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        alert('Enlace copiado al portapapeles');
      }
    } catch (_) {
      console.error('Error al compartir:', _);
    }
  };
  
  // Initialize comments with dummy data
  useEffect(() => {
    setComments([
      { id: 1, author: 'Carlos Mendoza', text: 'Esta prédica cambió mi perspectiva sobre la fe. Gracias Pastor Reynel.', date: '2023-05-15T14:30:00' },
      { id: 2, author: 'Laura Sánchez', text: 'Justo lo que necesitaba escuchar hoy. Dios habló a mi corazón.', date: '2023-05-16T09:20:00' },
      { id: 3, author: 'Roberto Gómez', text: '¡Excelente mensaje! Lo compartiré con mi grupo familiar.', date: '2023-05-16T16:45:00' },
    ]);
  }, []);
  
  // Function to add a new comment
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    const newCommentObj = {
      id: comments.length + 1,
      author: 'Usuario',
      text: newComment,
      date: new Date().toISOString()
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando prédica...</p>
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Prédica no encontrada</h1>
          <p className="text-gray-600 mb-4">{error || 'La prédica que buscas no existe.'}</p>
          <Link to="/predicas" className="btn-primary">
            Ver todas las prédicas
          </Link>
        </div>
      </div>
    );
  }

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
              <div className="bg-black rounded-lg overflow-hidden mb-6">
                <div className="relative aspect-video">
                  {isYouTubeVideo && embedUrl ? (
                    // YouTube iframe player
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full"
                      src={embedUrl}
                      title={sermon.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    // HTML5 video player for non-YouTube videos
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        poster={sermon.thumbnail_url}
                        preload="metadata"
                      >
                        <source src={sermon.video_url} type="video/mp4" />
                        <track kind="captions" src="/captions/fe-que-transforma.vtt" srcLang="es" label="Español" />
                        Tu navegador no soporta video HTML5.
                      </video>

                      {/* Custom Controls - Only for non-YouTube videos */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={togglePlayPause}
                            className="text-white hover:text-gray-300 transition-colors focus-ring-white"
                            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                          >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                          </button>

                          <div className="flex items-center space-x-2 text-white text-sm">
                            <span>{formatTime(currentTime)}</span>
                            <span>/</span>
                            <span>{formatTime(duration)}</span>
                          </div>

                          <div className="flex-1">
                            <input
                              type="range"
                              min={0}
                              max={duration}
                              value={currentTime}
                              onChange={(e) => seekTo(parseFloat(e.target.value))}
                              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Volume2 className="w-5 h-5 text-white" />
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.1}
                              value={volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-16 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                              aria-label="Control de volumen"
                            />
                          </div>

                          <button
                            className="text-white hover:text-gray-300 transition-colors focus-ring-white"
                            aria-label="Pantalla completa"
                            onClick={() => videoRef.current?.requestFullscreen()}
                          >
                            <Maximize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sermon Info */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{sermon.title}</h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <span className="font-medium">{sermon.speaker_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{formatDate(sermon.preached_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{sermon.duration}</span>
                  </div>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {sermon.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {sermon.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="btn-secondary"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {showTranscript ? 'Ocultar' : 'Mostrar'} transcripción
                  </button>
                  <button className="btn-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar audio
                  </button>
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
              
              {showTranscript && !sermon.transcript && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Transcripción</h3>
                  <p className="text-gray-600">La transcripción no está disponible para esta prédica.</p>
                </div>
              )}

              {/* Resources - Commented out as resources are not part of Sermon type */}
              {/* Future implementation: Resources will be fetched from sermon_resources table */}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              {/* Chapters - Commented out as chapters are not part of Sermon type */}
              {/* Future implementation: Chapters will be fetched from a separate table if needed */}

              {/* Related Sermons */}
              {sermon.sermon_categories && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Prédicas relacionadas</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Categoría: {sermon.sermon_categories.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Próximamente mostraremos más prédicas de esta categoría.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Social Interactions */}
          <div className="container mx-auto px-4 sm:px-6 mt-8">
            <div className="flex items-center space-x-6 border-t border-b py-4">
              <button 
                onClick={() => {
                  setLiked(!liked);
                  setLikesCount(liked ? likesCount - 1 : likesCount + 1);
                }}
                className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors focus-ring`}
              >
                <Heart className="w-5 h-5 mr-2" fill={liked ? 'currentColor' : 'none'} />
                <span>{likesCount} Me gusta</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center text-gray-600 hover:text-blue-500 transition-colors focus-ring"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                <span>{comments.length} Comentarios</span>
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
                <h3 className="text-xl font-semibold mb-6">Comentarios ({comments.length})</h3>
                
                <div className="space-y-6 mb-8">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{comment.author}</div>
                        <div className="text-sm text-gray-500">{new Date(comment.date).toLocaleDateString()}</div>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={addComment} className="mt-8">
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Añadir comentario</label>
                    <textarea
                      id="comment"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe tu comentario aquí..."
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Publicar comentario
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