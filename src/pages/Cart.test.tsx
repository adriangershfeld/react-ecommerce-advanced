// Cart.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store.ts';  // Import the actual store
import Cart from './Cart';  // Your Cart component

// Mock sessionStorage
beforeAll(() => {
  // Mock sessionStorage methods
  global.sessionStorage = {
    getItem: jest.fn().mockReturnValue('[]'),
    setItem: jest.fn(),
    clear: jest.fn()
  };
});

describe('Cart Component', () => {
  it('renders empty cart message when no items are in the cart', () => {
    // Create a mock store with no items in the cart
    render(
      <Provider store={store}>
        <Cart />
      </Provider>
    );

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('renders items in the cart and handles removing an item', () => {
    // Mock the cart state with one item
    const initialState = {
      cart: {
        items: [
          {
            id: '1',
            title: 'Test Product',
            price: 19.99,
            image: 'https://via.placeholder.com/100',
            quantity: 2
          }
        ]
      }
    };

    const mockStore = configureStore({
      reducer: store.reducer,
      preloadedState: initialState
    });

    render(
      <Provider store={mockStore}>
        <Cart />
      </Provider>
    );

    // Check if item is rendered correctly
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText('$39.98')).toBeInTheDocument();

    // Simulate removing the item
    fireEvent.click(screen.getByText(/remove/i));

    // Check if item was removed (empty cart message appears)
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('updates the quantity of an item', () => {
    // Mock the cart state with one item
    const initialState = {
      cart: {
        items: [
          {
            id: '1',
            title: 'Test Product',
            price: 19.99,
            image: 'https://via.placeholder.com/100',
            quantity: 1
          }
        ]
      }
    };

    const mockStore = configureStore({
      reducer: store.reducer,
      preloadedState: initialState
    });

    render(
      <Provider store={mockStore}>
        <Cart />
      </Provider>
    );

    // Check initial quantity
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();

    // Change quantity
    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '3' } });

    // Check if quantity is updated
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByText('$59.97')).toBeInTheDocument();  // Updated total price
  });

  it('displays total price correctly', () => {
    const initialState = {
      cart: {
        items: [
          { id: '1', title: 'Product 1', price: 10, quantity: 2, image: '' },
          { id: '2', title: 'Product 2', price: 20, quantity: 1, image: '' }
        ]
      }
    };

    const mockStore = configureStore({
      reducer: store.reducer,
      preloadedState: initialState
    });

    render(
      <Provider store={mockStore}>
        <Cart />
      </Provider>
    );

    // Check total price calculation
    expect(screen.getByText('$40.00')).toBeInTheDocument();  // 10*2 + 20*1 = 40
  });
});
