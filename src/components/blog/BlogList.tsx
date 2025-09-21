import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List as ListIcon, Calendar, Eye, Heart, MessageCircle } from 'lucide-react';
import { BlogCard } from './BlogCard';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { useBlogCategories } from '../../hooks/useBlogCategories';

interface BlogListProps {
  categorySlug?: string;
  searchQuery?: string;
  limit?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  className?: string;
}

export const BlogList: React.FC<BlogListProps> = ({
  categorySlug,
  searchQuery: initialSearchQuery = '',
  limit,
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || '');
  const [sortBy, setSortBy] = useState<'created_at' | 'view_count' | 'like_count'>('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const { 
    posts, 
    loading, 
    error, 
    hasMore, 
    searchPosts, 
    loadMore, 
    refetch 
  } = useBlogPosts();

  const { categories } = useBlogCategories();

  useEffect(() => {
    if (searchQuery.trim()) {
      searchPosts(searchQuery, limit);
    } else {
      refetch();
    }
  }, [searchQuery, selectedCategory, limit, searchPosts, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPosts(searchQuery, limit);
    } else {
      refetch();
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const sortedPosts = React.useMemo(() => {
    return [...posts].sort((a, b) => {
      switch (sortBy) {
        case 'view_count':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'like_count':
          return (b.like_count || 0) - (a.like_count || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [posts, sortBy]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error al cargar los posts: {error}</p>
        <button
          onClick={() => refetch()}
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
                  placeholder="Buscar posts..."
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

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Más recientes</option>
                <option value="views">Más vistos</option>
                <option value="likes_count">Más gustados</option>
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

      {/* Posts Grid/List */}
      {loading && posts.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando posts...</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No se encontraron posts.</p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {sortedPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
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
                {loading ? 'Cargando...' : 'Cargar más posts'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogList;