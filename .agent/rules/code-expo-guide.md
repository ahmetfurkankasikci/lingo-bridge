---
trigger: always_on
---

# Expo Best Practices & Development Rules

## 1. Architecture and Navigation

- **Expo Router:** Use file-based `Expo Router` for navigation.
- **Directory Structure:** Organize the project as `app/` (pages), `src/components`, `src/hooks`, `src/store`, `src/services`, and `src/constants`.
- **Grouping:** Use group directories like `(tabs)` and `(auth)` for logical separation.

## 2. Performance Optimization

- **FlashList:** Use the high-performance `@shopify/flash-list` instead of the standard `FlatList`.
- **Hermes:** Always enable the Hermes JavaScript engine (in `app.json` configuration).
- **Image Management:** Use the `expo-image` library for better caching and performance instead of the standard `Image` component.
- **Re-rendering:** Use `React.memo`, `useMemo`, and `useCallback` appropriately to prevent unnecessary renders.

## 3. Data and State Management

- **Server State:** Use **TanStack Query (React Query)** for API requests, caching, and data synchronization.
- **Client State:** Prefer **Zustand** for lightweight and high-performance global state management.
- **Form Management:** Use `react-hook-form` for form handling and `zod` or `yup` for validation.

## 4. Styling

- **NativeWind:** Use `NativeWind` (Tailwind CSS for React Native) for style management to improve readability and development speed.
- **Platform-Based Styling:** Prioritize cross-platform compatible designs instead of relying heavily on `Platform.OS` or platform-specific file extensions.

## 5. TypeScript and Code Quality

- **Strict Mode:** TypeScript is mandatory. Strictly avoid the `any` type; define interfaces and types for everything.
- **Custom Hooks:** Business logic must be separated from UI components and moved into custom hooks.
- **Absolute Paths:** Use aliases like `@/components/Button` defined in `tsconfig.json` to prevent import mess.

## 6. Security and Configuration

- **Environment Variables:** Use `.env` files and `expo-constants` for sensitive data (API keys, etc.).
- **EAS (Expo Application Services):** Use `EAS Build` for build processes and `EAS Update` for over-the-air (OTA) updates.

---

## Summary Checklist

### Starting a New Project

- [ ] Start with `npx create-expo-app`
- [ ] Add path aliases in `tsconfig.json`
- [ ] Create the `src/` folder structure
- [ ] Set up **React Query**
- [ ] Create a `.env` file
- [ ] Configure `eas.json`

### While Coding

- [ ] Use **kebab-case** for file names
- [ ] Keep routes exclusively inside the `app/` directory
- [ ] Place components inside `src/components/`
- [ ] Ensure responsive design using **ScrollView**
- [ ] Use **boxShadow** (avoid legacy shadow properties)
- [ ] Use **useWindowDimensions** (avoid the `Dimensions` API)
- [ ] Use **SecureStore** for sensitive data (avoid `AsyncStorage`)
- [ ] Add animations (using **entering/exiting** props)

### Pre-Deployment

- [ ] Run `npx expo-doctor`
- [ ] Check all environment variables
- [ ] Verify `eas.json` profiles
- [ ] Prepare App Store/Play Store metadata
