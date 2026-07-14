# SurgeSkill Codebase Map

## Purpose
Navigation map for humans and AI coding agents. Read this before modifying an unfamiliar subsystem.

## Repository Root
```text
SurgeSkill-main/
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── package.json
├── vercel.json
├── vite.config.ts
├── scripts/
│   └── clearOldData.mjs
└── src/
    ├── App.tsx
    ├── firebase.ts
    ├── main.tsx
    ├── types.ts
    ├── components/
    │   ├── Auth/
    │   ├── Common/
    │   ├── Layout/
    │   └── Onboarding/
    ├── context/
    │   └── AppContext.tsx
    ├── pages/
    │   ├── Calendar/
    │   ├── Community/
    │   ├── Dashboard/
    │   ├── Events/
    │   ├── Explore/
    │   ├── LoginRegistration/
    │   ├── Manage/
    │   └── Profile/
    ├── styles/
    └── utils/
```

## Entry and Composition
- `src/main.tsx`: browser/application entry.
- `src/App.tsx`: top-level application composition and routing.
- `src/context/AppContext.tsx`: current global state, data subscriptions, authentication, mutations, UI state, and fallback logic.
- `src/firebase.ts`: Firebase initialization/configuration.
- `src/types.ts`: shared application/domain types.

## UI Areas
- `src/components/Auth/`: authentication-related components.
- `src/components/Common/`: shared reusable UI.
- `src/components/Layout/`: application shell/layout.
- `src/components/Onboarding/`: onboarding flow.
- `src/pages/Dashboard/`: student/admin dashboard surfaces.
- `src/pages/Community/`: communities and real-time community chat.
- `src/pages/Events/`: event views and interactions.
- `src/pages/Calendar/`: calendar presentation.
- `src/pages/Explore/`: discovery/exploration.
- `src/pages/LoginRegistration/`: login and registration.
- `src/pages/Manage/`: management/admin surfaces.
- `src/pages/Profile/`: profile/settings surfaces.

## Current Dependency Direction
```text
Pages / Components
        ↓
   AppContext
        ↓
 Firebase / Firestore
        ↘
      localStorage fallback
```

## Current Data Domains Observed
- users
- events
- hackathons
- courses
- communities
- activities
- community message subcollections

## High-Risk Change Zones
### AppContext
Changes can affect unrelated domains because authentication, data access, feature mutations, subscriptions, and UI state are centralized.

### Firestore Rules
Changes affect the actual security boundary. UI filtering is not authorization.

### Authentication and Admin Routing
Current admin credential logic is client-side and must not be extended.

### Community and Message Data
Future work must preserve real-time behavior while adding college/community authorization and object-storage media.

## Target Modular Direction
```text
src/
├── features/
│   ├── auth/
│   ├── users/
│   ├── colleges/
│   ├── communities/
│   ├── chat/
│   ├── posts/
│   ├── events/
│   ├── calendar/
│   ├── friends/
│   ├── messages/
│   └── notifications/
├── services/
│   └── firebase/
└── context/
    ├── AuthContext.tsx
    └── ThemeContext.tsx
```

## Agent Navigation Rules
1. Read `docs/discovery/CURRENT_STATE.md` before architectural changes.
2. Identify the affected subsystem here.
3. Read only relevant source files plus cross-cutting security/data files.
4. Inspect `firestore.rules` for every data-access change.
5. Do not add new responsibilities to `AppContext.tsx`.
6. Do not implement tenant isolation only in React.
7. Do not introduce new client-side secrets.
8. Preserve working UI unless the task explicitly requires redesign.
9. Update this map when files or subsystem ownership materially change.
