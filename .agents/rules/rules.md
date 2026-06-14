---
trigger: always_on
---

You are an expert in TypeScript, React Native, Expo, and Mobile App Development.
  
  Code Style and Structure:
  - Write concise, type-safe TypeScript code.
  - Use functional components and hooks over class components.
  - Ensure components are modular, reusable, and maintainable.
  - Organize files by feature, grouping related components, hooks, and styles.
  
  Naming Conventions:
  - Use camelCase for variable and function names (e.g., `isFetchingData`, `handleUserInput`).
  - Use PascalCase for component names (e.g., `UserProfile`, `ChatScreen`).
  - Directory names should be lowercase and hyphenated (e.g., `user-profile`, `chat-screen`).
  
  TypeScript Usage:
  - Use TypeScript for all components, favoring interfaces for props and state.
  - Enable strict typing in `tsconfig.json`.
  - Avoid using `any`; strive for precise types.
  - Utilize `React.FC` for defining functional components with props.
  
  Performance Optimization:
  - Minimize `useEffect`, `useState`, and heavy computations inside render methods.
  - Use `React.memo()` for components with static props to prevent unnecessary re-renders.
  - Optimize FlatLists with props like `removeClippedSubviews`, `maxToRenderPerBatch`, and `windowSize`.
  - Use `getItemLayout` for FlatLists when items have a consistent size to improve performance.
  - Avoid anonymous functions in `renderItem` or event handlers to prevent re-renders.
  
  UI and Styling:
  - Use consistent styling, either through `StyleSheet.create()`.
  - Ensure responsive design by considering different screen sizes and orientations.
  - Optimize image handling using libraries designed for React Native, like `react-native-fast-image`.
  
  Best Practices:
  - Follow React Native's threading model to ensure smooth UI performance.
  - Utilize Expo's EAS Build and Updates for continuous deployment and Over-The-Air (OTA) updates.
  - Use React Navigation for handling navigation and deep linking with best practices.

  Code formatting and refactoring:
  - **Strict Style Separation:** NEVER keep `StyleSheet.create` or large style objects in the main component file. Always extract styles into a separate, dedicated file next to the component (e.g., `[ComponentName].styles.ts` or   -   `styles.js`) and import them.

  - **No Inline Helper Components:** If a page file contains secondary, non-exported helper components that have their own `return` statement (e.g., `const Header = () => <View>...</View>`), you must move them out of the page file and into their own separate component files. A page file should ideally contain only ONE main component.

  - **Strict Line Limit (Max 100-150 Lines):** Actively monitor the line count of files. If a page or component file exceeds 100-150 lines, you must proactively identify logical chunks within the main `return` block and extract them into smaller, isolated components.

  - **Promote to Reusable (DRY Principle):** Track component usage. If a small, localized component is needed in two or more different pages/screens, you must automatically move it out of the local folder and into a global, shared `components/` directory, and update all relative imports.

  - **Folder-per-Component Encapsulation (Strictly No Flat Files):**
   NEVER place component files and their corresponding style files flat inside a shared directory (like a generic `components/` or `screens/` folder). Every standalone component must live inside its own self-contained directory.
   
   * **Allowed Directory Structure:**
     ```text
     components/
       └── [ComponentName]/
            ├── [ComponentName].tsx        # UI & Component Logic
            └── [ComponentName].styles.ts # Component-specific StyleSheet
     ```
   * **Rule for Moving Styles:** When extracting styles from a file, create the new `.styles.ts` file *inside* that component's dedicated folder, never next to it in a parent folder.

  - **Clean and Explicit Imports:**
   When referencing these encapsulated components, use explicit paths to avoid resolution confusion. 
   * **Example:** `import { Dish } from '@/components/Dish/Dish';` (or relative path: `import Dish from '../components/Dish/Dish';`).
   * Do not create generic `index.ts` files inside the component folder unless explicitly asked, to prevent multiple tabs named "index.tsx" from cluttering the editor layout.

  - **Thin Routing Layer (Strict App Directory Isolation):**
   The `app/` directory must ONLY contain route definitions and layouts. NEVER place styles (`*.styles.ts`), sub-components, or heavy business logic directly inside the `app/` folder.
   
   * **The Architecture:** - Files inside `app/` should be "thin wrappers" (max 15 lines of code) that simply import and return a Screen component from the screen directory.
     - Actual screen implementations must live in `src/screens/[ScreenName]/`.

  - **Screen Directory Structure:**
   Every screen must follow the same encapsulation rule as components:
   ```text
   src/
     └── screens/
          └── [ScreenName]/
               ├── [ScreenName]Screen.tsx        # UI & Logic
               └── [ScreenName]Screen.styles.ts # Styles

  - The same file structure for db folder if possible

## 🧪 Automated Testing Strategy (Definition of Done)

  - **Mandatory Test Generation:**
   No component, screen, or custom hook is considered complete until it has accompanying automated tests. Whenever you create or modify code, you must automatically generate the corresponding test file.

  - **Unit & UI/Component Testing (Co-location):**
    Place unit and UI tests directly inside the folder of the component or screen they are testing. Use **Jest** and **React Native Testing Library**.
    * **File Naming:** `[Name].test.tsx` or `[Name].spec.tsx`
    * **Folder Structure Example:**
      ```text
      components/
        └── Dish/
             ├── Dish.tsx
             ├── Dish.styles.ts
             └── Dish.test.tsx      # Tests rendering, props, and user clicks
      ```
    * **What to test:** Ensure components render correctly with different props, empty states, and mock user interactions (presses, inputs).

  - **Integration Testing (Screens & Custom Hooks):**
    For screens and custom hooks that handle data fetching or state flow, write integration tests that mock API calls (using MSW or Jest mocks) and verify the data flow.
    * **File Naming:** For hooks, use `[HookName].test.ts`. For screens, use `[ScreenName]Screen.test.tsx`.

  - **End-to-End (E2E) / User Flow Testing:**
    Critical user journeys (e.g., Authentication flow, Add to Cart, Checkout) must have E2E tests. 
    * **Location:** These do NOT go into component folders. Place them in a centralized root directory: `/e2e/`.
    * **Framework Preference:** Use the project's E2E tool (e.g., Maestro or Detox) to write high-level user flow tests.

  - Include testing for db and methods