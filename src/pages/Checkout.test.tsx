import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from '../store';
import Checkout from './Checkout';
import { clearCart } from '../store';
import { createOrder } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import '@testing-library/jest-dom';


// Mock the `createOrder` and `useAuth` hook
jest.mock('../services/orderService');
jest.mock('../hooks/useAuth');

describe('Checkout Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    // Clear the store before each test
    store.dispatch(clearCart());
    
    // Mock the `useAuth` hook to simulate a logged-in user
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'test-user-id' } });
    
    // Mock `createOrder` to prevent actual API calls
    (createOrder as jest.Mock).mockResolvedValue(undefined);
  });

  test('renders checkout with cart items', () => {
    // Add cart items to the store
    store.dispatch({
      type: 'cart/addToCart',
      payload: { id: '1', title: 'Test Product', price: 10, quantity: 1, image: '' }
    });
    
    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('Total: $10.00')).toBeInTheDocument();
  });

  test('renders empty cart message when no items in cart', () => {
    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Your cart is empty. Please add some products before checkout.')).toBeInTheDocument();
  });

  test('displays error if user is not logged in', async () => {
    // Mock the useAuth hook to simulate a logged-out user
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByText('Place Order'));

    await waitFor(() => expect(screen.getByText('You must be logged in to checkout')).toBeInTheDocument());
  });

  test('displays error if cart is empty and order is placed', async () => {
    // Add an empty cart
    store.dispatch(clearCart());

    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByText('Place Order'));

    await waitFor(() => expect(screen.getByText('Your cart is empty')).toBeInTheDocument());
  });

  test('successfully submits the order and clears the cart', async () => {
    store.dispatch({
      type: 'cart/addToCart',
      payload: { id: '1', title: 'Test Product', price: 10, quantity: 1, image: '' }
    });

    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByText('Place Order'));

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith('test-user-id', expect.any(Array), 10);
      expect(store.getState().cart.items).toHaveLength(0); // Cart should be cleared
    });

    // Test navigation to order history (we'll check the mock navigate function)
    expect(mockNavigate).toHaveBeenCalledWith('/order-history');
  });

  test('clicking "Back to Cart" redirects to the cart page', () => {
    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByText('Back to Cart'));
    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });
});
