import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Search, Filter, Clock } from 'lucide-react';

export function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const categories = ['Fe', 'Familia', 'Comunidad', 'Estudios Bíblicos', 'Testimonios'];
  
  const posts: any[] = [];

  const allTags = [...new Set(posts.flatMap(post => post.tags))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
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
    setSelectedCategory('');
    setSelectedTag('');
  };

  // Featured post (most recent)
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog de la Comunidad
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Reflexiones, enseñanzas y testimonios que nutren el alma. 
              Encuentra inspiración para tu caminar diario de fe.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row lg:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Buscar artículos, temas o autores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                aria-label="Buscar artículos"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-black focus:border-black"
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-black focus:border-black"
                aria-label="Filtrar por etiqueta"
              >
                <option value="">Todas las etiquetas</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || selectedTag) && (
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
            {filteredPosts.length === posts.length ? (
              `${posts.length} artículos publicados`
            ) : (
              `${filteredPosts.length} de ${posts.length} artículos`
            )}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {!searchTerm && !selectedCategory && !selectedTag && featuredPost && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold mb-8">Artículo destacado</h2>
            <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-auto">
                  <img
                    src={featuredPost.featuredImage}
                    alt={`Imagen del artículo: ${featuredPost.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
                      {featuredPost.category}
                    </span>
                    <span className="text-sm text-gray-600">Destacado</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-gray-700 transition-colors">
                    <Link 
                      to={`/blog/${featuredPost.slug}`}
                      className="focus-ring"
                    >
                      {featuredPost.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <img
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>{featuredPost.author.name}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(featuredPost.publishedAt)}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{featuredPost.readTime} min</span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/blog/${featuredPost.slug}`}
                      className="btn-primary"
                    >
                      Leer completo
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-4">No se encontraron artículos</h3>
              <p className="text-gray-600 mb-6">
                Intenta con diferentes términos de búsqueda o filtros.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Ver todos los artículos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
              {(searchTerm || selectedCategory || selectedTag ? filteredPosts : regularPosts).map((post) => (
                <article key={post.id} className="card group">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={post.featuredImage}
                      alt={`Imagen del artículo: ${post.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {post.category}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime} min
                      </div>
                    </div>

                    <h2 className="text-lg font-semibold mb-2 group-hover:text-gray-700 transition-colors">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="focus-ring"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag: string) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-colors focus-ring"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center text-xs text-gray-600">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <span className="mr-2">{post.author.name}</span>
                        <span>•</span>
                        <span className="ml-2">{formatDate(post.publishedAt)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {post.views} vistas
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              No te pierdas nuestros artículos
            </h2>
            <p className="text-gray-600 mb-8">
              Suscríbete a nuestro boletín y recibe las últimas reflexiones y enseñanzas 
              directamente en tu correo.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                required
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Suscribirse
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              Respetamos tu privacidad. Puedes cancelar la suscripción en cualquier momento.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}