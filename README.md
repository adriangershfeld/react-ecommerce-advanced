# React E-Commerce WebApp

**THIS IS A WORK IN PROGRESS**  
It is currently functional, but products and admin panel have not been implemented.  
Also it looks terrible.

Documentation is also WIP

---

## Overview

A React + Firebase eCommerce web app developed as the final project for the **Front-End Specialization** at Coding Temple.

---

## Current Features

- ✅ Firebase Authentication (Register, Login, Logout)
- ✅ Firestore integration for user profiles
- ✅ Product display (fetched from Firestore)
- ✅ Shopping cart with Redux
- ✅ React Query for caching and async handling
- ⏳ Admin panel for products (WIP)
- ⏳ Checkout and Order History (WIP)

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


# TODO (Firebase Migration & Admin Features)
## Product Management (Admin Panel)
- Migrate products from FakeStore API to Firestore ✅ COMPLETE
- Create products collection in Firestore ✅ COMPLETE
- Read: Display products from Firestore ✅ COMPLETE
- Create new products 
- Delete products

## Order Management
- Save user cart as an order on checkout
- Store order details: user, items, total, date
- Create order history page
- List previous orders by date and total
- View full details of each past order


## Final Steps
- Consolidate css and make it pretty
- Thorough comments and documentation
