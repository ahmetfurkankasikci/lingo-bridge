---
trigger: always_on
---

# Style and UI/UX Design Guide

## 1. Style and Visual Design

- **Styling Engine:** Use **NativeWind (Tailwind CSS)** for all styling. Avoid using `StyleSheet.create` unless absolutely necessary for dynamic values that cannot be handled by Tailwind.
- **Iconography:** Use **Lucide React Native** for consistent and scalable vector icons. Ensure icons have appropriate touch targets (minimum 44x44 pixels).
- **Image Optimization:** Always use **expo-image** for better performance, skeleton loading, and efficient caching. Avoid the standard `Image` component.
- **Design Tokens:** Centralize colors, spacing, and typography in `src/constants/Colors.ts` or a similar configuration. Use these tokens instead of hardcoded hex codes.
- **Shadows:** Use the modern **boxShadow** property for consistent cross-platform shadows. Avoid legacy `shadowColor`, `shadowOffset`, etc.
- **SVGs:** Use `react-native-svg` and `react-native-svg-transformer` to handle vector illustrations as components.

## 2. UI/UX Design Principles

- **Responsive Design:** - Use **ScrollView** to ensure content is accessible on smaller screens.
  - Use the **useWindowDimensions** hook for responsive layout calculations. Avoid the legacy `Dimensions` API.
- **Feedback & Interactions:**
  - **Haptics:** Implement `expo-haptics` for tactile feedback on primary actions (e.g., button presses, success/error states).
  - **Animations:** Use **Reanimated 3** for fluid transitions. Implement `entering` and `exiting` animations for layout changes.
- **Loading & Error States:**
  - **Skeletons:** Use skeleton screens (content placeholders) during data fetching to reduce perceived latency.
  - **Empty States:** Always provide meaningful illustrations or text for empty lists or search results.
- **Form Experience:**
  - Use **react-hook-form** for performance.
  - Implement real-time validation feedback using **Zod**.
  - Ensure **KeyboardAvoidingView** is used to prevent the keyboard from obscuring input fields.
- **Data Privacy:** Use **SecureStore** for sensitive user data (e.g., tokens) instead of `AsyncStorage`.

## 3. Implementation Rules for Agent

- Always favor **NativeWind** classes over inline styles.
- When generating a list, automatically include a "no results found" (Empty State) condition.
- When creating an input field, automatically wrap the view in a `KeyboardAvoidingView` where appropriate.
- Ensure all images utilize the `contentFit` and `transition` props from `expo-image`.
