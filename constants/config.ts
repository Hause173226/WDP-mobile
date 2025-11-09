import Constants from 'expo-constants';

export const API_BASE_URL = 'https://api.evmarketplace.vn';

export const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const PRODUCT_CATEGORIES = {
  EV: 'electric_vehicle',
  BATTERY: 'battery',
  PARTS: 'parts',
};

export const CONDITION_TYPES = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
};
