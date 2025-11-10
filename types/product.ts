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

