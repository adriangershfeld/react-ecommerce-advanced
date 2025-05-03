import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders, getOrderById } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import './styles/OrderHistory.css';

const OrderHistory: React.FC = () => {
  const { user } = useAuth(); // Custom hook to get current authenticated user
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch all orders for the current user (runs only if user is logged in)
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['userOrders', user?.uid], // cache per user
    queryFn: () => user?.uid ? getUserOrders(user.uid) : Promise.resolve([]),
    enabled: !!user?.uid // don't run until user is defined
  });

  // Fetch detailed data for selected order (only when an order is selected)
  const { data: selectedOrder } = useQuery({
    queryKey: ['orderDetails', selectedOrderId],
    queryFn: () => selectedOrderId ? getOrderById(selectedOrderId) : Promise.resolve(null),
    enabled: !!selectedOrderId
  });

  // Format a Date object into readable string (US locale)
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Toggle order detail view
  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId === selectedOrderId ? null : orderId);
  };

  // Handle loading, error, and empty states
  if (isLoading) return <div>Loading order history...</div>;
  if (isError) return <div>Error loading orders</div>;
  if (!orders || orders.length === 0) return <div>No order history found</div>;

  return (
    <div className="order-history-container">
      <h2>Your Order History</h2>

      <div className="orders-list">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className={`order-item ${selectedOrderId === order.id ? 'selected' : ''}`}
            onClick={() => handleOrderClick(order.id)} // click to toggle order details
          >
            <div className="order-header">
              <div className="order-info">
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span className="order-id">Order #{order.id.substring(0, 8)}</span>
              </div>
              <div className="order-total">${order.totalAmount.toFixed(2)}</div>
            </div>

            {/* Show order details if this order is selected */}
            {selectedOrderId === order.id && selectedOrder && (
              <div className="order-details">
                <h3>Order Details</h3>

                <div className="order-items">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-product-item">
                      <div className="product-image">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          onError={(e) => {
                            // Fallback image in case of broken URL
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                          }}
                        />
                      </div>

                      <div className="product-info">
                        <h4>{item.title}</h4>
                        <div className="product-details">
                          <span>Quantity: {item.quantity}</span>
                          <span>Price: ${item.price.toFixed(2)}</span>
                          <span>Subtotal: ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="order-status">
                    Status: 
                    <span className={`status-${selectedOrder.status}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="order-total-summary">
                    <span>
                      Total Items: {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                    <span>
                      Total Amount: ${selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
