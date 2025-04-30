import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Updated Product type to match Firestore (string ID)
interface Product {
  id: string; // Changed from number to string
  title: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  rating?: {
    rate: number;
    count: number;
  };
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: JSON.parse(sessionStorage.getItem('cart') || '[]') } as CartState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      sessionStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => { // Changed to string
      state.items = state.items.filter(item => item.id !== action.payload);
      sessionStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => { // Changed to string
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      sessionStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    clearCart: (state) => {
      state.items = [];
      sessionStorage.setItem('cart', JSON.stringify(state.items));
    }
  }
});

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer
  }
});

// Update action payload types
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type { Product, CartItem };