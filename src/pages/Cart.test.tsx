import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import { clearCart, addToCart } from '../store';
import Cart from './Cart';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Cart Page', () => {
  beforeEach(() => {
    // Clear Redux state and reset mocks
    store.dispatch(clearCart());
    mockNavigate.mockReset();
  });

  const renderCart = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Cart />
        </MemoryRouter>
      </Provider>
    );

  test('renders empty cart message', () => {
    renderCart();
    expect(screen.getByText(/You haven’t added anything yet/i)).toBeInTheDocument(); // EVIL CURLY APOSTROPHE
  });

  test('renders cart items when cart is filled', () => {
    store.dispatch(
      addToCart({
        id: '1',
        title: 'Test Product',
        price: 10,
        image: 'test.jpg'
      })
    );

    renderCart();

    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/Checkout Now/i)).toBeInTheDocument();
  });

  test('navigates to checkout page when checkout button is clicked', () => {
    store.dispatch(
      addToCart({
        id: '1',
        title: 'Test Product',
        price: 10,
        image: 'test.jpg'
      })
    );

    renderCart();
    
    const checkoutButton = screen.getByText(/Checkout Now/i);
    checkoutButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  test('navigates to home page when "Keep Shopping" button is clicked', () => {
    store.dispatch(
      addToCart({
        id: '1',
        title: 'Test Product',
        price: 10,
        image: 'test.jpg'
      })
    );

    renderCart();
    
    const keepShoppingButton = screen.getByText(/Keep Shopping/i);
    keepShoppingButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});