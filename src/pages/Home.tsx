// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store';
import { getProductsByCategory, getAllCategories, migrateProductsFromAPI } from '../services/productService';
import { Product } from '../utils/types';
import './Home.css';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const dispatch = useDispatch();

  useEffect(() => {
    migrateProductsFromAPI().catch(console.error);
  }, []);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const {
    data: products,
    isLoading,
    error
  } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory],
    queryFn: () => getProductsByCategory(selectedCategory)
  });

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      rating: product.rating
    }));
  };

  if (isLoading) return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      Loading products...
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      Error loading products: {(error as Error).message}
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
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
        {categories?.map((category: string) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {products?.map((product: Product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ddd',
              padding: '15px',
              textAlign: 'center'
            }}
          >
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
            <p>${product.price.toFixed(2)}</p>
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