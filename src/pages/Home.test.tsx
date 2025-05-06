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
  migrateProductsFromAPI: jest.fn(),
  getAllProducts: jest.fn(() => Promise.resolve([])), // Mocking getAllProducts to return an empty array
}));

// Mocking the functions allows us to test the component without using actual API calls

// Mock useQuery to simulate different data-fetching states
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn()
}));

// Mocking the useQuery hook allows us to simulate loading, error, and success states

describe('Home Component', () => {
  beforeEach(() => {
    // Redux cart state is cleared before each test to ensure a clean slate
    // This prevents any leftover state from affecting the current test
    
    store.dispatch(clearCart());
    jest.resetAllMocks();

    // Ensure migrateProductsFromAPI always resolves cleanly
    (productService.migrateProductsFromAPI as jest.Mock).mockResolvedValue(undefined);
  });

// migrateProductsFromAPI is called as a side effect in the Home component.
// Because the actual return value is not used in the tests to avoid API calls
// we satisfy the contract by resolving it with an empty value

  test('renders loading state initially', () => {
    // Simulate categories loaded but products still loading
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: [], isLoading: false, error: null }))  // returns Categories (not loading) no error
      .mockImplementationOnce(() => ({ data: [], isLoading: true, error: null }));  // returns Products (loading) no error

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    ); // Renders home component with context

    // Confirm that loading message is shown
    expect(screen.getByText(/Loading products…/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    // Simulate successful category load but product fetch fails
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: ['Cat'], isLoading: false, error: null }))      // returns Categories
      .mockImplementationOnce(() => ({ data: null, isLoading: false, error: new Error('Fetch failed') })); // returns Products with error

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
    (productService.getAllCategories as jest.Mock).mockResolvedValue(['Electronics']); // getAllCategories returns ['Electronics']
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
    ]); // getProductsByCategory returns a test product

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
    // Uses role selector to find the option element

    // Confirm product is shown
    expect(screen.getByText(/Prod 1/i)).toBeInTheDocument();

    // Simulate user clicking "Add to Cart"
    await userEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    // Uses userEvent for realistic interaction simulation

    // Confirm that product was added to Redux store
    const state = store.getState();
    expect(state.cart.items).toHaveLength(1); // Checks cart contains 1 item
    expect(state.cart.items[0].title).toBe('Prod 1'); // Validates item title matches the test product
  });
});
