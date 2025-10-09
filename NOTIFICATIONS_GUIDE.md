# 🔔 Local Notifications Guide - Cricket App

## ✅ Implementation Complete!

Local notifications have been successfully implemented in the cricket scoring app.

---

## 📦 What Was Installed

```bash
npm install expo-notifications expo-device expo-constants --legacy-peer-deps
```

**Packages:**
- `expo-notifications` - Core notification functionality
- `expo-device` - Check if it's a real device
- `expo-constants` - Access device constants

---

## 🗂️ Files Created

### 1. **Notification Service** 
`src/services/notificationService.ts`
- Central service for all notification operations
- Request permissions
- Show immediate notifications
- Schedule future notifications
- Cricket-specific helpers

### 2. **Notification Hook**
`src/hooks/useNotifications.ts`
- React hook to easily use notifications in components
- Auto-requests permissions on mount
- Returns helper functions

### 3. **Test Screen**
`src/screens/NotificationTestScreen.tsx`
- Interactive screen to test all notification types
- Shows permission status
- Test buttons for each notification type

---

## 🎯 How to Access

1. Open the app
2. Tap **hamburger menu** (☰) in top-left
3. Find **"🔔 Test Notifications"** option
4. Tap to open test screen

---

## 🔧 Cricket-Specific Notifications

### Available Notification Types:

```typescript
// 1. Wicket
notifyWicket('Virat Kohli', 75, 48);
// Shows: "🏏 Wicket! Virat Kohli is out for 75 (48 balls)"

// 2. Boundary - Four
notifyBoundary('Rohit Sharma', 4);
// Shows: "⚡ FOUR! Rohit Sharma hits a FOUR!"

// 3. Boundary - Six
notifyBoundary('MS Dhoni', 6);
// Shows: "🚀 SIX! MS Dhoni hits a SIX!"

// 4. Over Complete
notifyOverComplete(12, 15, 1);
// Shows: "✅ Over 12 Complete - 15 runs, 1 wicket(s)"

// 5. Milestone - Fifty
notifyMilestone('Virat Kohli', 50);
// Shows: "🎯 Milestone! Virat Kohli reaches 50!"

// 6. Milestone - Century
notifyMilestone('Rohit Sharma', 100);
// Shows: "💯 Milestone! Rohit Sharma reaches 100!"

// 7. Innings Complete
notifyInningsComplete('Mumbai Indians', 189, 5, 20);
// Shows: "🏁 Innings Complete - MI: 189/5 in 20 overs"

// 8. Match Start
notifyMatchStart('Mumbai Indians', 'Chennai Super Kings');
// Shows: "🏏 Match Starting! Mumbai Indians vs Chennai Super Kings"

// 9. Match Result
notifyMatchResult('Mumbai Indians', '23 runs');
// Shows: "🏆 Match Result - Mumbai Indians wins by 23 runs"
```

---

## 💻 How to Use in Your Code

### Option 1: Using the Hook (Recommended)

```typescript
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const { 
    notifyWicket, 
    notifyBoundary,
    permissionGranted 
  } = useNotifications();

  const handleWicket = () => {
    notifyWicket('Player Name', 50, 30);
  };

  return (
    <Button onPress={handleWicket} title="Wicket!" />
  );
}
```

### Option 2: Using Service Directly

```typescript
import { notificationService } from '../services/notificationService';

// Request permissions first
await notificationService.requestPermissions();

// Show notification
await notificationService.notifyWicket('Player Name', 50, 30);
```

---

## 🎮 Testing the Notifications

1. **Test Screen**: Use the built-in test screen
   - Hamburger menu → Test Notifications
   - Tap any button to trigger

2. **Manual Testing**: 
   - Minimize the app after tapping a button
   - Notification appears in notification center
   - Tap notification to open app

3. **Scheduled Testing**:
   - Tap "Schedule Notification (5s)"
   - Close/minimize app
   - Wait 5 seconds
   - Notification appears

---

## 🚀 Next Steps - Integration

### Where to Add Notifications:

#### 1. **Live Scoring Screen**
When a run is scored:
```typescript
// In LiveScoringScreen.tsx
if (runs === 4 || runs === 6) {
  notifyBoundary(currentBatsman, runs);
}
```

When a wicket falls:
```typescript
// In LiveScoringScreen.tsx
notifyWicket(batsmanName, batsmanScore, ballsFaced);
```

When over completes:
```typescript
// In LiveScoringScreen.tsx
if (ballNumber === 6) {
  notifyOverComplete(overNumber, runsInOver, wicketsInOver);
}
```

#### 2. **Match Management**
When match starts:
```typescript
// In MatchManagementScreen.tsx
notifyMatchStart(team1Name, team2Name);
```

When match ends:
```typescript
// In MatchManagementScreen.tsx
notifyMatchResult(winnerName, margin);
```

#### 3. **Milestones**
Check after each ball:
```typescript
// In scoring logic
if (totalRuns === 50 || totalRuns === 100) {
  notifyMilestone(batsmanName, totalRuns);
}
```

---

## 📱 Permissions

- **First time**: App will ask for notification permission
- **Denied**: Show message to enable in settings
- **Granted**: Notifications work immediately

---

## 🐛 Troubleshooting

### Notifications not showing?

1. **Check permissions**: 
   - Go to test screen
   - See if permissions are granted

2. **Physical device required**:
   - iOS Simulator doesn't support notifications
   - Android Emulator supports notifications
   - Real device works best

3. **Check device settings**:
   - Settings → Notifications → Your App
   - Enable notifications

### Still not working?

```typescript
// Check permission status
const granted = await notificationService.requestPermissions();
console.log('Permissions granted:', granted);
```

---

## 🎯 Future Enhancements (Push Notifications)

When ready for push notifications:
1. Setup Expo Push Notification service
2. Store device tokens in Firebase
3. Send from backend/Firebase Functions
4. Notify users even when app is closed

---

## 📚 Documentation

- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Local vs Push Notifications](https://docs.expo.dev/push-notifications/overview/)

---

**Ready to test! Open the app and try it out! 🎉**

