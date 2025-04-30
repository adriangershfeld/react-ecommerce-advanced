// src/components/admin/AdminOrders.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '../../services/orderService';
import './AdminOrders.css';

const AdminOrders: React.FC = () => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Fetch all orders for admin
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getAllOrders
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
  
  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  if (isLoading) return <div>Loading orders...</div>;
  if (isError) return <div>Error loading orders</div>;
  if (!orders || orders.length === 0) return <div>No orders found</div>;
  
  return (
    <div className="admin-orders">
      <h2>Manage Orders</h2>
      
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>User ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="order-row">
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.userId.substring(0, 8)}...</td>
                  <td>{order.items.reduce((total, item) => total + item.quantity, 0)}</td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded order details row */}
                {expandedOrderId === order.id && (
                  <tr className="order-details-row">
                    <td colSpan={7}>
                      <div className="order-details-content">
                        <h4>Order Items</h4>
                        <table className="order-items-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Product</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="product-thumbnail"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror = null;
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                    }}
                                  />
                                </td>
                                <td>{item.title}</td>
                                <td>${item.price.toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={4} className="total-label">Total:</td>
                              <td className="total-value">${order.totalAmount.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;