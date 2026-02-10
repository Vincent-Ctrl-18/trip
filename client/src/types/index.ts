// ========== Shared TypeScript Type Definitions ==========

export interface User {
  id: number;
  username: string;
  role: 'merchant' | 'admin';
  created_at?: string;
}

export interface Hotel {
  id: number;
  name_cn: string;
  name_en: string;
  city: string;
  address: string;
  star: number;
  opening_date: string;
  description: string;
  tags: string;       // JSON array string
  facilities: string; // JSON array string
  images: string;     // JSON array string
  merchant_id: number;
  status: HotelStatus;
  reject_reason: string;
  created_at?: string;
  updated_at?: string;
  RoomTypes?: RoomType[];
  NearbyPlaces?: NearbyPlace[];
  lowestPrice?: number | null;
}

export type HotelStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';

export interface RoomType {
  id: number;
  hotel_id: number;
  name: string;
  price: number;
  original_price: number | null;
  capacity: number;
  breakfast: boolean;
  images: string; // JSON array string
}

export interface NearbyPlace {
  id: number;
  hotel_id: number;
  type: 'attraction' | 'transport' | 'mall';
  name: string;
  distance: string;
}

export interface SearchParams {
  city?: string;
  keyword?: string;
  star?: number;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  total: number;
  page: number;
  pageSize: number;
  data: Hotel[];
}

export interface HotelFormData {
  name_cn: string;
  name_en?: string;
  city: string;
  address: string;
  star?: number;
  opening_date?: string;
  description?: string;
  tags?: string[];
  facilities?: string[];
  images?: string[];
  rooms?: RoomFormData[];
  nearbyPlaces?: NearbyPlaceFormData[];
}

export interface RoomFormData {
  name: string;
  price: number;
  original_price?: number | null;
  capacity?: number;
  breakfast?: boolean;
  images?: string[];
}

export interface NearbyPlaceFormData {
  type: 'attraction' | 'transport' | 'mall';
  name: string;
  distance: string;
}
