// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { addToCart, Product } from '../store.ts';
import { getAllProducts, getProductsByCategory, getAllCategories, migrateProductsFromAPI } from '../services/productService';
import './Home.css';

/**
 * Home Component - Main product listing page with category filtering
 * Uses React Query for data fetching and caching
 */
const Home: React.FC = () => {
  // State for tracking selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const dispatch = useDispatch();

  // Run migration once on component mount
  useEffect(() => {
    migrateProductsFromAPI().catch(console.error);
  }, []);

  // Query to fetch and cache categories - updated for Firestore
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  // Query to fetch products based on selected category - updated for Firestore
  const {
    data: products,
    isLoading,
    error
  } = useQuery<Product[], Error>({
    queryKey: ['products', selectedCategory],
    queryFn: () => getProductsByCategory(selectedCategory)
  });

  /**
   * Handles adding a product to the cart
   * Dispatches Redux action with product data
   */
  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
  };

  // Loading state display
  if (isLoading) return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      Loading products...
    </div>
  );

  // Error state display
  if (error) return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      Error loading products: {error.message}
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      {/* Category dropdown filter */}
      <select
        value={selectedCategory}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSelectedCategory(e.target.value)
        }
        style={{
          marginBottom: '20px',
          padding: '10px',
          width: '100%',
          maxWidth: '300px'
        }}
      >
        <option value="">All Categories</option>
        {categories?.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Product grid - responsive layout with auto-sizing columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {/* Map through products and render product cards */}
        {products?.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ddd',
              padding: '15px',
              textAlign: 'center'
            }}
          >
            {/* Product image with fallback for broken images */}
            <img
              src={product.image}
              alt={product.title}
              style={{
                maxWidth: '100%',
                height: '200px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
              }}
            />
            <h3>{product.title}</h3>
            <p>${product.price}</p>
            {/* Added product details */}
            {product.description && (
              <p style={{ fontSize: '0.9rem', color: '#666', margin: '8px 0' }}>
                {product.description.slice(0, 128)}...
              </p>
            )}
            {product.rating && (
              <p style={{ fontSize: '0.9rem', color: '#444' }}>
                Rating: {product.rating.rate}/5 ({product.rating.count} reviews)
              </p>
            )}
            {/* Add to cart button - dispatches Redux action */}
            <button
              onClick={() => handleAddToCart(product)}
              className="add-to-cart-btn"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
