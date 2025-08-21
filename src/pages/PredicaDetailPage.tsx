import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  Share2, 
  FileText,
  Clock,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Maximize
} from 'lucide-react';

export function SermonDetailPage() {
  // Renamed from SermonDetailPage but keeping the same function name for compatibility
  const { slug } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Simulated predica data - in real app this would come from an API
  const sermon = {
    id: 1,
    title: 'Fe que transforma',
    speaker: 'Pastor Juan Pérez',
    date: '2025-01-06',
    duration: '38:20',
    description: 'En este mensaje profundizamos sobre cómo la fe activa puede transformar nuestras vidas, comunidades y el mundo que nos rodea. Exploramos ejemplos bíblicos y aplicaciones prácticas para vivir una fe que produce frutos tangibles.',
    tags: ['fe', 'transformación', 'vida cristiana'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop',
    chapters: [
      { time: 0, title: 'Introducción y bienvenida' },
      { time: 300, title: 'Definiendo la fe transformadora' },
      { time: 720, title: 'Ejemplos bíblicos de transformación' },
      { time: 1200, title: 'Aplicación práctica en la vida diaria' },
      { time: 1680, title: 'Oración y llamado al altar' }
    ],
    transcript: `[00:00] Bienvenidos hermanos a este día especial donde hablaremos sobre la fe que transforma.

[02:15] La fe no es simplemente creer en algo, sino actuar basado en esa creencia. Cuando hablamos de fe transformadora, nos referimos a una fe que produce cambios visibles y tangibles.

[05:30] En las Escrituras encontramos múltiples ejemplos de personas cuya fe produjo transformaciones extraordinarias. Abraham creyó y salió de su tierra. Moisés creyó y liberó a un pueblo. David creyó y venció al gigante.

[12:00] ¿Pero cómo aplicamos esta fe transformadora en nuestro día a día? Primero, debemos entender que la fe requiere acción. Santiago nos dice que la fe sin obras está muerta.

[20:00] Permíteme compartir contigo tres principios fundamentales de la fe transformadora: La fe ve lo invisible, la fe actúa en obediencia, y la fe persevera en las pruebas.

[28:00] Quiero desafiarte hoy a que examines tu fe. ¿Está produciendo transformación en tu vida? ¿Está impactando a otros a tu alrededor?

[35:00] Oremos juntos para que Dios nos ayude a vivir una fe que realmente transforma...`,
    resources: [
      { title: 'Notas del sermón (PDF)', url: '/resources/fe-que-transforma-notes.pdf' },
      { title: 'Guía de estudio grupal', url: '/resources/fe-que-transforma-study.pdf' },
      { title: 'Versículos clave', url: '/resources/fe-que-transforma-verses.pdf' }
    ]
  };

  // Simulated related predicas
  const relatedSermons = [
    {
      id: 2,
      slug: 'amor-y-servicio',
      title: 'Amor y servicio',
      speaker: 'Pastora María Gómez',
      date: '2025-01-13',
      thumbnail: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop'
    },
    {
      id: 3,
      slug: 'esperanza-en-tiempos-dificiles',
      title: 'Esperanza en tiempos difíciles',
      speaker: 'Pastor Juan Pérez',
      date: '2025-01-20',
      thumbnail: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop'
    }
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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

  if (!sermon) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Predica no encontrada</h1>
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
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    poster={sermon.thumbnail}
                    preload="metadata"
                  >
                    <source src={sermon.videoUrl} type="video/mp4" />
                    <track kind="captions" src="/captions/fe-que-transforma.vtt" srcLang="es" label="Español" />
                    Tu navegador no soporta video HTML5.
                  </video>

                  {/* Custom Controls */}
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
                </div>
              </div>

              {/* Sermon Info */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{sermon.title}</h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <span className="font-medium">{sermon.speaker}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{formatDate(sermon.date)}</span>
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
                  {sermon.tags.map((tag) => (
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
                  <button className="btn-secondary">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </button>
                </div>
              </div>

              {/* Transcript */}
              {showTranscript && (
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
              {sermon.resources.length > 0 && (
                <div className="bg-white border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Recursos adicionales</h3>
                  <div className="space-y-3">
                    {sermon.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors focus-ring"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-5 h-5 text-gray-600 mr-3" />
                        <span className="font-medium">{resource.title}</span>
                        <Download className="w-4 h-4 text-gray-400 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              {/* Chapters */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Capítulos</h3>
                <div className="space-y-2">
                  {sermon.chapters.map((chapter, index) => (
                    <button
                      key={index}
                      onClick={() => seekTo(chapter.time)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors focus-ring text-sm"
                    >
                      <div className="font-medium mb-1">{chapter.title}</div>
                      <div className="text-gray-600">{formatTime(chapter.time)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Related Sermons */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Prédicas relacionadas</h3>
                <div className="space-y-4">
                  {relatedSermons.map((relatedSermon) => (
                    <Link
                      key={relatedSermon.id}
                      to={`/predicas/${relatedSermon.slug}`}
                      className="block group focus-ring rounded-lg"
                    >
                      <div className="aspect-video rounded-lg overflow-hidden mb-2">
                        <img
                          src={relatedSermon.thumbnail}
                          alt={relatedSermon.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-medium text-sm mb-1 group-hover:text-gray-700 transition-colors">
                        {relatedSermon.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1">{relatedSermon.speaker}</p>
                      <p className="text-xs text-gray-500">{formatDate(relatedSermon.date)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}