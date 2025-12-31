# 🌟 MOODS: Modern Mood Tracking & Social Ecosystem

MOODS is a cutting-edge, cross-platform mobile application built on the **React Native** and **Expo** ecosystem. This repository follows a professional monorepo structure, separating the frontend mobile app from its dedicated Node.js backend.

---

## 🏗️ Project Architecture

### 📂 Repository Structure
```bash
MOODS/
├── 📁 frontend/               # Expo React Native App
│   ├── (app, components, context, etc.)
│   └── package.json
├── 📁 backend/                # Node.js + Express API
│   ├── src/
│   └── package.json
├── 📄 package.json            # Root monorepo scripts
└── 📄 README.md
```

### 🎨 Frontend (Mobile)
*   **Framework**: **React Native (Expo SDK 54)**
*   **Routing**: **Expo Router (File-based)**
*   **API Interceptor**: Axios-based communication with the backend.
*   **Media**: `expo-image-picker` and `expo-video`.

### ⚙️ Backend (API)
*   **Runtime**: **Node.js + TypeScript**
*   **Framework**: **Express.js**
*   **Auth**: **Firebase Admin SDK** for secure token verification.
*   **Storage**: **Cloudinary** for signed, secure media management.

---

## 🚀 Getting Started

### 1. Root Installation
From the project root:
```bash
npm install
npm install -g concurrently  # Optional, for the dev script
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env based on requirements (Firebase Admin & Cloudinary)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Ensure .env has EXPO_PUBLIC_API_URL=http://localhost:5000/api
npx expo start
```

### 🏎️ One-Command Development
If you have `concurrently` installed:
```bash
npm run dev
```

---

## 🛡️ Security
- **Hybrid Architecture**: Business logic is offloaded to the backend.
- **Token Verification**: Every API call is verified using Firebase ID tokens.
- **Signed Uploads**: Cloudinary uploads are signed on the backend to prevent unauthorized storage access.

---
*Updated to Monorepo Structure by Antigravity on 2025-12-30*
