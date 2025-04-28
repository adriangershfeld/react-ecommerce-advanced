// src/components/Navigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { logoutUser } from '../services/authService';

const Navigation: React.FC = () => {
  const { user, userData, loading } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logoutUser();
      // No need to navigate, the AuthContext will update and route protection will handle it
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">E-Commerce Store</Link>
      </div>
      
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        
        {!loading && (
          user ? (
            // Links for authenticated users
            <>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/order-history">Order History</Link></li>
              
              {/* Admin links - only shown if user is admin */}
              {userData?.isAdmin && (
                <li className="dropdown">
                  <span className="dropdown-toggle">Admin</span>
                  <div className="dropdown-menu">
                    <Link to="/admin/products">Products</Link>
                    <Link to="/admin/orders">Orders</Link>
                  </div>
                </li>
              )}
              
              <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
            </>
          ) : (
            // Links for guests
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )
        )}
      </ul>
    </nav>
  );
};

export default Navigation;