import { WishlistItem } from '@/types/wishlistItem';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const getStoredWishlist = (): WishlistItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedItems = localStorage.getItem('wishlistItems');
    return storedItems ? JSON.parse(storedItems) : [];
  } catch {
    return [];
  }
};

const persistWishlist = (items: WishlistItem[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('wishlistItems', JSON.stringify(items));
  }
};

export const wishlist = createSlice({
  name: 'wishlist',
  initialState: { items: getStoredWishlist() },
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      persistWishlist(action.payload);
    },
    addItemToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const {
        id,
        title,
        price,
        slug,
        image,
        quantity,
        color
      } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.items = state.items.filter((item) => item.id !== id);
        persistWishlist(state.items);
        toast.error('Product removed from wishlist!');
        return;
      }

      state.items.push({
        id,
        title,
        slug,
        image,
        price,
        quantity,
        color
      });

      persistWishlist(state.items);
      toast.success('Product added to wishlist!');
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      persistWishlist(state.items);
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      persistWishlist(state.items);
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
  setWishlistItems
} = wishlist.actions;
export default wishlist.reducer;
