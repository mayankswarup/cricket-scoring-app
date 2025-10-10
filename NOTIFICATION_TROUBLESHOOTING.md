# 🔔 Notification Troubleshooting - iOS

## ⚠️ Important: You Need to Rebuild!

After adding notification configuration to `app.json`, you **MUST rebuild** the native app.

---

## 🚀 Steps to Fix iOS Notifications:

### **Step 1: Stop the Current Server**
Press `Ctrl + C` in terminal

### **Step 2: Clear Cache and Rebuild**
```bash
# Clear Expo cache
npx expo start --clear

# Or if that doesn't work, run:
rm -rf .expo
rm -rf node_modules/.cache
```

### **Step 3: Rebuild Native App**

For iOS, you have 2 options:

#### **Option A: Development Build (EAS)**
```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --profile development --platform ios
```

#### **Option B: Expo Go (Simpler, but limited)**
```bash
# Just restart with cleared cache
npx expo start --clear
```

---

## 📱 Testing on iPhone with Expo Go:

### **Step 1: Make Sure You Have Expo Go**
- Download from App Store if you haven't
- https://apps.apple.com/app/expo-go/id982107779

### **Step 2: Start Development Server**
```bash
npx expo start --clear
```

### **Step 3: Scan QR Code**
- Open **Camera** app on iPhone
- Point at QR code in terminal
- Tap the Expo Go notification
- App should open

### **Step 4: Test Permissions**
1. App opens
2. Tap hamburger menu (☰)
3. Tap "Test Notifications"
4. **You should see permission dialog!**
5. Tap "Allow"
6. Test notifications

---

## 🐛 If Permissions Still Don't Ask:

### **Check 1: Expo Go Permissions**
1. iPhone **Settings**
2. Scroll to **Expo Go**
3. Tap **Notifications**
4. Make sure **Allow Notifications** is ON
5. Close and reopen Expo Go app

### **Check 2: Reset Expo Go Data**
1. Delete Expo Go app completely
2. Reinstall from App Store
3. Try again

### **Check 3: Check Logs**
In Expo terminal, watch for:
```
📱 Current notification status: ...
📱 Requesting notification permissions...
📱 Permission request result: ...
```

If you see "undetermined" → Good! Permission dialog should show
If you see "denied" → You denied it before, need to enable in Settings

---

## ✅ Expected Behavior:

### **First Time:**
1. Open notification test screen
2. iOS shows: "Cricket App Would Like to Send You Notifications"
3. Options: "Don't Allow" / "Allow"
4. Tap "Allow"
5. Screen shows: "✅ Permissions Granted!"

### **After Allowing:**
- Tap any test button
- Notification appears immediately
- Sound plays
- Badge shows on app icon
- Notification shows in notification center

---

## 🔍 Debug Mode:

### **Check Console Logs:**

In your terminal, you should see:
```
📱 Must use physical device for Push Notifications
📱 Current notification status: undetermined
📱 Requesting notification permissions...
📱 Permission request result: granted
✅ Notification permissions granted!
```

If you see:
```
📱 Current notification status: denied
❌ Notification permission denied. Status: denied
```

Then go to iPhone Settings → Expo Go → Notifications → Turn ON

---

## 💡 Pro Tips:

1. **Always test on REAL iPhone** - Simulator doesn't support notifications
2. **Check Expo Go permissions** first in iPhone Settings
3. **Clear cache** when making config changes
4. **Watch console logs** to see what's happening
5. **Restart Expo Go** if it's acting weird

---

## 🎯 Quick Test Steps:

```bash
# 1. Clear and start
npx expo start --clear

# 2. On iPhone:
- Open Expo Go
- Scan QR
- App opens
- Tap ☰ menu
- Tap "Test Notifications"

# 3. Should see permission dialog!
- Tap "Allow"
- Tap any test button
- See notification! 🎉
```

---

## 📞 Still Not Working?

Check these:
1. ✅ Using real iPhone (not simulator)?
2. ✅ Expo Go installed and updated?
3. ✅ Cleared cache with `--clear` flag?
4. ✅ Expo Go has notification permission in iPhone Settings?
5. ✅ Checking console logs for errors?

If all else fails:
```bash
# Nuclear option - rebuild everything
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

---

**Try these steps and let me know what happens!** 🚀📱

