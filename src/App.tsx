// Modify the App.tsx file to add AdminOrders route

import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store.ts';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home.tsx';
import Cart from './pages/Cart.tsx';
import Profile from './pages/Profile.tsx';
import OrderHistory from './pages/OrderHistory.tsx';
import Checkout from './pages/Checkout.tsx';

// Components
import Navigation from './components/Navigation.tsx';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PasswordReset from './components/auth/PasswordReset';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminProducts from './components/admin/AdminProducts.tsx';
import AdminOrders from './components/admin/AdminOrders.tsx'; // Import AdminOrders
import AdminRoute from './components/AdminRoute.tsx';

import './App.css';

// Initialize React Query client
const queryClient = new QueryClient();

const App: React.FC = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <Navigation />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              
              {/* Protected routes */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/order-history" element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin/products" element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              } />
              
              {/* Redirect any unknown paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;