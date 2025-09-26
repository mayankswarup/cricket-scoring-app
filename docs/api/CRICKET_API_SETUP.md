# Cricket API Integration Setup

This guide will help you set up real-time cricket data integration using CricketAPI.com for the Asia Cup and other cricket tournaments.

## Prerequisites

1. A CricketAPI.com account
2. An API key from RapidAPI

## Step 1: Get Your API Key

1. Go to [CricketAPI.com on RapidAPI](https://rapidapi.com/cricketapi/api/cricketapi)
2. Subscribe to a plan (they offer free trials)
3. Copy your API key from the RapidAPI dashboard

## Step 2: Configure Your App

### Option A: Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
# CricketAPI.com Configuration
EXPO_PUBLIC_CRICKET_API_KEY=your_api_key_here
EXPO_PUBLIC_USE_REAL_DATA=true
```

### Option B: Direct Configuration

Edit `src/config/api.ts` and add your API key directly:

```typescript
export const API_CONFIG = {
  cricketApi: {
    baseUrl: 'https://api.cricketapi.com/v1',
    apiKey: 'your_api_key_here', // Add your key here
    useRealData: true, // Set to true to use real data
  },
};
```

## Step 3: Test the Integration

1. Start your app: `npm start`
2. The app will automatically try to fetch real Asia Cup data
3. If the API fails, it will fall back to mock data
4. Check the console for any error messages

## Available API Methods

The following methods are now available in your `apiService`:

- `getAsiaCupMatches()` - Get all Asia Cup matches
- `getAsiaCupLiveMatches()` - Get only live Asia Cup matches
- `getMatches()` - Get all matches (with Asia Cup filter)
- `getLiveMatches()` - Get all live matches
- `getMatchById(id)` - Get specific match details
- `getTeams()` - Get team information
- `getPlayers()` - Get player information

## Data Flow

1. **Real Data Mode**: App fetches data from CricketAPI.com
2. **Fallback Mode**: If API fails, app uses mock data
3. **Mock Data Mode**: Set `useRealData: false` to always use mock data

## Troubleshooting

### Common Issues

1. **"CricketAPI key not configured"**
   - Make sure you've set the API key in your configuration
   - Check that the environment variable is properly named

2. **"Failed to fetch real matches"**
   - Check your internet connection
   - Verify your API key is valid
   - Check if you've exceeded your API quota

3. **No data showing**
   - The app will fall back to mock data automatically
   - Check the console for error messages
   - Try setting `useRealData: false` to test with mock data

### API Rate Limits

CricketAPI.com has rate limits based on your subscription:
- Free tier: Limited requests per month
- Paid tiers: Higher limits

## Features

✅ Real-time Asia Cup match data  
✅ Live score updates  
✅ Team and player information  
✅ Automatic fallback to mock data  
✅ Error handling and loading states  
✅ TypeScript support  

## Next Steps

1. Test with your API key
2. Customize the data transformation if needed
3. Add more cricket tournaments
4. Implement real-time updates with WebSocket
5. Add push notifications for match updates

## Support

If you encounter issues:
1. Check the [CricketAPI.com documentation](https://rapidapi.com/cricketapi/api/cricketapi)
2. Review the console logs for error messages
3. Test with mock data first to ensure the UI works
