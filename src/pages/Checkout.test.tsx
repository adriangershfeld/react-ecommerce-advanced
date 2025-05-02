import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from '../store';
import Checkout from './Checkout';
import { clearCart } from '../store';
import { createOrder } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../services/orderService');
jest.mock('../hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Checkout Component', () => {
  const mockNavigate = jest.fn();
  const mockCreateOrder = createOrder as jest.MockedFunction<typeof createOrder>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    store.dispatch(clearCart());
    mockUseAuth.mockReturnValue({ user: { uid: 'test-user-id' }, isLoading: false });
    mockCreateOrder.mockResolvedValue({ success: true, orderId: 'ORDER123' });
    jest.clearAllMocks();
  });

  test('renders checkout with cart items', () => {
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
  });

  test('renders empty cart message when no items in cart', () => {
    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test('displays error if user is not logged in', async () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByText('Place Order'));
    await waitFor(() => expect(screen.getByText(/logged in/i)).toBeInTheDocument());
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
      expect(mockCreateOrder).toHaveBeenCalledWith(
        'test-user-id',
        expect.any(Array),
        10
      );
      expect(store.getState().cart.items).toHaveLength(0);
    });
  });
});