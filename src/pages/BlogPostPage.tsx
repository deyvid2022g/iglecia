
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Share2, 
  ChevronLeft, 
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';
import { getBlogPostBySlug, type BlogPostWithAuthor } from '../lib/firestore';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  interface Comment {
    id: number;
    author: string;
    content: string;
    date: string;
  }

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const fetchedPost = await getBlogPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          setLikesCount(fetchedPost.likes || 0);
        } else {
          setError('Artículo no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el artículo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);
  
  // Simulated related posts - this can be replaced with a real implementation later
  const relatedPosts = [];

  const formatDate = (date: any) => {
    if (!date) return '';
    const dateObject = date.toDate ? date.toDate() : new Date(date);
    return dateObject.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = async () => {
    if (post && navigator.share) {
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

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    const newCommentObj = {
      id: comments.length + 1,
      author: 'Usuario', // This should be replaced with the logged in user
      content: newComment,
      date: new Date().toISOString()
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  if (loading) {
    return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (error || !post) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Artículo no encontrado'}</h1>
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
                  {post.category_id}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                {post.author && (
                    <div className="flex items-center">
                    <img
                        src={post.author.avatar_url || ''}
                        alt={post.author.full_name || ''}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <div className="font-medium text-black">{post.author.full_name}</div>
                        <div className="text-sm">{post.author.website}</div>
                    </div>
                    </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{post.read_time} min de lectura</span>
                </div>
                
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  <span>{post.view_count} vistas</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.tags && post.tags.map((tag) => (
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
                src={post.featured_image_url || ''}
                alt={`Imagen del artículo: ${post.title}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg prose-gray max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {/* Author Bio */}
            {post.author && (
                <div className="bg-gray-50 rounded-lg p-6 mb-12">
                    <h3 className="text-xl font-semibold mb-4">Sobre el autor</h3>
                    <div className="flex items-start">
                        <img
                        src={post.author.avatar_url || ''}
                        alt={post.author.full_name || ''}
                        className="w-16 h-16 rounded-full mr-4"
                        />
                        <div>
                        <h4 className="text-lg font-semibold mb-2">{post.author.full_name}</h4>
                        <p className="text-gray-700 leading-relaxed">{post.author.website}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Section */}
            <div className="text-center py-8 border-t border-b">
              <h3 className="text-lg font-semibold mb-4">¿Te ha gustado este artículo?</h3>
              <div className="flex justify-center space-x-4">
                <button className="btn-secondary flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Me gusta ({likesCount})
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
              {relatedPosts.map((relatedPost: any) => (
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
