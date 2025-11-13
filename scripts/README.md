# Seed Grounds Data to Firestore

This script seeds cricket grounds data into your Firestore database.

## Prerequisites

1. **Firebase Admin SDK Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `cricket-app-7d4b5`
   - Go to **Project Settings** (gear icon)
   - Click on **Service Accounts** tab
   - Click **Generate New Private Key**
   - Save the downloaded JSON file as `serviceAccountKey.json` in the `scripts` folder

## Steps to Run

1. **Place the service account key:**
   ```
   scripts/
   ├── serviceAccountKey.json  ← Place your Firebase service account key here
   └── seedGrounds.mjs
   ```

2. **Run the seed script:**
   ```bash
   node scripts/seedGrounds.mjs
   ```

3. **Verify in Firebase Console:**
   - Go to Firestore Database
   - Check the `grounds` collection
   - You should see 225 documents with cricket grounds data

## What the Script Does

- Seeds 225 cricket grounds from Bengaluru
- Includes:
  - Name (e.g., "Spartan Sports Arena", "Cowel Sports Arena")
  - Area (e.g., "Sarjapur Road", "Kaikondrahalli")
  - Type (paid/free/mixed)
  - Coordinates (lat/lng)
  - City (Bengaluru)
  - Active status

## Troubleshooting

**Error: Cannot find package 'firebase-admin'**
- Run: `npm install firebase-admin --save-dev --legacy-peer-deps`

**Error: Cannot find module './serviceAccountKey.json'**
- Make sure you've downloaded the service account key from Firebase Console
- Place it in the `scripts` folder with the exact name `serviceAccountKey.json`

**Error: Permission denied**
- Make sure your service account has Firestore write permissions
- Check Firebase Console → IAM & Admin → Service Accounts

## Security Note

⚠️ **IMPORTANT:** Never commit `serviceAccountKey.json` to Git!
- ✅ Already added to `.gitignore` - **Safe to push to GitHub**
- The file will **NOT** be on GitHub (it's ignored)
- After cloning the repo, you need to:
  1. Download the service account key from Firebase Console
  2. Place it in `scripts/serviceAccountKey.json`
  3. Then run the seed script locally
- Keep it secure and private - never share this file

