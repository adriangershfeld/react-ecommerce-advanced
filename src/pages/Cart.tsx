import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';  
import { 
  RootState, 
  removeFromCart, 
  updateQuantity, 
  CartItem 
} from '../store';
import '../assets/styles/main.css';

/**
 * Cart Component - Displays the user's shopping cart and handles cart interactions
 * Uses Redux for state management and dispatch actions
 */
const Cart: React.FC = () => {
  // Access cart items from Redux store
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();  // Add navigate hook for redirecting to checkout

  // Calculate the total price of all items in cart
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Handler for checkout process - redirect to checkout page
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Empty cart display - shows message and browse products button
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart</h2>
        <p>You haven't added anything yet.</p>
        <button 
          onClick={() => navigate('/')}
          className="continue-shopping-btn"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return ( 
    <div className="cart-container">
      <h2>Your Cart</h2>
      {/* Map through and render each cart item */}
      {cartItems.map((item: CartItem) => (
        <div key={item.id} className="cart-item">
          {/* Product image with fallback for broken images */}
          <img
            src={item.image}
            alt={item.title}
            className="cart-item-image"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
            }}
          />
          <div className="cart-item-details">
            <h3>{item.title}</h3>
             {/* Quantity Selector - allows changing item quantity (1-10) */}
            <div className="quantity-control">
              <label>Qty: </label>
              <select
                value={item.quantity}
                onChange={(e) => dispatch(updateQuantity({
                  id: item.id,
                  quantity: Number(e.target.value)
                }))}
                className="quantity-select"
              >
                {/* Generate options for quantities 1-10 */}
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select> 
            </div>
            {/* Price Calculation - displays item subtotal based on quantity */}
            <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
            {/* Remove item button - dispatches removeFromCart action */}
            <button
              onClick={() => dispatch(removeFromCart(item.id))}
              className="remove-btn"
            >
              Delete Item
            </button>
          </div>
        </div>
      ))}

      {/* Cart summary and checkout section - displays totals and action buttons */}
      <div className="cart-summary">
        <h3>Items Total: {cartItems.reduce((total, item) => total + item.quantity, 0)}</h3>
        <h3>Order Total: ${totalPrice.toFixed(2)}</h3>
        <div className="cart-actions">
          {/* Continue shopping button - returns to home page */}
          <button
            onClick={() => navigate('/')}
            className="continue-shopping-btn"
          >
            Keep Shopping
          </button>
          {/* Checkout button - proceeds to checkout page */}
          <button
            onClick={handleCheckout}
            className="checkout-btn"
          >
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;