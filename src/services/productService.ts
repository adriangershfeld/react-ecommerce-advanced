// src/services/productService.ts
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Product } from '../utils/types';

const COLLECTION_NAME = 'products';
const productsCollection = collection(db, COLLECTION_NAME);

// Get all products from Firestore
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image: data.image,
        rating: data.rating
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  if (!category) {
    return getAllProducts();
  }
  
  try {
    const q = query(productsCollection, where('category', '==', category));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image: data.image,
        rating: data.rating
      } as Product;
    });
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

// Get all categories
export const getAllCategories = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    const categoriesSet = new Set<string>();

    querySnapshot.docs.forEach(doc => {
      const category = doc.data().category;
      if (category) {
        categoriesSet.add(category);
      }
    });

    return Array.from(categoriesSet);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, COLLECTION_NAME, id));
    if (productDoc.exists()) {
      const data = productDoc.data();
      return {
        id: productDoc.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image: data.image,
        rating: data.rating
      } as Product;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const docRef = await addDoc(productsCollection, product);
    return { 
      id: docRef.id, 
      ...product 
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(productRef, product);
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};

// Helper function to migrate products from FakeStore API to Firestore
export const migrateProductsFromAPI = async (): Promise<void> => {
  try {
    const existingProducts = await getAllProducts();
    if (existingProducts.length > 0) {
      console.log('Products already exist in Firestore');
      return;
    }

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    const batch = [];
    for (const product of products) {
      const { id, ...productData } = product;
      batch.push(addDoc(productsCollection, productData));
    }

    await Promise.all(batch);
    console.log('Products successfully migrated to Firestore');
  } catch (error) {
    console.error('Error migrating products to Firestore:', error);
    throw error;
  }
};