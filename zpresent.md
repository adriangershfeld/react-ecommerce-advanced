# React E-commerce Advanced: Testing & Firestore Migration

## 1. Project Architecture & Firebase Configuration Management (3-4 min)

**Core Structure:**
```
├── src
│   ├── pages/           # Main UI flows (Home, Cart, Checkout, etc.)
│   ├── components/      # Reusable components (Navigation, Admin panels)
│   ├── services/        # Firestore interactions (productService.ts, orderService.ts)
│   ├── contexts/        # Global state (AuthContext.tsx)
│   ├── hooks/           # Custom hooks (useAuth.ts)
│   ├── __mocks__/       # Test mocks for Firebase and other services
│   └── assets/          # Styling and static assets
├── .github/workflows/   # CI/CD pipeline configuration
└── jest.setup.ts        # Test environment configuration
```

### Firebase Configuration Management:

**Local Development:**
- [firebaseConfig.ts (6-13)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/firebaseConfig.ts#L6-L13) - Environment variables via `import.meta.env`
- Prevents hardcoded secrets in source code:
  ```typescript
  // Configuration stored in .env files, not in Git
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // ...more config values
  };
  ```

**CI/CD Security:**
- [.github/workflows/main.yml (40-52)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml#L40-L52) - Secrets stored in GitHub repository
- Uses `VITE_` prefix for client-exposed variables
- Firebase service account for deployment stored as `FIREBASE_SERVICE_ACCOUNT`
  
**Test Environment:**
- [__mocks__/firebaseConfig.ts](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/__mocks__/firebaseConfig.ts) - Complete Firebase mock for testing
- [jest.setup.ts (13-29)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.setup.ts#L13-L29) - Global mock setup for all tests
- Environment variable mocking:
  ```typescript
  // Mocks environment variables during tests
  Object.defineProperty(import.meta, 'env', {
    get: () => ({
      VITE_FIREBASE_API_KEY: 'test-api-key',
      // other environment variables
    })
  });
  ```

---

## 2. Firestore Migration Strategy (2-3 min)

### One-Time Migration Implementation:

- **Detection Logic:** [Home.tsx (37-45)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.tsx#L37-L45)
  ```typescript
  // If Firestore is empty -> migrate data from API
  useEffect(() => {
    if (products.length === 0 && !error && !isLoading) {
      migrateProductsFromAPI();
    }
  }, [products, error, isLoading]);
  ```

- **Migration Function:** [productService.ts (144-166)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.ts#L144-L166)
  ```typescript
  export const migrateProductsFromAPI = async () => {
    try {
      const existingProducts = await getAllProducts();
      
      // Skip migration if products already exist
      if (existingProducts.length > 0) {
        console.log('Products already exist in Firestore');
        return;
      }
      
      // Fetch from external API
      const response = await fetch('https://fakestoreapi.com/products');
      const products = await response.json();
      
      // Add each product to Firestore with validation
      const batch = writeBatch(db);
      // ...batch write implementation
    } catch (error) {
      console.error('Error migrating products:', error);
    }
  };
  ```

- **Read Operations:** [productService.ts (24-41)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.ts#L24-L41) - Get products from Firestore
- **Write Operations:** [productService.ts (53-71)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.ts#L53-L71) - Add/update product

---

## 3. Test Deep Dive: Home Component (5-6 min)

### Home.test.tsx Complete Breakdown:

**Test Imports & Setup:**
```typescript
// From Home.test.tsx (1-20)
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from '../store';
import Home from './Home';
import * as productService from '../services/productService';
import { useQuery } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Important: Mock entire modules
jest.mock('../services/productService');
jest.mock('@tanstack/react-query');
```
[View complete imports](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L1-L20)

**Query & Firebase Mocking:**
```typescript
// From Home.test.tsx (22-36)
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Mock the React Query hook response
  (useQuery as jest.Mock).mockReturnValue({
    data: [],
    isLoading: false,
    error: null
  });
  
  // Mock the Firebase service calls
  (productService.getAllProducts as jest.Mock).mockResolvedValue([]);
  (productService.migrateProductsFromAPI as jest.Mock).mockResolvedValue();
});
```
[View mock setup](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L22-L36)

**Test Rendering States:**
```typescript
// From Home.test.tsx (38-76)
describe('Home Component', () => {
  test('renders loading state', () => {
    // Override default mock to show loading
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      error: null
    });
    
    render(
      <Provider store={store}>
        <Router>
          <Home />
        </Router>
      </Provider>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  // More rendering state tests...
});
```
[View rendering tests](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L38-L76)

**Testing Migration Logic:**
```typescript
// From Home.test.tsx (129-147)
test('triggers migration when Firestore is empty', async () => {
  // Setup empty Firestore state
  (productService.getAllProducts as jest.Mock).mockResolvedValueOnce([]);
  (useQuery as jest.Mock).mockReturnValue({
    data: [],
    isLoading: false,
    error: null
  });
  
  render(
    <Provider store={store}>
      <Router>
        <Home />
      </Router>
    </Provider>
  );
  
  // Verify migration function was called
  await waitFor(() => {
    expect(productService.migrateProductsFromAPI).toHaveBeenCalled();
  });
});
```
[View migration test](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L129-L147)

**Key Testing Patterns From Home.test.tsx:**
1. **Module Mocking:** Complete isolation of Firebase and API dependencies
2. **State Simulation:** Testing loading, error, and success states
3. **Conditional Logic Testing:** Empty database → migration trigger
4. **Asynchronous Testing:** `waitFor` to handle async operations

---

## 4. Other Critical Tests (4-5 min)

### Authentication Testing in Checkout.test.tsx:

**Auth Mock Setup:**
```typescript
// From Checkout.test.tsx (10-17)
// Mock the useAuth hook
import { useAuth } from '../hooks/useAuth';
jest.mock('../hooks/useAuth');

beforeEach(() => {
  // Clean state between tests
  store.dispatch(clearCart());
  // Default to authenticated user
  (useAuth as jest.Mock).mockReturnValue({
    user: { uid: 'test-user-id' },
    userData: null,
    loading: false,
  });
});
```
[View auth setup](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L10-L17)

**Testing Authentication Scenarios:**
```typescript
// From Checkout.test.tsx (111-127)
test('displays auth error when unauthenticated', async () => {
  // Override to unauthenticated
  (useAuth as jest.Mock).mockReturnValueOnce({
    user: null,
    userData: null,
    loading: false,
  });

  render(
    <Provider store={store}>
      <Router>
        <Checkout />
      </Router>
    </Provider>
  );

  const btn = screen.getByText(/proceed to checkout/i);
  fireEvent.click(btn);

  await waitFor(() => {
    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });
});
```
[View auth test](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L111-L127)

### Redux Integration in Cart.test.tsx:

**Store & Navigation Setup:**
```typescript
// From Cart.test.tsx (19-26)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

beforeEach(() => {
  // Reset Redux store
  store.dispatch(clearCart());
  mockNavigate.mockClear();
});
```
[View navigation & store setup](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx#L19-L26)

**Testing Redux State & Navigation:**
```typescript
// From Cart.test.tsx (56-73)
test('navigates to checkout when "Proceed to Checkout" clicked', () => {
  // Add item to cart
  store.dispatch(
    addToCart({
      id: '1', 
      title: 'Test Product',
      price: 10,
      image: 'test.jpg'
    })
  );

  render(
    <Provider store={store}>
      <Router>
        <Cart />
      </Router>
    </Provider>
  );

  // Click checkout button
  const checkoutBtn = screen.getByText(/proceed to checkout/i);
  fireEvent.click(checkoutBtn);

  // Verify navigation occurred
  expect(mockNavigate).toHaveBeenCalledWith('/checkout');
});
```
[View Redux navigation test](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Cart.test.tsx#L56-L73)

---

## 5. Testing and CI/CD Integration (3-4 min)

**Local Testing Workflow:**
```bash
# Standard testing commands
npm test                 # Run all tests
npm test -- --watch      # Run tests in watch mode
npm test -- Checkout     # Run specific test file
```
[View test scripts](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/package.json#L12-L14)

**Jest Configuration:**
```typescript
// From jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: {
    // Handle module aliases and static imports
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js'
  },
  transform: {
    // ESM & TypeScript transformations
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  // ...additional configuration
};
```
[View Jest config](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.config.ts)

**GitHub Actions CI/CD Pipeline:**
```yaml
# From .github/workflows/main.yml
name: CI/CD Pipeline

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
        env:
          # Environment variables for tests
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # ...other environment variables

  deploy:
    needs: test  # Ensures tests pass before deployment
    runs-on: ubuntu-latest
    steps:
      # ...deployment steps
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```
[View GitHub workflow](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml)

---

## 6. Security Implementation & Testing Challenges (3-4 min)

### Firebase Security Model:

**Client-Side Authentication:**
- **Auth Hook:** [useAuth.ts (10-48)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/hooks/useAuth.ts#L10-L48)
  ```typescript
  // Custom hook to manage authentication state and user data
  export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    
    useEffect(() => {
      // Firebase auth state observer
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        // If user is authenticated, get their data from Firestore
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          // ...get user data code
        }
      });
      
      return unsubscribe; // Clean up observer on unmount
    }, []);
    
    return { user, userData, loading };
  };
  ```

**Route Protection:**
- **Admin Routes:** [AdminRoute.tsx](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/components/AdminRoute.tsx)
  ```typescript
  // Component that redirects non-admin users
  export const AdminRoute = ({ children }: Props) => {
    const { user, userData, loading } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
      // Redirect if not admin after auth state is known
      if (!loading && (!user || userData?.role !== 'admin')) {
        navigate('/login');
      }
    }, [user, userData, loading, navigate]);
    
    // Show loading state or protected content
    return loading ? <p>Loading...</p> : <>{children}</>;
  };
  ```

- **Protected Routes:** [ProtectedRoute.tsx](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/components/ProtectedRoute.tsx)
- **Implementation in App:** [App.tsx (47-55)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/App.tsx#L47-L55)

### Significant Testing Challenges:

**Auth State Simulation:**
- **Challenge:** Firebase Auth normally manages global state outside of React
- **Solution:** [Checkout.test.tsx (11-17)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L11-L17) - Mock auth hook to simulate states

**Asynchronous Firebase Operations:**
- **Challenge:** Firebase operations are asynchronous and may update components after initial render
- **Solution:** [Home.test.tsx (89-99)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L89-L99) - Use `waitFor` to test post-update conditions

**Environment Variables in Tests:**
- **Challenge:** Firebase requires environment variables, but these aren't available in test environments
- **Solution:** [jest.setup.ts (35-46)](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/jest.setup.ts#L35-L46) - Mock `import.meta.env`

---

## 7. Q&A Preparation

**Likely Questions:**

**"How does your testing strategy ensure the Firestore migration works correctly?"**
- Answer: We test migration in isolation using mocks ([productService.test.ts](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/services/productService.test.ts)) and in integration with components ([Home.test.tsx:129-147](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Home.test.tsx#L129-L147))

**"How did you handle testing components that access Firebase authentication?"**
- Answer: We mock the [`useAuth`](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/hooks/useAuth.ts) hook ([Checkout.test.tsx:11-17](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/pages/Checkout.test.tsx#L11-L17)) to simulate authentication states instead of trying to authenticate with Firebase during tests

**"What security measures are in place to protect Firebase API keys?"**
- Answer: Environment variables ([firebaseConfig.ts:6-13](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/src/firebaseConfig.ts#L6-L13)), GitHub Secrets for CI/CD ([main.yml:40-52](https://github.com/adriangershfeld/react-ecommerce-advanced/blob/main/.github/workflows/main.yml#L40-L52)), and Firebase security rules for database access. Client-side API keys have restricted permissions.