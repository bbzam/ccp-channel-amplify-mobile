# CCP Channel Mobile

Mobile application for CCP Channel streaming platform built with Angular and Capacitor.

## Overview

This is the mobile version of the CCP Channel application, designed to work across multiple platforms:
- **Android Mobile** - Phone and tablet interface
- **Android TV** - TV-optimized navigation with remote control support
- **Google TV** - Enhanced TV interface
- **iOS** - iPhone and iPad interface

## Features

- **User Authentication** - Secure login and registration
- **Content Streaming** - High-quality video streaming with Shaka Player
- **Multi-Platform Support** - Optimized for mobile, tablet, and TV interfaces
- **Offline Capabilities** - Download content for offline viewing (planned)
- **User Profiles** - Favorites, continue watching, and account management
- **Payment Integration** - Subscription management

## Tech Stack

- **Frontend**: Angular 19
- **Mobile Framework**: Capacitor 6
- **Backend**: AWS Amplify
- **Authentication**: AWS Cognito
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Video Streaming**: Shaka Player
- **UI Framework**: Vanilla CSS (Mobile-Optimized)
- **Modal System**: Custom Vanilla Implementation

## Getting Started

### Prerequisites

- Node.js 18.19+
- Angular CLI
- Capacitor CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bbzam/ccp-channel-amplify-mobile.git
cd ccp-channel-amplify-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure Amplify backend:
```bash
npx amplify configure
```

4. Start development server:
```bash
npm start
```

### Building for Mobile Platforms

#### Android
```bash
npm run cap:build
npx cap add android
npx cap open android
```

#### iOS
```bash
npm run cap:build
npx cap add ios
npx cap open ios
```

#### Android TV / Google TV
```bash
npm run cap:build
# Configure Android TV in Android Studio
npx cap open android
```

## Mobile Optimizations

### Vanilla CSS Implementation
- **No Angular Material** - Removed for better mobile performance
- **Custom Modal System** - Vanilla dialogs with mobile-first design
- **Touch-Optimized** - Large touch targets and smooth interactions
- **iPhone SE Support** - Emergency close buttons for small screens
- **Responsive Design** - Works seamlessly across all screen sizes

### Authentication Flow
- **Unified Modal System** - Consistent signin/signup/verify experience
- **Form Persistence** - Auto-save functionality prevents data loss
- **Mobile Validation** - Red border indicators instead of text messages
- **Error Handling** - Professional dialog system replacing browser alerts

## Platform-Specific Features

### Mobile (Android/iOS)
- Touch gestures and swipe navigation
- Portrait/landscape orientation support
- Mobile-optimized video player
- Pull-to-refresh functionality

### TV (Android TV/Google TV)
- D-pad navigation support
- Focus-based UI interactions
- Large text and buttons for TV viewing
- Horizontal content scrolling

## Project Structure

```
src/
├── app/
│   ├── auth/                 # Authentication components
│   │   ├── components/       # Signin, Signup, Verify modals
│   │   └── auth.service.ts   # Vanilla auth service
│   ├── core/                 # Core layout components
│   │   ├── header/           # Mobile-optimized header
│   │   └── footer/           # Vanilla footer
│   ├── pages/                # Page components
│   │   ├── home/             # Landing page
│   │   ├── user/             # User dashboard
│   │   ├── subscriber/       # Subscriber dashboard
│   │   └── privacy-policy/   # Privacy policy
│   └── shared/               # Shared components and services
│       ├── components/       # Reusable components
│       ├── dialogs/          # Vanilla modal dialogs
│       └── utils/            # Validators and utilities
├── environments/             # Environment configurations
└── assets/                   # Static assets
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run cap:build` - Build and sync with Capacitor
- `npm run cap:add` - Add platform (android/ios)
- `npm run cap:open` - Open platform in IDE
- `npm run cap:run` - Run on device/emulator

## Backend Integration

This mobile app connects to the same AWS Amplify backend as the web application, sharing:
- User authentication (AWS Cognito)
- Content database (DynamoDB)
- Media storage (S3)
- GraphQL API (AppSync)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on target platforms
5. Submit a pull request

## License

This project is licensed under the MIT-0 License - see the LICENSE file for details.