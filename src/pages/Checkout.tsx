// Checkout page component for reviewing cart items and placing an order

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, clearCart } from '../store';
import { createOrder } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import './styles/Checkout.css';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate the total price of all items in the cart
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Triggered when the user submits the order
  const handleSubmitOrder = async () => {
    // Prevent order placement if user is not logged in
    if (!user?.uid) {
      setError('You must be logged in to checkout');
      return;
    }

    // Prevent order placement if the cart is empty
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Save order to backend (e.g. Firestore)
      await createOrder(user.uid, cartItems, totalAmount);

      // Empty the cart after successful order
      dispatch(clearCart());

      // Navigate to order history page to confirm success
      navigate('/order-history');
    } catch (err: any) {
      // Show an error message if order submission fails
      setError(err.message || 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  // Navigate back to the cart page for changes
  const handleBackToCart = () => {
    navigate('/cart');
  };

  // Show fallback content if cart is empty before rendering the page
  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Checkout</h2>
        <p>Your cart is empty. Please add some products before checkout.</p>
        <button onClick={() => navigate('/')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {/* Show error message if any */}
      {error && <div className="error-message">{error}</div>}

      {/* Order Summary Section */}
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <div className="checkout-items">
          {cartItems.map((item) => (
            <div key={item.id} className="checkout-item">
              <div className="item-image">
                <img 
                  src={item.image} 
                  alt={item.title}
                  // Fallback image in case original fails to load
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                  }}
                />
              </div>
              <div className="item-details">
                <h4>{item.title}</h4>
                <div className="item-info">
                  <span>Quantity: {item.quantity}</span>
                  <span>Price: ${item.price.toFixed(2)}</span>
                </div>
                <div className="item-subtotal">
                  {/* Show price for this item multiplied by quantity */}
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Cost Display */}
        <div className="order-total">
          <h3>Total: ${totalAmount.toFixed(2)}</h3>
        </div>
      </div>

      {/* Action Buttons: Return or Submit */}
      <div className="checkout-actions">
        <button 
          className="back-button" 
          onClick={handleBackToCart}
        >
          Back to Cart
        </button>
        <button 
          className="place-order-button" 
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
        >
          {/* Show loading state while submitting */}
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
