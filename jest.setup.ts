import '@testing-library/jest-dom';

// Setup global mocks for TextEncoder and TextDecoder
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';

// Ensure the types match by casting them to the correct type
(global as any).TextEncoder = NodeTextEncoder;
(global as any).TextDecoder = NodeTextDecoder;

// Mock Firebase auth and firestore to prevent real Firebase calls
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // immediately invoke callback with `null` (unauthenticated)
    callback(null);
    // return a no-op unsubscribe function
    return () => {};
  }),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'ORDER123' })),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({}) })),
  setDoc: jest.fn(),
}));

// Mock import.meta.env so firebaseConfig.ts never blows up
global.import = {
  ...global.import,
  meta: {
    env: {
      VITE_FIREBASE_API_KEY: 'fake-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'fake-auth-domain',
      VITE_FIREBASE_PROJECT_ID: 'fake-project-id',
      VITE_FIREBASE_STORAGE_BUCKET: 'fake-storage-bucket',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'fake-sender-id',
      VITE_FIREBASE_APP_ID: 'fake-app-id',
    },
  },
};
