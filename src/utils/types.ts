// types.ts

export interface Product {
    id: string; // Firestore document ID (string)
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    isAdmin: boolean;
    rating?: {
      rate: number;
      count: number;
    };
  }
  