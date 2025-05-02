import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { store } from '../store';
import { clearCart, addToCart } from '../store';
import  Checkout  from './Checkout';

describe('Checkout Page', () => {
  beforeEach(() => {
    // Clear sessionStorage and Redux state
    sessionStorage.clear();
    store.dispatch(clearCart());
  });

  const renderWithRouter = () =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/checkout']}>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

  test('renders empty cart message', () => {
    renderWithRouter();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test('renders cart items and checkout form when cart is filled', () => {
    store.dispatch(
      addToCart({
        id: '1',
        title: 'Test Product',
        price: 10,
        image: 'test.jpg',
      })
    );

    renderWithRouter();

    expect(screen.getByText(/test product/i)).toBeInTheDocument();
    expect(screen.getByText(/place order/i)).toBeInTheDocument();
  });
});
