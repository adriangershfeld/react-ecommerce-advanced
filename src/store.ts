import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Base product type with fakestore structure
interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category?: string; // these are optional because cartitem does not need them
  description?: string;
  rating?: {  // Add the rating property as optional
    rate: number;
    count: number;
  };
}

// Cart item extends Product with quantity [CartItem is just a product with quantity]
interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: JSON.parse(sessionStorage.getItem('cart') || '[]') } as CartState, // cart initialized from sessionStorage if available, otherwise empty array
  reducers: {
    // Adds an item to cart or increments quantity
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      sessionStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    // Removes item completely from cart
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      sessionStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    // Updates quantity of specific item
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      sessionStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    // Clears entire cart by resetting items array
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

// Export actions and types
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export types for component usage
export type { Product, CartItem };