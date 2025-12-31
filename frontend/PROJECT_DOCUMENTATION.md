# Project Overview: MOODS

## Languages
- **Primary:** TypeScript (project uses `.ts` / `.tsx` files and `typescript` in devDependencies)
- **Also used:** JavaScript and JSX/TSX syntax for React components

## Frameworks & Platforms
- **Expo** — app is an Expo-managed project (`expo` dependency, `app.json`, `expo start` scripts).
- **React Native** — mobile UI framework (`react-native` dependency).
- **expo-router** — file-based routing for Expo (App Router style), indicated by `expo-router` and route files under `app/`.
- **React (Web)** — `react-dom` + `react-native-web` present to support web build.

## Key Libraries & Services
- **Navigation:** `@react-navigation/native` + `expo-router` (`Stack` from `expo-router`).
- **State / Context:** custom `context/` (e.g., `AuthContext.tsx`, `MoodContext.tsx`).
- **Firebase:** `firebase` dependency and `firestore.rules` present.
- **HTTP & Helpers:** `axios`, `date-fns`.
- **Images/Media:** `expo-image-picker`, `expo-video`, `expo-splash-screen`, `expo-asset`-related packages.
- **Animations:** `react-native-reanimated` (also included as a Babel plugin).
- **Cloudinary:** `cloudinaryService.ts` (project service present).

## Tooling & Build
- **Bundler:** Metro for native and web (`app.json` indicates `web.bundler: metro`).
- **Babel:** `babel.config.js` using `babel-preset-expo` and `module-resolver` (alias `@` → project root).
- **TypeScript:** `tsconfig.json` extends `expo/tsconfig.base` and uses `jsx: react-native`.
- **Testing:** `react-test-renderer` is installed and there are tests under `components/__tests__/` (no explicit `test` script in `package.json`).

## Project Scripts
See `package.json` scripts:
- `start` — `expo start`
- `android` — `expo start --android`
- `ios` — `expo start --ios`
- `web` — `expo start --web`

## Important Config Files
- [package.json](package.json)
- [tsconfig.json](tsconfig.json)
- [app.json](app.json)
- [babel.config.js](babel.config.js)
- [expo-env.d.ts](expo-env.d.ts)

## Useful Folders (high level)
- `app/` — route components (file-based routing for `expo-router`) and UI entry points
- `components/` — reusable UI components
- `context/` — React contexts (auth, mood)
- `services/` — backend integrations (authService, cloudinaryService, firestore wrappers)
- `lib/`, `hooks/`, `styles/`, `constants/`, `assets/` — helpers, hooks, styling, constants, static assets

## Notes & Recommendations
- The project is an Expo + React Native app written in TypeScript with `expo-router` for routing and web support via `react-native-web`.
- Module alias `@` points to project root (configured in `babel.config.js` and `tsconfig.json` paths).
- To run locally: install dependencies then use the Expo scripts:

```bash
npm install
npm run start
```

- Web: `npm run web` (served via Metro, configured in `app.json`).
- Tests: there are snapshot/test files, but no test-runner script; you may add a `test` script and Jest config if needed.

## Quick file references
- App entry/layout: [app/_layout.tsx](app/_layout.tsx)
- Example context: [context/AuthContext.tsx](context/AuthContext.tsx)
- Services folder: [services](services)

---
Generated from project files: `package.json`, `tsconfig.json`, `app.json`, `babel.config.js`, and project structure.
