# 🏏 Cricket App

A cross-platform mobile cricket application built with React Native and Expo.

## 🚀 Features

- **Live Scores**: Real-time cricket match scores and updates
- **Player Statistics**: Detailed player performance data
- **Team Information**: Comprehensive team and player details
- **Latest News**: Stay updated with cricket news and updates
- **Match Schedules**: Upcoming and completed match information

## 🛠️ Tech Stack

- **Frontend**: React Native with TypeScript
- **Framework**: Expo
- **State Management**: React Context API (planned)
- **Navigation**: React Navigation (planned)
- **API**: RESTful API integration
- **Styling**: StyleSheet with custom design system

## 📱 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cricket-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   
   # For web
   npm run web
   ```

## 📁 Project Structure

```
cricket-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # App constants and configuration
│   └── hooks/              # Custom React hooks
├── assets/                 # Images, fonts, and other assets
├── App.tsx                 # Main app component
└── package.json           # Dependencies and scripts
```

## 🎨 Design System

The app uses a consistent design system with:
- **Colors**: Primary blue, secondary green, and semantic colors
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px base unit system
- **Components**: Reusable button, card, and layout components

## 🔧 Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Write clean, readable code with comments

## 📱 Testing

The app can be tested on:
- **Android**: Physical device or Android Studio emulator
- **iOS**: Physical device or Xcode simulator (macOS only)
- **Web**: Any modern web browser

## 🚀 Deployment

### Android
1. Build the APK: `expo build:android`
2. Upload to Google Play Store

### iOS
1. Build the IPA: `expo build:ios`
2. Upload to Apple App Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy Coding! 🏏**
