# React E-Commerce Advanced

## Overview

A React + Firebase eCommerce web app developed as the final project for the **Front-End Specialization** at Coding Temple.

Live at [https://react-ecommerce-advanced.vercel.app/](https://react-ecommerce-advanced.vercel.app/)!

---

## Current Features

- ✅ **User Authentication**
  - Firebase Authentication (Register, Login, Logout)
  - Password reset functionality
  - Protected routes with role-based access

- ✅ **Data Management**
  - Firestore integration for user profiles and products
  - Automatic data migration from external API when needed
  - Real-time updates with React Query

- ✅ **Shopping Experience**
  - Product browsing with category filtering
  - Product display (fetched from Firestore)
  - Shopping cart with Redux for state management
  - Session-based cart persistence

- ✅ **Checkout System**
  - Secure ordering process
  - Order history tracking
  - User profile management

- ✅ **Admin Features**
  - Admin-protected routes
  - Product management (add, edit, delete)
  - Order monitoring

- ✅ **Technical Implementation**
  - React Query for caching and async state management
  - Redux for global state management
  - TypeScript for type safety
  - Responsive design

- ✅ **Quality Assurance**
  - Comprehensive Documentation
  - Comprehensive code commenting for clarity and maintainability
  - Comprehensive test coverage:
    - **Integration Tests**:
      - Cart component (Redux + Routing) - tests cart state persistence, checkout navigation, and empty state behavior
      - Checkout flow (Cart integration + Form submission)
    - **Unit Tests**:
      - Home component (Product listing, error states, React Query interactions)
      - Authentication components and protected routes
      - Redux store and reducers

## Setup Instructions

### Prerequisites

- Node.js (v16 or newer)
- Firebase project with:
  - Authentication enabled (Email/Password)
  - Firestore Database enabled
  - Required Firestore indexes (check Firebase console for errors)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-ecommerce-webapp-advanced
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Testing

Run the test suite with:

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch
```

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD workflow:

- **Continuous Integration**: Automated testing runs on all pull requests and pushes to main
- **Continuous Deployment**: Successful builds on the main branch are automatically deployed to Vercel
- **Environment Management**: Environment variables are securely managed through Vercel integration

The workflow can be found in `.github/workflows/main.yml`.

## Project Structure

```
src/
  ├── __mocks__/         # Test mocks
  ├── assets/            # Static assets and global styles
  ├── components/        # UI components
  │   ├── admin/         # Admin-specific components
  │   └── auth/          # Authentication components
  ├── contexts/          # React context providers
  ├── hooks/             # Custom React hooks
  ├── pages/             # Page components
  ├── services/          # Firebase and API services
  └── utils/             # Utility functions and types
```
