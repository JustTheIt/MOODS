# MOODS - File Structure Documentation

This document categorizes the project files based on their role in the **Frontend** (User Interface) or **Backend** (Data & Services).

## 🎨 Frontend (UI & Presentation)
These files are responsible for rendering the user interface, handling navigation, and managing user interactions.

```bash
🎨 Frontend Structure
├── app/                  # File-based routing (Screens & Layouts)
│   ├── (tabs)/           # Main tab-based navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx     # Home Screen
│   │   └── profile.tsx   # User Profile
│   ├── auth/             # Login & Registration screens
│   └── _layout.tsx       # Root layout & Navigation Provider
├── components/           # Reusable UI Components
│   ├── ui/               # Primary UI elements (Buttons, Inputs)
│   ├── MoodChart.tsx     # Visual data representation
│   └── MoodSelector.tsx  # Interactive picking component
├── assets/               # Static Images, Fonts, and Icons
├── styles/               # Global Themes and Style Constants
└── constants/            # Layout and Color tokens
```

---

## ⚙️ Backend (Services & Data Foundation)
Since this is a serverless project using Firebase, the "backend" consists of the service layer that interacts with cloud providers.

```bash
⚙️ Backend Structure
├── services/             # Core Logic & API Integrations
│   ├── authService.ts    # Firebase Authentication
│   ├── moodService.ts    # Firestore Mood CRUD
│   ├── postService.ts    # Firestore Social CRUD
│   └── cloudinaryService.ts # Media Upload logic
├── context/              # Global State Management (React Context)
│   ├── AuthContext.tsx   # User Session State
│   └── MoodContext.tsx   # App-wide Mood State
├── lib/                  # Library Initializations
│   └── firebase.ts       # Firebase SDK Setup
├── firestore.rules       # Database Security Rules
└── .env                  # Private API Keys & Config
```

---

## 🛠️ Infrastructure & Configuration
Files that manage the project's build, dependencies, and environment.

```bash
🛠️ Config Files
├── package.json          # Dependencies & Scripts
├── app.json              # Expo App Config
├── tsconfig.json         # TypeScript Settings
└── babel.config.js       # Compiler Configuration
```

---

Generated on: 2025-12-28

---

Generated on: 2025-12-28
