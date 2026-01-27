# Lingo Bridge 🌉

An AI-powered English learning app designed to help Turkish speakers bridge the gap from A2 to B1 proficiency through practical, daily-life vocabulary.

## ✨ Features

### 📚 Dynamic Word Cards

- Add any English word and get AI-generated Turkish translations
- Example sentences are B1-level (10-20 words with conjunctions)
- Target words are **highlighted** in sentences for easy recognition
- Beautiful flip animation to reveal meanings
- Delete words with trash icon

### 🃏 Flashcard Deck

- Stacked card interface with depth animations
- Smooth swipe gestures (Left/Right)
- Haptic feedback on flip and swipe
- Progress tracking with unified header

### 🌉 B1 Bridge

- Transform simple A2 phrases into natural B1 equivalents
- Side-by-side comparison: A2 → B1
- Explanation of what makes the B1 version sound more natural
- Example suggestions for quick testing

### 🔄 Context Refresh

- Manually refresh example sentences with a tap
- Get fresh, varied contexts for the same word
- Prevents rote memorization

### 📝 Practice Mode

- **TR → EN**: See Turkish meaning, type English sentence
- **EN → TR**: See English sentence with highlighted word, type Turkish meaning
- **Gap Fill**: Fill in the blank with the correct word
- Score tracking and mastery level updates
- Haptic feedback for correct/incorrect answers

### 🎯 Mastery Tracking

- Visual mastery level indicator (0-5)
- Track your progress for each word
- Mastery updates based on practice performance

## 🛠️ Tech Stack

| Category   | Technology                 |
| ---------- | -------------------------- |
| Framework  | Expo SDK 54, React Native  |
| Navigation | Expo Router (file-based)   |
| State      | Zustand + MMKV persistence |
| API Calls  | TanStack Query             |
| AI         | Google Gemini 2.5 Flash    |
| Styling    | NativeWind (Tailwind CSS)  |
| Animations | React Native Reanimated    |
| Icons      | Lucide React Native        |

## 📁 Project Structure

```
lingo-bridge/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home - vocabulary list
│   │   ├── bridge.tsx     # B1 Bridge - phrase transformer
│   │   └── practice.tsx   # Practice - quiz modes
│   └── _layout.tsx        # Root layout with providers
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── word-card.tsx       # Flip card logic
│   │   ├── stacked-card.tsx    # Visual stack wrapper
│   │   ├── progress-header.tsx # Unified progress header
│   │   ├── empty-state.tsx     # Unified empty state
│   │   ├── quiz-question.tsx   # Quiz question rendering
│   │   ├── quiz-results.tsx    # Quiz completion summary
│   │   └── add-word-modal.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── use-add-word.ts
│   │   ├── use-transform-to-b1.ts
│   │   └── use-context-refresh.ts
│   ├── services/          # API services
│   │   └── gemini-service.ts
│   ├── store/             # Zustand stores
│   │   └── vocab-store.ts
│   ├── constants/         # App constants
│   │   ├── prompts.ts     # AI prompt templates
│   │   └── config.ts      # Environment config
│   └── types/             # TypeScript types
└── .env                   # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio / Xcode (for native builds)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd lingo-bridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Gemini API key to .env
```

### Environment Variables

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Running the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📱 Usage

1. **Add a Word**: Tap the + button on the home screen
2. **View Cards**: Tap a card to flip and see the example sentence
3. **Refresh Context**: Tap the 🔄 icon to get a new example sentence
4. **Delete Cards**: Tap the 🗑️ icon to remove a word
5. **B1 Bridge**: Go to Bridge tab, type a simple phrase, and transform it
6. **Practice**: Go to Practice tab, select a mode, and test your knowledge

## 🗺️ Roadmap

- [x] Phase 1: Foundation & Architecture
- [x] Phase 2: Dynamic Word Cards
- [x] Phase 3: Context Refresh
- [x] Phase 4: B1 Bridge (A2 → B1 transformation)
- [x] Phase 5: Interactive Practice Mode

## 📄 License

MIT
