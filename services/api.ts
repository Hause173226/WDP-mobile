import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';

export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'electric_vehicle' | 'battery' | 'parts';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  brand?: string;
  model?: string;
  year?: number;
  batteryCapacity?: number;
  mileage?: number;
  location: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  condition?: string;
  location?: string;
  search?: string;
}

export const api = {
  products: {
    getAll: async (filter?: ProductFilter): Promise<Product[]> => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.category) {
        query = query.eq('category', filter.category);
      }
      if (filter?.minPrice) {
        query = query.gte('price', filter.minPrice);
      }
      if (filter?.maxPrice) {
        query = query.lte('price', filter.maxPrice);
      }
      if (filter?.brand) {
        query = query.eq('brand', filter.brand);
      }
      if (filter?.condition) {
        query = query.eq('condition', filter.condition);
      }
      if (filter?.location) {
        query = query.ilike('location', `%${filter.location}%`);
      }
      if (filter?.search) {
        query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    getById: async (id: string): Promise<Product | null> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: Partial<Product>): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    getFeatured: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  },

  auth: {
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    register: async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      return data;
    },

    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  },

  getSuggestedPrice: async (productData: any): Promise<number> => {
    return Math.floor(Math.random() * 500000000) + 100000000;
  },
};
