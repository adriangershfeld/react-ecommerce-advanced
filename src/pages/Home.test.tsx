import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';
import { Provider } from 'react-redux';
import { store } from '../store';

// Helper function to render with Redux provider
const renderWithStore = (component: JSX.Element) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe('Home Component', () => {
  it('should render Home page without crashing', () => {
    renderWithStore(<Home />);

    // Check if the page renders properly by checking the existence of certain elements
    expect(screen.getByText(/Featured Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Shop Now/i)).toBeInTheDocument();
  });

  it('should navigate to the product page when clicking on a product', async () => {
    renderWithStore(<Home />);

    // Simulate clicking on a product
    const productLink = screen.getByText(/Sample Product/i); // Replace with actual text of a product
    fireEvent.click(productLink);

    // Wait for the navigation to the product page (you can verify the URL or check for new elements on the product page)
    await waitFor(() => {
      expect(window.location.pathname).toBe('/product/sample-product'); // Replace with actual product route
    });
  });
});
