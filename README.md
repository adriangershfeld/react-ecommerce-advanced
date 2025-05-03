## Overview

A React + Firebase eCommerce web app developed as the final project for the **Front-End Specialization** at Coding Temple.

Live at https://react-ecommerce-advanced.vercel.app/ !

---

## Current Features

- ✅ Firebase Authentication (Register, Login, Logout)
- ✅ Firestore integration for user profiles
- ✅ Product display (fetched from Firestore)

- ✅ Shopping cart with Redux
- ✅ React Query for caching and async handling
- ✅ Admin panel for products
- ✅ Checkout and Order History

- ✅ Comprehensive Documentation
- ✅ Comprehensive code commenting for clarity and maintainability
- ✅ Comprehensive test coverage:
  - **Integration Tests**:
    - Cart component (Redux + Routing) - tests cart state persistence, checkout navigation, and empty state behavior
    - Checkout flow (Cart integration + Form submission)
  - **Unit Tests**:
    - Home component (Product listing, error states, React Query interactions)
    - Individual utility functions

---

## Getting Started

### Prerequisites

- Node.js
- Firebase project
- Firebase Authentication + Firestore enabled

### Setup

1. Clone this repo.
2. Run `npm install` to install dependencies.
3. Create a `firebaseConfig.ts` file inside `src/` and export:
   ```ts
   export const firebaseConfig = { /* your firebase config */ };
   export const auth = getAuth(app);
   export const db = getFirestore(app);

## Some queries may require Firestore indexes. If you encounter errors,
## check the Firebase/Browser Console and set up the required indexes