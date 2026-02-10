import { create } from 'zustand';
import dayjs from 'dayjs';

interface SearchState {
  city: string;
  keyword: string;
  checkIn: string;
  checkOut: string;
  star: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  tag: string;
  roomCount: number;
  adultCount: number;
  setCity: (city: string) => void;
  setKeyword: (keyword: string) => void;
  setCheckIn: (date: string) => void;
  setCheckOut: (date: string) => void;
  setStar: (star: number | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setTag: (tag: string) => void;
  setRoomCount: (n: number) => void;
  setAdultCount: (n: number) => void;
  reset: () => void;
}

const useSearchStore = create<SearchState>((set) => ({
  city: '',
  keyword: '',
  checkIn: dayjs().format('YYYY-MM-DD'),
  checkOut: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  star: null,
  minPrice: null,
  maxPrice: null,
  tag: '',
  roomCount: 1,
  adultCount: 2,
  setCity: (city) => set({ city }),
  setKeyword: (keyword) => set({ keyword }),
  setCheckIn: (checkIn) => set({ checkIn }),
  setCheckOut: (checkOut) => set({ checkOut }),
  setStar: (star) => set({ star }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setTag: (tag) => set({ tag }),
  setRoomCount: (roomCount) => set({ roomCount: Math.max(1, Math.min(10, roomCount)) }),
  setAdultCount: (adultCount) => set({ adultCount: Math.max(1, Math.min(20, adultCount)) }),
  reset: () =>
    set({
      city: '',
      keyword: '',
      checkIn: dayjs().format('YYYY-MM-DD'),
      checkOut: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      star: null,
      minPrice: null,
      maxPrice: null,
      tag: '',
      roomCount: 1,
      adultCount: 2,
    }),
}));

export default useSearchStore;
