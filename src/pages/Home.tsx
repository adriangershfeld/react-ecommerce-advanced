import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store';
import {
  getProductsByCategory,
  getAllCategories,
  migrateProductsFromAPI
} from '../services/productService';
import { Product } from '../utils/types';
import './styles/Home.css';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const dispatch = useDispatch();

  useEffect(() => {
    migrateProductsFromAPI().catch(console.error);
  }, []);

  const { data: categories } = useQuery<string[]>({
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

  if (isLoading) {
    return <div className="home-container">Loading products…</div>;
  }

  if (error) {
    return (
      <div className="home-container">
        Error loading products: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="home-container">
      <select
        className="category-filter"
        value={selectedCategory}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSelectedCategory(e.target.value)
        }
      >
        <option value="">All Categories</option>
        {categories?.map((category: string) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <div className="product-grid">
        {products?.map((product: Product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.title}
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/200';
              }}
            />

            <h3>{product.title}</h3>
            <p>${product.price.toFixed(2)}</p>

            {product.description && (
              <p
               className="description"
               data-full={product.description}
               >
                {product.description.slice(0, 128)}…
              </p>
            )}

            {product.rating && (
              <p className="rating">
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
