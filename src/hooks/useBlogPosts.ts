import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { blogService, type BlogPost, type BlogPostInsert, type BlogPostUpdate } from '../services/blogService';

interface UseBlogPostsOptions {
  published?: boolean;
  featured?: boolean;
  categoryId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'published_at' | 'view_count' | 'like_count';
  orderDirection?: 'asc' | 'desc';
  realtime?: boolean;
}

export const useBlogPosts = (options: UseBlogPostsOptions = {}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : options.offset || 0;
      const data = await blogService.posts.getAll({
        ...options,
        offset: currentOffset
      });
      
      if (reset) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      // Check if there are more posts
      setHasMore(data.length === (options.limit || 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching posts');
    } finally {
      setLoading(false);
    }
  }, [options]);

  const createPost = useCallback(async (post: BlogPostInsert) => {
    try {
      setError(null);
      const newPost = await blogService.posts.create(post);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating post';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updatePost = useCallback(async (id: string, updates: BlogPostUpdate) => {
    try {
      setError(null);
      const updatedPost = await blogService.posts.update(id, updates);
      setPosts(prev => 
        prev.map(post => post.id === id ? updatedPost : post)
      );
      return updatedPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating post';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      setError(null);
      await blogService.posts.delete(id);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting post';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const incrementViewCount = useCallback(async (id: string) => {
    try {
      await blogService.posts.incrementViewCount(id);
      setPosts(prev => 
        prev.map(post => 
          post.id === id 
            ? { ...post, view_count: post.view_count + 1 }
            : post
        )
      );
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  }, []);

  const searchPosts = useCallback(async (query: string, searchLimit?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogService.posts.search(query, { limit: searchLimit });
      setPosts(data);
      setHasMore(false); // Search results don't support pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostById = useCallback((id: string) => {
    return posts.find(post => post.id === id);
  }, [posts]);

  const getPostBySlug = useCallback((slug: string) => {
    return posts.find(post => post.slug === slug);
  }, [posts]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    
    const newOffset = (options.offset || 0) + (options.limit || 10);
    fetchPosts(false);
  }, [hasMore, loading, options.offset, options.limit, fetchPosts]);

  useEffect(() => {
    fetchPosts(true);
  }, [options.published, options.featured, options.categoryId, options.orderBy, options.orderDirection]);

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('blog_posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blog_posts' },
        (payload) => {
          console.log('Blog posts change received:', payload);
          // Handle different types of changes
          if (payload.eventType === 'INSERT' && payload.new) {
            setPosts(prev => [payload.new as BlogPost, ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setPosts(prev => prev.map(post => 
              post.id === payload.new.id ? payload.new as BlogPost : post
            ));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id));
          } else {
            // Fallback: refresh all data
            fetchPosts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    refetch: () => fetchPosts(true),
    loadMore,
    createPost,
    updatePost,
    deletePost,
    incrementViewCount,
    searchPosts,
    getPostById,
    getPostBySlug
  };
};

export default useBlogPosts;