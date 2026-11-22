# DhanushApp - Personal Productivity & Vault Frontend

A modern React application built with **Vite, React, Tailwind CSS, React Router, and Axios**, strictly matching the architecture and user story specifications (US-01 to US-44).

## 🚀 Features

- **Authentication (US-01 to US-04, US-15 to US-18)**
  - Sign up with 10-digit mobile, email, and password validation
  - Secure login with JWT token support & auto-logout inactivity timer
  - Forgot password flow with enumeration defense
  - User profile with avatar picker (JPG/PNG < 2MB), date of birth, sex, and password change
- **Passwords Vault (US-07 to US-10, US-19 to US-21, US-25, US-26)**
  - View passwords with masked dots and show/hide toggle
  - One-click copy with instant confirmation feedback
  - Search by source/username (password itself is never searched)
  - Filter by source and date added with removable chips and Clear all
  - Sort by newest, oldest, source A-Z, Z-A, and recently updated
  - Protected CSV Export with master password verification & formula injection neutralization
  - Batch CSV Import with validation preview (valid/invalid counts and duplicate skipping)
- **Personal Notes (US-11 to US-14, US-22 to US-24, US-27, US-28)**
  - Create, view, edit, and delete notes with confirmation
  - Search by topic or note content
  - Date filtering and multi-criteria sorting
  - CSV Export & Import with preview
- **Gym Routine (US-29 to US-36)**
  - Weekly schedule (Day 1 Monday to Day 7 Sunday)
  - Exercise tracking (reps, weight in kg, category)
- **Diet & Nutrition (US-37 to US-44)**
  - Daily meals tracking and automatic daily totals calculation (calories and protein)
- **Home Dashboard (US-06)**
  - Single-view day snapshot with today's workout, meals, and recent passwords/notes

## 📁 Folder Structure

```
DhanushApp/
├── public/                 # Static assets
├── src/
│   ├── api/                # Axios instance & REST service clients
│   │   ├── axiosClient.js  # JWT interceptors & error handlers
│   │   ├── authApi.js
│   │   ├── vaultApi.js
│   │   ├── notesApi.js
│   │   ├── workoutsApi.js
│   │   └── mealsApi.js
│   ├── assets/             # Images, icons, and SVG assets
│   ├── components/
│   │   ├── auth/           # Login, Signup, Forgot password forms
│   │   ├── common/         # Navbar, ProtectedRoute, Modal, ConfirmDialog, SearchBar, etc.
│   │   ├── dashboard/      # Today's workout & diet widgets, recent widgets
│   │   ├── notes/          # NoteCard, NoteModal, NotesImportModal
│   │   ├── vault/          # VaultCard, VaultModal, VaultExportModal, VaultImportModal
│   ├── context/
│   │   └── AuthContext.jsx # Auth state, user session, auto-logout timer & mock fallback
│   ├── pages/              # Route views (Dashboard, Vault, Notes, Gym, Diet, Profile, Login...)
│   ├── routes/
│   │   └── AppRoutes.jsx   # React Router v7 / v6 route configuration
│   ├── utils/              # Validators, CSV sanitization, date helpers, mock data
│   ├── App.jsx             # Root application component with Providers
│   ├── index.css           # Tailwind CSS directives
│   └── main.jsx            # Application entry point
├── .env                    # Environment variables (VITE_API_URL)
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ How to Run

1. **Navigate to the application folder:**
   ```bash
   cd DhanushApp
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
