# Ding Portfolio & Dynamic Content CMS

An interactive, high-performance personal portfolio website for UI/UX Design & Front-End Engineering with an integrated Firebase Firestore Admin Management CMS.

## ✨ Features

- **Personal Portfolio Showcase**:
  - Hero introduction with design philosophy and live project highlights.
  - Interactive Project Works catalog with category filtering (All, UI/UX, Design System, Branding, Mobile).
  - Detailed case study modals with background, design goals, outcomes, and high-fidelity visuals.
  - About me section, design skills, toolchains, and interactive contact form.
- **Visual Admin CMS (Background Management)**:
  - Secure Google Sign-in / Firebase Auth restricted exclusively to admin (`jding8190@gmail.com`).
  - Real-time Firestore database persistence for projects, hero copy, design skills, and profile info.
  - In-place additions, edits, deletions, category tagging, metrics, and image URL updating.
  - Instant live synchronization to the public website without needing code redeployment.
- **Modern Responsive Design**:
  - Clean typographic hierarchy, dark-mode inspired dark accents, glassmorphism, responsive navigation.
  - Lucide icons, smooth transitions, and high-DPI asset support.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

### 3. Production Build
```bash
npm run build
```

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend & Database**: Google Firebase Authentication & Cloud Firestore

## 🔒 Admin Access
To access the background editor:
1. Click the Admin entry / lock icon on the website or navigate to the admin portal.
2. Sign in with the authorized Google Account (`jding8190@gmail.com`).
3. You will immediately have full privileges to add, edit, or delete projects and site copy.
