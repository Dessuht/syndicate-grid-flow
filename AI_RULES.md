# Lovable AI Editor Rules for Kowloon Syndicate Project

This document outlines the technical stack and guidelines for making modifications to this codebase.

## Tech Stack Overview

1.  **Frontend Framework:** React (using TypeScript).
2.  **Build Tool:** Vite.
3.  **Styling:** Tailwind CSS, utilizing a custom Neon Noir/Cyberpunk theme defined in `src/index.css` and `tailwind.config.ts`.
4.  **State Management:** Zustand (`src/stores/gameStore.ts`) is the single source of truth for game state.
5.  **Routing:** React Router is used for navigation (`src/App.tsx`).
6.  **UI Components:** shadcn/ui components are preferred for standard UI elements.
7.  **Icons:** Lucide React.
8.  **Animations:** Framer Motion is used for complex transitions and layout animations.
9.  **Mapping:** Leaflet is used for interactive map visualizations (`src/components/game/GlobalMap.tsx`).
10. **File Structure:** Components reside in `src/components/` (or subdirectories like `src/components/game/`), and pages are in `src/pages/`.

## Library Usage Guidelines

| Feature Area | Preferred Library/Tool | Notes |
| :--- | :--- | :--- |
| **Game State Logic** | Zustand (`src/stores/gameStore.ts`) | All core game mechanics, resource tracking, and event handling must be implemented here. |
| **UI Components** | shadcn/ui | Use existing components from `src/components/ui/`. Create new, focused components if customization is needed. |
| **Styling** | Tailwind CSS | Use utility classes exclusively. Maintain the existing Neon Noir aesthetic. |
| **Animations** | Framer Motion | Use for smooth transitions, presence management (`AnimatePresence`), and interactive elements. |
| **Icons** | Lucide React | Use for all graphical icons. |
| **Mapping** | Leaflet | Used in `src/components/game/GlobalMap.tsx` for rendering territories. |
| **Forms** | React Hook Form + Zod | Used for complex form validation (if required). |