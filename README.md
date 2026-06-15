# Food Journal

A React Native mobile application for tracking daily meals through photos, descriptions, and categories. Built with Expo SDK 55 and SQLite for local data persistence.

## Overview

Food Journal lets you photograph your meals, add descriptions, assign categories (Breakfast, Lunch, Dinner, Snack, Drink), and browse your food history in a card-based gallery. User accounts are stored locally — no internet connection required.

The application was originally built with Expo SDK 52 and later repaired, refactored, and enhanced to address identified bugs, deprecated APIs, and missing features. A full technical audit is documented in [REPORT.md](REPORT.md).

## Assignment Objectives

This repository was developed to satisfy the requirements of the **Last Mobile App Development** course assignment. The work demonstrates:

- **Code review** — A systematic audit of the original React Native codebase, examining architecture, component structure, and implementation patterns.
- **Debugging** — Identification and classification of runtime errors, logic issues, database problems, and code quality concerns, with documented root causes and resolutions.
- **Expo SQLite analysis** — Review of the database schema, query execution patterns, CRUD operations, and data persistence strategy, including migration from the transaction-wrapped API to the newer `getAllAsync`/`runAsync` pattern.
- **Enhancement implementation** — Introduction of new features (splash screen, session persistence, logout, camera API migration) and improvements to existing functionality (navigation, state management, UI redesign).
- **Technical documentation** — Production of this README and the detailed [REPORT.md](REPORT.md) for academic submission and public repository publication.

## Features

**Authentication**
- User registration with email, password, and username
- Login with email and password
- Session persistence via AsyncStorage ("Remember Me")
- Logout with session clearing

**Journal Management**
- Capture photos with the in-app camera
- Import images from the device gallery
- Add text descriptions to food photos
- Assign categories to entries
- Edit entries via swipe actions
- Delete entries with confirmation

**Browsing and Filtering**
- Card-based journal gallery with large image previews
- Horizontal scrollable category filter pills
- Swipe-to-edit and swipe-to-delete on journal entries
- Empty state feedback

**User Experience**
- Animated splash screen with loading spinner
- Keyboard-aware forms
- Input validation with descriptive error messages
- Modern warm color theme

## Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.83.6 | Mobile framework |
| React | 19.2.0 | UI library |
| Expo SDK | 55.0.25 | Development platform |
| expo-sqlite | 55.0.16 | Local database |
| expo-camera | 55.0.18 | In-app camera (CameraView) |
| expo-image-picker | 55.0.20 | Gallery access |
| @react-navigation/native-stack | 7.15.1 | Screen navigation |
| @react-native-async-storage/async-storage | 2.2.0 | Session persistence |
| react-native-swipe-list-view | 3.2.9 | Swipeable list items |
| @react-native-picker/picker | 2.11.4 | Category picker |
| react-native-gesture-handler | 2.30.0 | Gesture support |
| react-native-reanimated | 4.2.1 | Animations |

## Installation

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone, or an Android/iOS emulator

### Steps

1. Clone the repository:

```bash
git clone https://github.com/maramhd/Food-Journal.git
cd FoodJournal-New
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npx expo start
```

4. Scan the QR code displayed in the terminal:
   - **Android:** Open Expo Go and scan the QR code
   - **iOS:** Open the Camera app and tap the QR code notification

## Running the Application

| Command | Description |
|---------|-------------|
| `npx expo start` | Start the Expo dev server (shows QR code) |
| `npx expo start --android` | Start on a connected Android device or emulator |
| `npx expo start --ios` | Start on an iOS simulator (macOS only) |
| `npx expo start --web` | Start in a web browser |

To run on a physical device, install Expo Go from the App Store or Google Play, then scan the QR code from the terminal output.

## Database

The application uses **expo-sqlite** for all data storage. There is no remote server or cloud database.

### Tables

**users**

| Column | Type | Constraint |
|--------|------|------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| email | TEXT | UNIQUE |
| password | TEXT | — |
| username | TEXT | — |

**journals**

| Column | Type | Constraint |
|--------|------|------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | — |
| image | TEXT | — |
| description | TEXT | — |
| category | TEXT | — |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### How It Works

- The database opens synchronously when the app starts (`SQLite.openDatabaseSync`).
- Tables are created with `CREATE TABLE IF NOT EXISTS`, so re-running initialization is safe.
- `SELECT` queries use `getAllAsync`, which returns a plain JavaScript array.
- `INSERT`, `UPDATE`, and `DELETE` queries use `runAsync`, which returns `{ changes, lastInsertRowId }`.
- All database operations are wrapped in try/catch blocks with user-facing error alerts.

## Project Structure

```
FoodJournal-New/
├── App.js                             # Root component, navigation, database init
├── index.js                           # Expo entry point, gesture handler import
├── app.json                           # Expo configuration with plugins
├── babel.config.js                    # Babel preset for Expo
├── package.json                       # Dependencies and scripts
├── assets/
│   ├── pic_splash.jpg                 # Splash screen image
│   ├── icon.png                       # App icon
│   ├── adaptive-icon.png              # Android adaptive icon
│   └── favicon.png                    # Web favicon
├── components/
│   ├── auth/
│   │   └── authScreen.js              # Login, registration, session management
│   └── database/
│       └── database.js                # SQLite connection and query execution
└── screens/
    ├── SplashScreen.js                # Animated splash with auto-navigation
    └── homeScreen.js                  # Journal CRUD, camera, gallery, filtering
```

## Application Workflow

### Registration

1. User taps "Create new account" on the Auth screen.
2. Enters username, email, and password.
3. App validates inputs (empty fields, email format, password length, username required).
4. Checks if the email already exists in the database.
5. Inserts the new user with username, saves the session to AsyncStorage, and navigates to Home.

### Login

1. User enters email and password.
2. App normalizes the email (trim + lowercase) and queries the database.
3. If a match is found and "Remember Me" is checked, the userId is saved to AsyncStorage.
4. App navigates to Home using `navigation.replace` (prevents back-button return to login).

### Auto-Login

1. On app start, the Auth screen checks AsyncStorage for a saved `userId`.
2. If found, the user is automatically navigated to Home without re-entering credentials.

### Create Journal Entry

1. User taps the FAB (+) button on the Home screen.
2. A modal opens with options to take a photo, pick from gallery, enter a description, and select a category.
3. User captures or selects an image, fills in the description, and chooses a category.
4. App validates that both image and description are present.
5. A new row is inserted into the `journals` table with the current timestamp.
6. The modal closes and the journal list refreshes.

### Edit Journal Entry

1. User swipes left on a journal card and taps "Edit".
2. The modal opens pre-filled with the entry's image, description, and category.
3. User makes changes and taps "Update Journal".
4. An `UPDATE` query modifies the existing row.
5. The list refreshes with the updated data.

### Delete Journal Entry

1. User swipes left on a journal card and taps "Delete".
2. A confirmation alert asks "Are you sure?".
3. On confirmation, a `DELETE` query removes the row.
4. The list refreshes without the deleted entry.

### Category Filtering

1. The Home screen displays horizontal scrollable pills: All, Breakfast, Lunch, Dinner, Snack, Drink.
2. Tapping a pill filters the journal list to show only entries matching that category.
3. "All" shows every entry regardless of category.
4. The filter state is independent from the journal entry form's category selector.

## Improvements Implemented

The following improvements were introduced during the repair and enhancement process:

- **Bug fixes:** Missing component imports, deprecated API usage, navigation logic errors, database query fragility, and state management conflicts were resolved.
- **Session persistence:** AsyncStorage integration enables auto-login across app restarts.
- **Modern camera API:** Migrated from the deprecated `Camera` component to `CameraView` with hook-based permissions.
- **Simplified database layer:** Synchronous database opening, separate read/write query paths, and plain array results replaced the old transaction-wrapped approach.
- **UI redesign:** Warm food-inspired color theme, card-based journal layout, animated splash screen, horizontal filter pills, and modal-based journal entry form.
- **New features:** Splash screen, logout, username registration, password visibility toggle, FAB button, and extended categories.

See [REPORT.md](REPORT.md) for a complete list of changes with code references.

## Future Improvements

- Backend integration (Firebase, Supabase, or custom API) for cloud sync and multi-device access
- Password hashing (bcrypt or Argon2) for secure credential storage
- Image compression before database storage
- Push notifications for meal logging reminders
- Dark mode support
- Multi-language support (i18n)
- Unit and integration tests with Jest and React Native Testing Library
- EAS Build configuration for production builds
- App Store and Play Store deployment

## Author

**Your Name** — your.email@example.com

## License

This project is available for academic use.
