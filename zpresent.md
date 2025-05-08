# React E-commerce Testing & Firestore Migration

## 1. Project Architecture & Migration to Firestore (2-3 min)

**Core Structure:**
```
├── src
│   ├── pages/           # Main UI flows (Home, Cart, Checkout, etc.)
│   ├── components/      # Reusable components (e.g., Navigation, Admin panels)
│   ├── services/        # Firestore interactions (productService.ts, orderService.ts)
│   ├── contexts/        # Global state (AuthContext.tsx)
│   ├── hooks/           # Custom hooks (useAuth.ts)
│   └── assets/          # Styling and static assets
```

**Firestore Migration Strategy:**
- **Automated Detection:** [Home.tsx (37-45)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.tsx#L37-L45) - checks Firestore via `getAllProducts`
- **One-time Migration:** [productService.ts (144-166)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.ts#L144-L166) - `migrateProductsFromAPI` implementation
- **Data Persistence:** [productService.ts (24-41)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.ts#L24-L41) - Products stored in Firestore
- **Security Rules:** Environment variables in [firebaseConfig.ts (6-13)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/firebaseConfig.ts#L6-L13)

---

## 2. Testing Architecture (3-4 min)

**Testing Strategy:**
- **Unit Tests:** [Cart.test.tsx](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx) showcases isolated Redux tests
- **Integration Tests:** [Home.test.tsx (85-113)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L85-L113) shows component + API integration
- **Mocking:** [__mocks__/firebaseConfig.ts (3-4)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/__mocks__/firebaseConfig.ts#L3-L4) and [jest.setup.ts (13-32)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.setup.ts#L13-L32)
- **Test Isolation:** [Checkout.test.tsx (13-17)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L13-L17) shows session clearing between tests

**Key Test Files:**
- **[Home.test.tsx (129-147)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L129-L147):** Tests migration to Firestore when DB is empty
- **[Checkout.test.tsx (111-127)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L111-L127):** Tests authentication error handling
- **[Cart.test.tsx (56-73)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx#L56-L73):** Tests Redux integration with UI

**Mocking Implementation:**
```
├── __mocks__/
│   ├── firebaseConfig.ts    # Mocks Firebase authentication and Firestore 
│   └── react-router-dom.ts  # Mocks navigation (see Cart.test.tsx:10-13)
```

---

## 3. TDD in Action: Test Examples (4-5 min)

**Firebase Integration Testing:**
```tsx
// From Home.test.tsx:129-147
test('triggers migration when Firestore is empty', async () => {
  // Simulate empty Firestore products collection
  (productService.getAllProducts as jest.Mock).mockResolvedValueOnce([]);
  
  // ...existing code...
  
  await waitFor(() => {
    expect(productService.migrateProductsFromAPI).toHaveBeenCalled();
  });
});
```
[View on GitHub](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L129-L147)

**Authentication Testing:**
```tsx
// From Checkout.test.tsx:111-127
test('displays auth error when unauthenticated', async () => {
  (useAuth as jest.Mock).mockReturnValueOnce({
    user: null,
    userData: null,
    loading: false,
  });
  
  // ...existing code...
  
  await waitFor(() => {
    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });
});
```
[View on GitHub](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L111-L127)

**Redux State Testing:**
```tsx
// From Cart.test.tsx:56-73
test('adds product to Redux store', () => {
  store.dispatch(
    addToCart({
      id: '1', 
      title: 'Test Product',
      price: 10,
      image: 'test.jpg'
    })
  );
  
  // ...existing code...
  
  expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
});
```
[View on GitHub](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx#L56-L73)

---

## 4. Testing and CI/CD Integration (3 min)

**Local Testing:**
```bash
npm test                 # Run all tests
npm test -- --watch      # Run tests in watch mode
npm test -- Checkout     # Run specific test file
```
[package.json:12](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/package.json#L12)

**CI/CD Integration:**
- **GitHub Actions:** See [.github/workflows/main.yml (1-54)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml#L1-L54)
- **Test Job:** [.github/workflows/main.yml (12-25)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml#L12-L25) - Runs all Jest tests
- **Deployment Protection:** [.github/workflows/main.yml (29)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml#L29) - `needs: test` ensures tests pass
- **Environment Variables:** [.github/workflows/main.yml (46-51)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml#L46-L51) - Uses VERCEL_TOKEN

**Key Testing Dependencies:**
- **React Testing Library:** [Home.test.tsx (3)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L3) - Provides DOM testing utilities
- **Jest:** [jest.config.ts](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.config.ts) - Configured for TypeScript and ESM
- **Mock Service Worker:** [Home.test.tsx (22-31)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L22-L31) - `useQuery` mocking

---

## 5. Firestore Security & Testing Challenges (2-3 min)

**Security Implementation:**
- **Authentication:** [useAuth.ts (10-48)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/hooks/useAuth.ts#L10-L48) - Firebase Auth + User data hook
- **Route Protection:** [ProtectedRoute.tsx (10-26)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/components/ProtectedRoute.tsx#L10-L26) and [AdminRoute.tsx (10-27)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/components/AdminRoute.tsx#L10-L27)
- **Component Structure:** [App.tsx (47-55)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/App.tsx#L47-L55) - Protected route implementation

**Testing Challenges Overcome:**
- **Auth State:** [Checkout.test.tsx (11-17)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L11-L17) - Mock implementation
- **Async Testing:** [Home.test.tsx (89-99)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L89-L99) - `waitFor` API for asynchronous assertions
- **Test Isolation:** [Cart.test.tsx (19-22)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx#L19-L22) - Reset state between tests
- **Environment Variables:** [jest.setup.ts (35-46)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.setup.ts#L35-L46) - Mock import.meta.env

---

## 6. Q&A Prep

**Likely Questions:**
- **"How did you handle Firestore security rules in testing?"**
  - Answer: Mock implementation in [__mocks__/firebaseConfig.ts](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/__mocks__/firebaseConfig.ts) and [jest.setup.ts (13-29)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.setup.ts#L13-L29)
  
- **"What was the hardest part of implementing tests?"**
  - Answer: Ensuring test isolation for components that rely on Firebase auth - see [Checkout.test.tsx (13-17)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L13-L17)
  
- **"How does the migration strategy handle data consistency?"**
  - Answer: One-time migration with validation in [productService.ts (144-148)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.ts#L144-L148)