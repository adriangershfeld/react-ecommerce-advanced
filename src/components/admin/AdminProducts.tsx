// src/components/admin/AdminProducts.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../services/productService';
import { Product } from '../../utils/types';
import './AdminProducts.css';

// Create a type for product form data
interface ProductFormData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const initialFormState: ProductFormData = {
  title: '',
  price: 0,
  description: '',
  category: '',
  image: ''
};

const AdminProducts: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  
  const queryClient = useQueryClient();
  
  // Fetch all products
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts
  });
  
  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    }
  });
  
  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    }
  });
  
  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
  
  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentProductId(null);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare rating object for new products
    const productData = {
      ...formData,
      rating: { rate: 0, count: 0 } // Default rating for new products
    };
    
    if (isEditing && currentProductId !== null) {
      updateMutation.mutate({
        id: currentProductId,
        data: productData
      });
    } else {
      createMutation.mutate(productData);
    }
  };
  
  // Edit product
  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setFormData({
      title: product.title,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      image: product.image
    });
  };
  
  // Delete product
  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };
  
  if (isLoading) return <div>Loading products...</div>;
  if (isError) return <div>Error loading products</div>;
  
  return (
    <div className="admin-products">
      <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {isEditing ? 'Update Product' : 'Add Product'}
          </button>
          
          {isEditing && (
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h2>Product List</h2>
      
      {products && products.length > 0 ? (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="product-thumbnail" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                      }}
                    />
                  </td>
                  <td>{product.title}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.category}</td>
                  <td>
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No products found. Please add some products.</p>
      )}
    </div>
  );
};

export default AdminProducts;