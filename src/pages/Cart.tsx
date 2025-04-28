import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';  
import { 
  RootState, 
  removeFromCart, 
  updateQuantity, 
  CartItem 
} from '../store.ts';
import './Cart.css';

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

  // Empty cart display
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Shopping Cart</h2>
        <p>Your cart is empty</p>
        <button 
          onClick={() => navigate('/')}
          className="continue-shopping-btn"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return ( 
    <div className="cart-container">
      <h2>Shopping Cart</h2>
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
             {/* Quantity Selector */}
            <div className="quantity-control">
              <label>Quantity: </label>
              <select
                value={item.quantity}
                onChange={(e) => dispatch(updateQuantity({
                  id: item.id,
                  quantity: Number(e.target.value)
                }))}
                className="quantity-select"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select> 
            </div>
            {/* Price Calculation */}
            <p>Price: ${(item.price * item.quantity).toFixed(2)}</p>
            {/* Remove item button (removeFromCart action) */}
            <button
              onClick={() => dispatch(removeFromCart(item.id))}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* Cart summary and checkout section */}
      <div className="cart-summary">
        <h3>Total Items: {cartItems.reduce((total, item) => total + item.quantity, 0)}</h3>
        <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
        <div className="cart-actions">
          <button
            onClick={() => navigate('/')}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleCheckout}
            className="checkout-btn"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;