# Aerobic Workout Logging App

'Aerobic' is a fully cross-platform (iOS, Android, Web) React Native Expo app built for logging aerobic workouts (Zone 2 and Zone 5 / VO2 Max) and viewing history with insights such as personal records and a calendar view.

The app is currently in active development. It is fully usable on the web at [aerobic.vercel.app](https://aerobic.vercel.app/) (not yet available on app stores). All features can be used locally without signing in. Optionally, sign in to sync your workouts to the cloud for multi-device access. Login is passwordless via email OTP.

## What problem does this app solve?

There are countless workout tracking apps, but many are cluttered with features irrelevant to endurance training or rely heavily on automatic smartwatch syncing which can be unreliable or lack context.

'Aerobic' is designed for athletes who prefer **manual logging** to ensure data accuracy (e.g., logging average watts from a gym bike or specific heart rate targets). It focuses specifically on **Zone 2 (Aerobic Efficiency)** and **Zone 5 (Maximum Aerobic Output)** training (inspired by [Peter Attia](https://peterattiamd.com/)), providing specific insights like **Watts/kg** progression over time, which generic trackers often miss.

## Features

- **Focused Logging**: Specialized fields for Duration, Watts, Distance, Heart Rate, Calories, Incline, and Body Weight.
- **Smart Defaults**: The app remembers your last workout settings for specific exercises to speed up logging.
- **Advanced Metrics**: Automatically calculates **Watts/kg**, **Speed (km/h)**, and **Pace (min/km)**.
- **Insights**:
  - **Personal Records**: Track bests for Duration, Watts, and Distance across different timeframes.
  - **Calendar View**: Visual overview of training consistency.
  - **Filtering**: Easily filter history by Zone 2 or Zone 5.
- **Data Ownership**:
  - **Local First**: Works completely offline.
  - **Cloud Sync**: Optional Supabase integration to sync data across devices.
  - **CSV Support**: Full Export and Import functionality.
- **Customization**: Add your own custom exercise types.
- **UI/UX**: Full Dark Mode support and responsive design for Web and Mobile.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend/Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage**: AsyncStorage (Local) & Supabase (Cloud)
- **Deployment**: Vercel (Web)
- **Utilities**: `papaparse` (CSV), `expo-file-system`

## Running Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npx expo start
   ```

## Future Roadmap

- Publish on Apple App Store and Google Play Store after beta testing and necessary reviews
- Detailed charts for visualizing workout history and specific metrics.
- Advanced filters for history screen (duration range, calories range, etc.).
- Swipe actions for quick Edit/Delete in history.
- Data validation warnings for unrealistic inputs.
- Email CSV reports directly from the app.
