import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  Share2, 
  ChevronLeft, 
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

export function BlogPostPage() {
  const { slug } = useParams();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  // Define interface for comment type
  interface Comment {
    id: number;
    author: string;
    content: string;
    date: string;
  }

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // Simulated blog post data - in real app this would come from an API
  const post = {
    id: 1,
    title: 'Reflexión semanal: La esperanza que no defrauda',
    content: `
      <p>En un mundo lleno de incertidumbre, donde las noticias parecen traer más preocupación que paz, encontramos en la Palabra de Dios una verdad inmutable: "Y la esperanza no defrauda, porque el amor de Dios ha sido derramado en nuestros corazones por el Espíritu Santo que nos fue dado" (Romanos 5:5).</p>

      <h2>¿Qué es la esperanza cristiana?</h2>
      
      <p>La esperanza cristiana no es un optimismo ciego o una ilusión pasajera. Es una confianza sólida y fundamentada en las promesas inmutables de Dios. Mientras que la esperanza del mundo está basada en circunstancias cambiantes, nuestra esperanza está anclada en el carácter eterno de nuestro Padre celestial.</p>

      <blockquote>
        <p>"Tenemos como firme y segura ancla del alma una esperanza que penetra hasta detrás del velo" - Hebreos 6:19</p>
      </blockquote>

      <h2>Características de la esperanza que no defrauda</h2>

      <h3>1. Es una esperanza activa</h3>
      <p>La verdadera esperanza cristiana no nos lleva a la pasividad, sino a la acción. Nos impulsa a seguir adelante, a perseverar en medio de las dificultades y a trabajar por un futuro mejor, sabiendo que Dios está obrando en todas las cosas para bien.</p>

      <h3>2. Está centrada en Cristo</h3>
      <p>Nuestra esperanza no está puesta en sistemas políticos, en la economía mundial o en nuestras propias fuerzas. Está puesta en Cristo Jesús, quien venció la muerte y nos prometió vida eterna. "Cristo en vosotros, la esperanza de gloria" (Colosenses 1:27).</p>

      <h3>3. Transforma el presente</h3>
      <p>La esperanza eterna no es solo sobre el futuro; transforma cómo vivimos hoy. Nos da perspectiva en los problemas, fortaleza en la debilidad y propósito en medio de la adversidad.</p>

      <h2>Cultivando la esperanza en nuestro diario vivir</h2>

      <p>¿Cómo podemos mantener viva esta esperanza en nuestros corazones? Te sugiero tres prácticas esenciales:</p>

      <ul>
        <li><strong>Medita en las promesas de Dios:</strong> Dedica tiempo diario a leer y reflexionar en las Escrituras. Cada promesa de Dios es un recordatorio de su fidelidad.</li>
        <li><strong>Ora sin cesar:</strong> La oración nos conecta con la fuente de toda esperanza. En la presencia de Dios encontramos renovación y fortaleza.</li>
        <li><strong>Comparte tu esperanza:</strong> Cuando compartimos nuestra esperanza con otros, no solo los bendecimos a ellos, sino que también fortalecemos nuestra propia fe.</li>
      </ul>

      <h2>Un mensaje personal</h2>

      <p>Querido hermano o hermana en la fe, si hoy te encuentras atravesando una temporada difícil, quiero recordarte que tu esperanza no está puesta en algo incierto, sino en Alguien que es completamente fiel. Dios no ha cambiado, sus promesas siguen siendo verdad, y su amor por ti es inquebrantable.</p>

      <p>La esperanza cristiana no nos garantiza que la vida será fácil, pero sí nos asegura que nunca caminaremos solos. En cada valle, Dios está con nosotros. En cada montaña, Él nos sostiene. Y al final del camino, nos espera una gloria eterna que hará que todas nuestras luchas presentes palidezcan en comparación.</p>

      <h2>Para reflexionar</h2>

      <p>Te invito a reflexionar en estas preguntas durante la semana:</p>
      
      <ol>
        <li>¿En qué o en quién está puesta mi esperanza?</li>
        <li>¿Cómo puedo ser un portador de esperanza para otros en mi comunidad?</li>
        <li>¿Qué promesas específicas de Dios necesito recordar en este momento de mi vida?</li>
      </ol>

      <p>Recuerda: la esperanza cristiana no defrauda porque está fundamentada en el amor incondicional de Dios y en las promesas cumplidas en Cristo Jesús. Esta esperanza es tu derecho como hijo de Dios, tu ancla en la tormenta y tu luz en la oscuridad.</p>

      <p><em>Que la paz de Dios, que sobrepasa todo entendimiento, guarde vuestros corazones y vuestros pensamientos en Cristo Jesús.</em></p>
    `,
    excerpt: 'En tiempos de incertidumbre, la esperanza cristiana se convierte en nuestro ancla. Descubre cómo cultivar una esperanza que trasciende las circunstancias.',
    author: {
      name: 'Pastor Juan Pérez',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      bio: 'Pastor principal de Iglesia Vida Nueva con más de 15 años de ministerio. Especializado en enseñanza bíblica y cuidado pastoral.'
    },
    category: 'Fe',
    tags: ['esperanza', 'vida cristiana', 'reflexión', 'promesas de Dios'],
    publishedAt: '2025-01-25',
    readTime: 5,
    featuredImage: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    views: 234,
    likes: 18,
    comments: 7
  };

  const relatedPosts = [
    {
      id: 2,
      slug: 'voluntariado-como-ayudar',
      title: 'Cómo ser voluntario en la iglesia',
      featuredImage: 'https://images.pexels.com/photos/6994925/pexels-photo-6994925.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      publishedAt: '2025-01-22',
      readTime: 7
    },
    {
      id: 4,
      slug: 'oracion-efectiva',
      title: 'Los elementos de una oración efectiva',
      featuredImage: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      publishedAt: '2025-01-18',
      readTime: 6
    },
    {
      id: 3,
      slug: 'fortaleciendo-matrimonio',
      title: 'Fortaleciendo el matrimonio con principios bíblicos',
      featuredImage: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      publishedAt: '2025-01-20',
      readTime: 8
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: 'Te recomiendo leer este artículo: ' + post.title,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles. ¡Compártelo con tus amigos!');
    }
  };
  
  // Initialize likes count from post data
  useEffect(() => {
    setLikesCount(post.likes);
    
    // Initialize comments with dummy data
    setComments([
      { id: 1, author: 'María García', content: 'Excelente reflexión, justo lo que necesitaba leer hoy.', date: '2023-05-15T14:30:00' },
      { id: 2, author: 'Juan Pérez', content: 'Me encantó la parte sobre la esperanza activa. Muy inspirador.', date: '2023-05-15T16:45:00' },
      { id: 3, author: 'Ana Rodríguez', content: 'Gracias por compartir estas palabras de aliento.', date: '2023-05-16T09:20:00' },
    ]);
  }, []);
  
  // Function to add a new comment
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    const newCommentObj = {
      id: comments.length + 1,
      author: 'Usuario',
      content: newComment,
      date: new Date().toISOString()
    };
    
    setComments([...comments, newCommentObj]);
     setNewComment('');
  };

  if (!post) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artículo no encontrado</h1>
          <Link to="/blog" className="btn-primary">
            Ver todos los artículos
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
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-black transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </li>
              <li className="text-black font-medium truncate">{post.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <article>
            {/* Header */}
            <header className="mb-8">
              <div className="mb-4">
                <Link
                  to="/blog"
                  className="inline-flex items-center text-gray-600 hover:text-black transition-colors focus-ring"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Volver al blog
                </Link>
              </div>

              <div className="mb-4">
                <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium text-black">{post.author.name}</div>
                    <div className="text-sm">Pastor Principal</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{post.readTime} min de lectura</span>
                </div>
                
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  <span>{post.views} vistas</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => {
                      setLiked(!liked);
                      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
                    }}
                    className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors focus-ring`}
                  >
                    <Heart className="w-5 h-5 mr-1" fill={liked ? 'currentColor' : 'none'} />
                    <span>{likesCount}</span>
                  </button>
                  <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center text-gray-600 hover:text-blue-500 transition-colors focus-ring"
                  >
                    <MessageCircle className="w-5 h-5 mr-1" />
                    <span>{comments.length}</span>
                  </button>
                  <button
                    onClick={sharePost}
                    className="flex items-center text-gray-600 hover:text-black transition-colors focus-ring"
                  >
                    <Share2 className="w-5 h-5 mr-1" />
                    Compartir
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            <div className="aspect-video rounded-lg overflow-hidden mb-8">
              <img
                src={post.featuredImage}
                alt={`Imagen del artículo: ${post.title}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg prose-gray max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Bio */}
            <div className="bg-gray-50 rounded-lg p-6 mb-12">
              <h3 className="text-xl font-semibold mb-4">Sobre el autor</h3>
              <div className="flex items-start">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold mb-2">{post.author.name}</h4>
                  <p className="text-gray-700 leading-relaxed">{post.author.bio}</p>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="text-center py-8 border-t border-b">
              <h3 className="text-lg font-semibold mb-4">¿Te ha gustado este artículo?</h3>
              <div className="flex justify-center space-x-4">
                <button className="btn-secondary flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Me gusta ({post.likes})
                </button>
                <button
                  onClick={sharePost}
                  className="btn-secondary flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </button>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-8">Artículos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="card group">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-gray-700 transition-colors">
                    <Link 
                      to={`/blog/${relatedPost.slug}`}
                      className="focus-ring"
                    >
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>{formatDate(relatedPost.publishedAt)}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{relatedPost.readTime} min</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="mt-12 pt-8 border-t">
            <h3 className="text-xl font-semibold mb-6">Comentarios ({comments.length})</h3>
            
            {showComments ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{comment.author}</div>
                      <div className="text-sm text-gray-500">{new Date(comment.date).toLocaleDateString()}</div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
                
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
              </div>
            ) : (
              <div 
                className="bg-gray-50 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-100 transition-colors" 
                onClick={() => setShowComments(true)}
              >
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Haz clic para ver y añadir comentarios
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}