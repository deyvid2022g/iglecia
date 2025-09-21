import { useState, useEffect, useCallback } from 'react';
import { blogService, type BlogCategory, type BlogCategoryInsert, type BlogCategoryUpdate } from '../services/blogService';

interface UseBlogCategoriesOptions {
  active?: boolean;
  orderBy?: 'display_order' | 'name' | 'created_at';
  realtime?: boolean;
}

export const useBlogCategories = (options: UseBlogCategoriesOptions = {}) => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogService.categories.getAll({
        active: options.active,
        orderBy: options.orderBy
      });
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  }, [options.active, options.orderBy]);

  const createCategory = useCallback(async (category: BlogCategoryInsert) => {
    try {
      setError(null);
      const newCategory = await blogService.categories.create(category);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: BlogCategoryUpdate) => {
    try {
      setError(null);
      const updatedCategory = await blogService.categories.update(id, updates);
      setCategories(prev => 
        prev.map(cat => cat.id === id ? updatedCategory : cat)
      );
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await blogService.categories.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting category';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const getCategoryBySlug = useCallback((slug: string) => {
    return categories.find(cat => cat.slug === slug);
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Real-time subscription
  useEffect(() => {
    if (!options.realtime) return;

    const subscription = blogService.categories.subscribe((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          if (newRecord) {
            setCategories(prev => [...prev, newRecord]);
          }
          break;
        case 'UPDATE':
          if (newRecord) {
            setCategories(prev => 
              prev.map(cat => cat.id === newRecord.id ? newRecord : cat)
            );
          }
          break;
        case 'DELETE':
          if (oldRecord) {
            setCategories(prev => prev.filter(cat => cat.id !== oldRecord.id));
          }
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [options.realtime]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryBySlug
  };
};

export default useBlogCategories;