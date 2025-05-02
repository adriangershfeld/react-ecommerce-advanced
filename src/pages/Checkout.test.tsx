import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { User } from 'firebase/auth';
import { store } from '../store';
import Checkout from './Checkout';
import { clearCart } from '../store';
import { createOrder, Order } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import '@testing-library/jest-dom';
import { UserData } from '../utils/userTypes';

// Mock Firebase modules to prevent ESM issues
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'ORDER123' })),
}));

// Mock services and hooks with proper typing
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
    displayName: 'Test User',
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(() => Promise.resolve({ 
      token: 'mock-token',
      expirationTime: '0',
      issuedAtTime: '0',
      authTime: '0',
      signInProvider: 'password',
      claims: {},
    })),
    reload: jest.fn(),
    toJSON: jest.fn(),
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
  } as unknown as User;

  // Mock user data according to UserData type
  const mockUserData: UserData = {
    uid: 'test-user-id',
    email: 'test@example.com',
    isAdmin: false,
  };

  // Complete CartItem mock with all Product properties
  const mockCartItem = {
    id: '1',
    title: 'Test Product',
    price: 10,
    image: '/test-image.jpg',
    quantity: 1,
    category: 'test-category',
    description: 'Test description',
    rating: {
      rate: 4.5,
      count: 100
    }
  };

  // Complete Order mock matching Order interface
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

    // Mock order service with proper Order type
    mockCreateOrder.mockResolvedValue(mockOrder);
  });

  afterEach(() => {
    jest.clearAllMocks();
    store.dispatch(clearCart());
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

    // Check main elements
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('Total: $10.00')).toBeInTheDocument();
  });

  test('shows empty cart message when no items', () => {
    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test('displays auth error when unauthenticated', async () => {
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

  test('successful order submission flow', async () => {
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

    // Check loading state
    expect(screen.getByText('Processing...')).toBeInTheDocument();

    await waitFor(() => {
      // Verify order creation
      expect(mockCreateOrder).toHaveBeenCalledWith(
        'test-user-id',
        [mockCartItem],
        10
      );
      
      // Check cart clearance
      expect(store.getState().cart.items).toHaveLength(0);
      
      // Verify success state
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  });

  test('shows error for empty cart submission', async () => {
    store.dispatch(clearCart());
    
    render(
      <Provider store={store}>
        <Router>
          <Checkout />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByText('Place Order'));
    
    await waitFor(() => {
      expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
    });
  });
});