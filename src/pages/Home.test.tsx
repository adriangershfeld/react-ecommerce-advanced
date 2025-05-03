// Unit tests for the Home component using mocked product service and react-query behavior

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store, clearCart } from '../store';
import Home from './Home';
import * as productService from '../services/productService';
import { useQuery } from '@tanstack/react-query';

// Mock productService functions to isolate the component from backend
jest.mock('../services/productService', () => ({
  getAllCategories: jest.fn(),
  getProductsByCategory: jest.fn(),
  migrateProductsFromAPI: jest.fn()
}));

// Mock useQuery to simulate different data-fetching states
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn()
}));

describe('Home Component', () => {
  beforeEach(() => {
    // Clear Redux cart state before each test to avoid cross-test contamination
    store.dispatch(clearCart());
    jest.resetAllMocks();

    // Ensure migrateProductsFromAPI always resolves cleanly (if used)
    (productService.migrateProductsFromAPI as jest.Mock).mockResolvedValue(undefined);
  });

  test('renders loading state initially', () => {
    // Simulate categories loaded but products still loading
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: [], isLoading: false, error: null }))  // Categories
      .mockImplementationOnce(() => ({ data: [], isLoading: true, error: null }));  // Products

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    // Confirm that loading message is shown
    expect(screen.getByText(/Loading products…/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    // Simulate successful category load but product fetch fails
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: ['Cat'], isLoading: false, error: null }))      // Categories
      .mockImplementationOnce(() => ({ data: null, isLoading: false, error: new Error('Fetch failed') })); // Products error

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    // Ensure error message appears on screen
    expect(screen.getByText(/Error loading products: Fetch failed/i)).toBeInTheDocument();
  });

  test('renders categories and products, and adds to cart', async () => {
    // Mock API responses for categories and products
    (productService.getAllCategories as jest.Mock).mockResolvedValue(['Electronics']);
    (productService.getProductsByCategory as jest.Mock).mockResolvedValue([
      {
        id: 'p1',
        title: 'Prod 1',
        price: 50,
        image: 'img1',
        category: 'Electronics',
        description: '',
        rating: undefined
      }
    ]);

    // Simulate successful data fetch via useQuery
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: ['Electronics'], isLoading: false, error: null })) // Categories
      .mockImplementationOnce(() => ({
        data: [
          {
            id: 'p1',
            title: 'Prod 1',
            price: 50,
            image: 'img1',
            category: 'Electronics',
            description: '',
            rating: undefined
          }
        ],
        isLoading: false,
        error: null
      })); // Products

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    // Wait until category is rendered in the dropdown
    await waitFor(() => expect(screen.getByRole('option', { name: /Electronics/i })).toBeInTheDocument());

    // Confirm product is shown
    expect(screen.getByText(/Prod 1/i)).toBeInTheDocument();

    // Simulate user clicking "Add to Cart"
    await userEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    // Confirm that product was added to Redux store
    const state = store.getState();
    expect(state.cart.items).toHaveLength(1);
    expect(state.cart.items[0].title).toBe('Prod 1');
  });
});
