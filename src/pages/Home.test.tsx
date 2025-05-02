import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store, clearCart } from '../store';
import Home from './Home';
import * as productService from '../services/productService';
import { useQuery } from '@tanstack/react-query';

// Mock productService functions
jest.mock('../services/productService', () => ({
  getAllCategories: jest.fn(),
  getProductsByCategory: jest.fn(),
  migrateProductsFromAPI: jest.fn()
}));

// Mock react-query useQuery
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn()
}));

describe('Home Component', () => {
  beforeEach(() => {
    store.dispatch(clearCart());
    jest.resetAllMocks();
    // Ensure migrateProductsFromAPI returns a promise
    (productService.migrateProductsFromAPI as jest.Mock).mockResolvedValue(undefined);
  });

  test('renders loading state initially', () => {
    // Mock useQuery: first categories, then products loading
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: [], isLoading: false, error: null }))
      .mockImplementationOnce(() => ({ data: [], isLoading: true, error: null }));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Loading products…/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    // Mock useQuery: first categories, then products error
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: ['Cat'], isLoading: false, error: null }))
      .mockImplementationOnce(() => ({ data: null, isLoading: false, error: new Error('Fetch failed') }));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Error loading products: Fetch failed/i)).toBeInTheDocument();
  });

  test('renders categories and products, and adds to cart', async () => {
    // Mock service calls
    (productService.getAllCategories as jest.Mock).mockResolvedValue(['Electronics']);
    (productService.getProductsByCategory as jest.Mock).mockResolvedValue([
      { id: 'p1', title: 'Prod 1', price: 50, image: 'img1', category: 'Electronics', description: '', rating: undefined }
    ]);

    // Mock useQuery: categories then products
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({ data: ['Electronics'], isLoading: false, error: null }))
      .mockImplementationOnce(() => ({ data: [{ id: 'p1', title: 'Prod 1', price: 50, image: 'img1', category: 'Electronics', description: '', rating: undefined }], isLoading: false, error: null }));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('option', { name: /Electronics/i })).toBeInTheDocument());
    expect(screen.getByText(/Prod 1/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    const state = store.getState();
    expect(state.cart.items).toHaveLength(1);
    expect(state.cart.items[0].title).toBe('Prod 1');
  });
});
