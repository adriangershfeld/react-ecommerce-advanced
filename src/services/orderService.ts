// src/services/orderService.ts
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CartItem } from '../store';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

const COLLECTION_NAME = 'orders';
const ordersCollection = collection(db, COLLECTION_NAME);

// Create a new order from cart items
export const createOrder = async (
  userId: string, 
  items: CartItem[], 
  totalAmount: number
): Promise<Order> => {
  try {
    const newOrder = {
      userId,
      items,
      totalAmount,
      status: 'completed' as const,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(ordersCollection, newOrder);
    return { 
      id: docRef.id, 
      ...newOrder,
      createdAt: newOrder.createdAt.toDate() 
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Convert Firestore document to Order
const convertDocToOrder = (doc: DocumentData): Order => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    items: data.items,
    totalAmount: data.totalAmount,
    status: data.status,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
  };
};

// Get all orders for a specific user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) {
    console.error("getUserOrders called with no userId");
    return [];
  }
  
  try {
    const q = query(
      ordersCollection, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToOrder);
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    // Return empty array instead of throwing to provide graceful degradation
    return [];
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, COLLECTION_NAME, orderId));
    
    if (orderDoc.exists()) {
      return convertDocToOrder(orderDoc);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    return null;
  }
};

// Get all orders (admin only)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const querySnapshot = await getDocs(
      query(ordersCollection, orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(convertDocToOrder);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    // Return empty array instead of throwing
    return [];
  }
};