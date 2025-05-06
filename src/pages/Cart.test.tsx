import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import { clearCart, addToCart } from '../store';
import Cart from './Cart';

// Mock the useNavigate hook from react-router-dom to test navigation functionality
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Keep original module functionality
  useNavigate: () => mockNavigate, // Replace useNavigate with our mock function
}));

describe('Cart Page', () => {
  beforeEach(() => {
    // Reset the state and mocks before each test to ensure test isolation (each test runs independently)
    store.dispatch(clearCart()); // Clears the cart in Redux store for a clean starting state
    mockNavigate.mockReset(); // Resets the navigation mock to clear any previous calls
  }); 

  // Helper function to render the Cart component with necessary providers
  const renderCart = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Cart />
        </MemoryRouter>
      </Provider>
    );  // Provider connects the component to Redux
        // MemoryRouter simulates URL routing environment
        // This avoids duplicating setup code across multiple tests
        
  test('renders empty cart message when the cart contains no items', () => {
    renderCart();
    // Verify the empty cart message is displayed correctly
    expect(screen.getByText(/You haven't added anything yet/i)).toBeInTheDocument();
  });

  test('renders cart items when cart is filled with products', () => {
    // Add a test product to the cart before rendering
    store.dispatch(
      addToCart({
        id: '1',
        title: 'Test Product',
        price: 10,
        image: 'test.jpg'
      })
    );

    renderCart();

    // Verify the product details and checkout button are displayed
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/Checkout Now/i)).toBeInTheDocument();
  });

  test('navigates to checkout page when checkout button is clicked', () => {
    // Add a test product to the cart before rendering
    store.dispatch(
      addToCart({
        id: '1',
        title: 'Test Product',
        price: 10,
        image: 'test.jpg'
      })
    );

    renderCart();
    
    // Find and click the checkout button
    const checkoutButton = screen.getByText(/Checkout Now/i);
    checkoutButton.click();
    
    // Verify navigation occurred with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  test('navigates to home page when "Keep Shopping" button is clicked', () => {
    // Add a test product to the cart before rendering
    store.dispatch(
      addToCart({
        id: '1',
        title: 'Test Product',
        price: 10,
        image: 'test.jpg'
      })
    );

    renderCart();
    
    // Find and click the keep shopping button
    const keepShoppingButton = screen.getByText(/Keep Shopping/i);
    keepShoppingButton.click();
    
    // Verify navigation occurred back to home page
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});