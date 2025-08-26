# Nasdaq Explore

React Native app to explore Nasdaq tickers via Polygon.io.

## Features

- Splash screen with auto navigation
- Explore screen with search (debounced), filters (BottomSheet), infinite scroll, pull-to-refresh
- Stock details screen
- Redux Toolkit for state
- Axios with API key interceptor and retry
- i18n (EN/AR) with RTL support
- Light/Dark theme (Paper)
- Shimmer placeholders
- Jest + RTL tests

## Getting Started

1. Prereqs: Node 18+, Java/Android SDK or Xcode, Ruby for CocoaPods (iOS)
2. Install deps:

```bash
npm install
```

3. Environment:
   Create `.env` in project root:

```
API_KEY=PWeBTHiQWglVTdhAenk1CFGD5cY9fcmL
```

4. iOS pods (if needed):

```bash
cd ios && bundle install && bundle exec pod install
```

5. Run

```bash
npm run ios
# or
npm run android
```

## Architecture

- src/services: axios instance and stocks API
- src/store: Redux slices and store
- src/screens: Splash, Explore, Details
- src/components: Reusable UI, BottomSheetFilter
- src/theme: Paper themes
- src/i18n: i18next config + locales

## Testing

```bash
npm test
```

## Credits

- App: Nasdaq Explore
- Developer: Ramy Mehanna
