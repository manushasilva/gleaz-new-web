import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
  shouldDisplayCart: boolean;
};

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
  image?: string;
  slug?: string;
  availableQuantity?: number;
  productId?: string;
  variantColor?: string;
  itemCode?: string;
  color?: string;
  size?: string;
  itemType?: "product" | "gift-voucher";
  attribute?: any;
  // Legacy support
  title?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const initialState: InitialState = {
  items: [],
  shouldDisplayCart: false,
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i.id === item.id);

      if (existingItem) {
        if (item.availableQuantity !== undefined) {
          existingItem.availableQuantity = item.availableQuantity;
        }
        const nextQuantity = existingItem.quantity + (item.quantity || 1);
        existingItem.quantity = item.availableQuantity === undefined
          ? nextQuantity
          : Math.min(nextQuantity, item.availableQuantity);
      } else {
        state.items.push({
          ...item,
          quantity: item.availableQuantity === undefined
            ? item.quantity || 1
            : Math.min(item.quantity || 1, item.availableQuantity),
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string | number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    incrementItem: (state, action: PayloadAction<string | number>) => {
      const itemId = action.payload;
      const existingItem = state.items.find((item) => item.id === itemId);

      if (existingItem) {
        existingItem.quantity = existingItem.availableQuantity === undefined
          ? existingItem.quantity + 1
          : Math.min(existingItem.quantity + 1, existingItem.availableQuantity);
      }
    },
    decrementItem: (state, action: PayloadAction<string | number>) => {
      const itemId = action.payload;
      const existingItem = state.items.find((item) => item.id === itemId);

      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      }
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string | number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
    loadCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    toggleCartModal: (state) => {
      state.shouldDisplayCart = !state.shouldDisplayCart;
    },
    setCartModalOpen: (state, action: PayloadAction<boolean>) => {
      state.shouldDisplayCart = action.payload;
    },
  },
});

// Selectors
export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectShouldDisplayCart = (state: RootState) =>
  state.cartReducer.shouldDisplayCart;

export const selectCartCount = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
});

export const selectCartDetails = createSelector([selectCartItems], (items) => {
  const details: Record<string | number, CartItem> = {};
  items.forEach((item) => {
    details[item.id] = item;
  });
  return details;
});

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

export const selectFormattedTotalPrice = createSelector(
  [selectTotalPrice],
  (totalPrice) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(totalPrice / 100);
  }
);

export const {
  addItemToCart,
  removeItemFromCart,
  incrementItem,
  decrementItem,
  updateCartItemQuantity,
  clearCart,
  removeAllItemsFromCart,
  loadCartFromStorage,
  toggleCartModal,
  setCartModalOpen,
} = cart.actions;
export default cart.reducer;
