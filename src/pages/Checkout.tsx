// src/pages/Checkout.tsx
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
  
  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!user?.uid) {
      setError('You must be logged in to checkout');
      return;
    }
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create order in Firestore
      await createOrder(user.uid, cartItems, totalAmount);
      
      // Clear cart after successful order
      dispatch(clearCart());
      
      // Redirect to order history
      navigate('/order-history');
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
      setIsSubmitting(false);
    }
  };
  
  // Back to cart
  const handleBackToCart = () => {
    navigate('/cart');
  };
  
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
      {error && <div className="error-message">{error}</div>}
      
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <div className="checkout-items">
          {cartItems.map((item) => (
            <div key={item.id} className="checkout-item">
              <div className="item-image">
                <img 
                  src={item.image} 
                  alt={item.title}
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
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="order-total">
          <h3>Total: ${totalAmount.toFixed(2)}</h3>
        </div>
      </div>
      
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
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
