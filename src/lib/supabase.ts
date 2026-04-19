import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: 'coffee' | 'equipment' | 'bundle';
  subcategory: string | null;
  price_pence: number;
  currency: string;
  image_url: string | null;
  short_description: string | null;
  description: string | null;
  tasting_notes: string[] | null;
  origin: string | null;
  process: string | null;
  roast_level: string | null;
  weight_grams: number | null;
  stock: number | null;
  featured: boolean | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type ContentPost = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  created_at: string;
};

export function formatPrice(pence: number, currency = 'USD'): string {
  const value = pence / 100;
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '';
  return `${symbol}${value.toFixed(2)}`;
}
