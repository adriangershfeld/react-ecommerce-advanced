import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from '../store';
import Checkout from './Checkout';
import { clearCart } from '../store';
import { createOrder, Order } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import '@testing-library/jest-dom';
import { User } from 'firebase/auth';
import { UserData } from '../utils/userTypes';

// Mock dependencies
jest.mock('../services/orderService', () => ({
  createOrder: jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('Checkout Component', () => {
  const mockCreateOrder = createOrder as jest.MockedFunction<typeof createOrder>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  // Complete Firebase User mock
  const mockFirebaseUser: User = {
    uid: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    displayName: 'Test User',
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
  } as unknown as User;

  // Mock user data according to your UserData type
  const mockUserData: UserData = {
    uid: 'test-user-id',
    email: 'test@example.com',
    isAdmin: false,
  };

  // Mock cart item matching your store's CartItem type
  const mockCartItem = {
    id: '1',
    title: 'Test Product',
    price: 10,
    quantity: 1,
    image: ''
  };

  // Mock order response matching your Order interface
  const mockOrder: Order = {
    id: 'ORDER123',
    userId: 'test-user-id',
    items: [mockCartItem],
    totalAmount: 10,
    createdAt: new Date(),
    status: 'completed'
  };

  beforeEach(() => {
    store.dispatch(clearCart());
    
    // Mock auth state with all required properties
    mockUseAuth.mockReturnValue({ 
      user: mockFirebaseUser,
      userData: mockUserData,
      loading: false
    });

    // Mock order creation response
    mockCreateOrder.mockResolvedValue(mockOrder);
  });

  test('renders checkout with cart items', () => {
    store.dispatch({
      type: 'cart/addToCart',
      payload: mockCartItem
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

  test('displays error if user is not logged in', async () => {
    mockUseAuth.mockReturnValue({ 
      user: null,
      userData: null,
      loading: false
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
      expect(screen.getByText(/logged in/i)).toBeInTheDocument();
    });
  });

  test('successfully submits the order and clears the cart', async () => {
    store.dispatch({
      type: 'cart/addToCart',
      payload: mockCartItem
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
        [mockCartItem],
        10
      );
      expect(store.getState().cart.items).toHaveLength(0);
    });
  });
});