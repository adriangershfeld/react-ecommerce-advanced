// src/pages/OrderHistory.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders, getOrderById, Order } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import './OrderHistory.css';

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Fetch all user orders
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['userOrders', user?.uid],
    queryFn: () => user?.uid ? getUserOrders(user.uid) : Promise.resolve([]),
    enabled: !!user?.uid
  });
  
  // Fetch selected order details
  const { data: selectedOrder } = useQuery({
    queryKey: ['orderDetails', selectedOrderId],
    queryFn: () => selectedOrderId ? getOrderById(selectedOrderId) : Promise.resolve(null),
    enabled: !!selectedOrderId
  });

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle clicking on an order to view details
  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId === selectedOrderId ? null : orderId);
  };

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
            onClick={() => handleOrderClick(order.id)}
          >
            <div className="order-header">
              <div className="order-info">
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span className="order-id">Order #{order.id.substring(0, 8)}</span>
              </div>
              <div className="order-total">${order.totalAmount.toFixed(2)}</div>
            </div>
            
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
                    Status: <span className={`status-${selectedOrder.status}`}>{selectedOrder.status}</span>
                  </div>
                  <div className="order-total-summary">
                    <span>Total Items: {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    <span>Total Amount: ${selectedOrder.totalAmount.toFixed(2)}</span>
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
