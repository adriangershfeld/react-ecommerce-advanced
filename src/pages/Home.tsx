import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store';
import {
  getProductsByCategory,
  getAllCategories,
  migrateProductsFromAPI,
  getAllProducts
} from '../services/productService';
import { Product } from '../utils/types';
import '../assets/styles/main.css';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Track selected category
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAndMaybeMigrate = async () => {
      // Get all existing products from Firestore
      const existingProducts = await getAllProducts();
      console.log(`[Home] Found ${existingProducts.length} products in Firestore`);
  
      // Only run the migration if Firestore is empty
      if (existingProducts.length === 0) {
        console.log('[Home] No products in Firestore, migrating from API...');
        await migrateProductsFromAPI();
      }
    };
  
    // Run the check on first component mount
    checkAndMaybeMigrate();
  }, []);
  
  // Fetch all categories using React Query
  const { data: categories } = useQuery<string[]>({
    queryKey: ['categories'], // Cached globally based on this key
    queryFn: getAllCategories
  });

  // Fetch products based on selected category (updates when key changes)
  const {
    data: products,
    isLoading,
    error
  } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory],
    queryFn: () => getProductsByCategory(selectedCategory)
  });

  // Handle "Add to Cart" button click
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

  // Display loading state while fetching products
  if (isLoading) {
    return <div className="home-container">Loading products…</div>;
  }

  // Display error if product fetch fails
  if (error) {
    return (
      <div className="home-container">
        Error loading products: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Category dropdown for filtering */}
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

      {/* Product list */}
      <div className="product-grid">
        {products?.map((product: Product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.title}
              onError={(e) => {
                // Fallback in case image fails to load
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/200';
              }}
            />

            <h3>{product.title}</h3>
            <p>${product.price.toFixed(2)}</p>

            {/* Display short description if available */}
            {product.description && (
              <p
                className="description"
                data-full={product.description} // Optional full description reference
              >
                {product.description.slice(0, 128)}…
              </p>
            )}

            {/* Conditionally show rating info */}
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
