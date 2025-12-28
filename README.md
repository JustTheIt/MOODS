# MOODS - Mood Tracking & Social Application

MOODS is a modern mobile application built with React Native and Expo, designed to help users track their daily moods, share reflections, and interact with a community.

## 🚀 Technologies

### Languages
- **TypeScript**: The primary language for logic and UI components, ensuring type safety and code quality.
- **JavaScript**: Used for configuration and build scripts.

### Frontend
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (Managed Workflow).
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (Next.js-style file-based routing).
- **Animations**: `react-native-reanimated` for smooth UI transitions and gesture-based interactions.
- **Icons**: `lucide-react-native` and `@expo/vector-icons`.

### Backend & Database
- **Firebase Platform**:
    - **Cloud Firestore**: NoSQL real-time database used to store user profiles, mood logs, circles, and posts.
    - **Firebase Authentication**: Secure user identity management and role-based access control.
- **Media Hosting**:
    - **Cloudinary**: Cloud-based image and video management for high-performance media delivery.

---

## 🏗️ Core Algorithms & Logic

### 1. Authentication Flow
The application implements a secure authentication flow using Firebase Auth.
- **Logic**: Persistent login state is managed via a React Context (`AuthContext.tsx`). Upon app launch, the authentication state is verified, and the user is routed to either the Auth (Login/Register) or App (Home/Dashboard) flow accordingly.

### 2. Mood Capture & History Algorithm
- **Logic**: Users can capture their mood daily. The data is stored with a timestamp and associated metadata (e.g., mood level, note).
- **Analysis**: The application uses a "Balance Meter" logic to aggregate mood data over time, providing users with insights into their emotional trends.

### 3. Media Upload Strategy
Optimized media handling to ensure a smooth user experience.
- **Algorithm**: Instead of sending large binary files directly to the primary database, the application utilizes a dedicated `cloudinaryService.ts`.
- **Workflow**:
    1. Select media via `expo-image-picker`.
    2. Upload to Cloudinary using an unsigned upload preset.
    3. Save the returned secure URL and metadata to Firestore.

### 4. File-Based Routing
- **Mechanism**: Leveraging `expo-router`'s algorithm to automatically generate navigation paths based on the directory structure within the `app/` folder. This simplifies deep linking and nested navigation management.

---

## 📁 Project Structure

- `app/`: Route-based screens and layouts.
- `components/`: Reusable UI components (buttons, cards, charts).
- `services/`: API and third-party service integrations (Firebase, Cloudinary).
- `context/`: Application-wide state management (Auth, Mood).
- `assets/`: Static image and font resources.

---

## 🛠️ Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Project**:
   ```bash
   npx expo start
   ```

3. **Deploying**:
   The project is configured for deployment via Expo EAS or as a web application via `react-native-web`.

---

Generated on: 2025-12-28
