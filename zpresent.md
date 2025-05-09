# React E-commerce Advanced: Testing & Firestore Migration

## Firestore Migration Strategy

- **Detection Logic:** [Home.tsx (37-45)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.tsx#L37-L45) - Checks if Firestore is empty and triggers migration 
- **Migration Implementation:** [productService.ts (144-166)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.ts#L144-L166) - Fetches from external API and populates Firestore

## Testing Implementation

### Home Component Tests

- **Test Setup:** [Home.test.tsx (1-36)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L1-L36) - Mocks for Firebase services and React Query
- **Migration Testing:** [Home.test.tsx (129-147)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L129-L147) - Verifies Firestore migration is triggered when empty
- **Loading States:** [Home.test.tsx (38-76)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L38-L76) - Tests UI for loading, error, and success states

### Authentication Testing

- **Authentication Mocking:** [Checkout.test.tsx (10-17)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L10-L17) - Simulates logged-in and logged-out states
- **Auth Error Handling:** [Checkout.test.tsx (111-127)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L111-L127) - Tests UI when user is not authenticated

### Redux Integration Tests

- **Store Setup:** [Cart.test.tsx (19-26)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx#L19-L26) - Configures Redux store and navigation mocks
- **Navigation Testing:** [Cart.test.tsx (56-73)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx#L56-L73) - Validates navigation when checkout is clicked

## CI/CD Integration

- **Local Testing:** [package.json (scripts)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/package.json#L12-L14) - Commands for running tests locally
- **Test Configuration:** [jest.config.ts](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.config.ts) - Jest setup for TypeScript and mock handling
- **CI Pipeline:** [.github/workflows/main.yml](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml) - GitHub Actions that run tests before deployment

## Testing Challenges & Solutions

- **Auth State:** [Checkout.test.tsx (11-17)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L11-L17) - Mocking Firebase Auth global state
- **Asynchronous Testing:** [Home.test.tsx (89-99)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L89-L99) - Using waitFor for async assertions
- **Environment Variables:** [jest.setup.ts (35-46)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.setup.ts#L35-L46) - Mocking import.meta.env