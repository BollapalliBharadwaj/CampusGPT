# CampusGPT — Full Stack

AI-powered document intelligence. Premium enterprise SaaS UI (Linear/Vercel quality) + full Node.js/MongoDB RAG backend.

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env          # fill in your keys
npm install
node server.js                # runs on :5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                   # runs on :5173
```

## Component Map

| Component | Role |
|-----------|------|
| `Login.jsx` | Split-panel auth screen with animated left side |
| `BackgroundAnimation.jsx` | Animated mesh, grid, geometric shapes, particles |
| `ThemeToggle.jsx` | Dark/light toggle, persists to localStorage |
| `Navbar.jsx` | Sticky top nav, logo, AI status pill, user avatar |
| `Sidebar.jsx` | Collapsible document explorer (240px ↔ 52px) |
| `Stats.jsx` | KPI cards — live counts from API |
| `Upload.jsx` | Drag-drop PDF upload with 4-stage progress |
| `ChatWindow.jsx` | Chat container with quick prompts + clear |
| `ChatMessage.jsx` | Message bubbles + source reference chips |
| `ChatInput.jsx` | Auto-growing textarea, sticky input bar |

## Theme System

CSS custom properties on `:root` (dark) and `[data-theme="light"]`.
Tailwind `dark:` classes used in Login/BackgroundAnimation.
Both systems sync via `App.jsx` on mount.

## Demo Login
- Email: `demo@campus.edu`
- Password: `password123`

## Stack
- **Frontend**: React 19, Vite, Tailwind v4, Framer Motion
- **Backend**: Node.js, Express, MongoDB Atlas, Google Gemini 2.5 Flash
- **RAG**: PDF → chunk → embed → vector search → Gemini answer
