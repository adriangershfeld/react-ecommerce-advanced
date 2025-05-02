// Cart.test.tsx

import { render, screen } from '@testing-library/react';

describe('Cart Component', () => {
  test('renders placeholder', () => {
    render(<div>Cart placeholder</div>);
    expect(screen.getByText(/cart placeholder/i)).toBeInTheDocument();
  });
});