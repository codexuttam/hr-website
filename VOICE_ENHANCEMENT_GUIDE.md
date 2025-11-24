# AI Interview Voice Enhancement Guide

## Overview
The AI Interview system now features significantly improved voice quality with two-tier text-to-speech (TTS) implementation:

1. **Primary**: Google Cloud Text-to-Speech API (Neural2 voices)
2. **Fallback**: Enhanced Browser TTS with optimized voice selection

## Voice Improvements Made

### 1. Enhanced Browser TTS (Always Available)
- **Smart Voice Selection**: Automatically selects the best available voice from your system:
  - Prioritizes Google voices (if available)
  - Falls back to Microsoft Neural voices
  - Selects natural-sounding female voices for professional tone
  - Uses en-US voices for consistency

- **Optimized Speech Parameters**:
  - Rate: 0.95 (slightly slower for clarity)
  - Pitch: 1.05 (professional, friendly tone)
  - Volume: 0.9 (comfortable listening level)

- **Better Error Handling**: Gracefully handles speech synthesis errors

### 2. Google Cloud TTS (Optional - Premium Quality)

For the highest quality, most natural-sounding voice, you can enable Google Cloud Text-to-Speech:

#### Features:
- **Neural2 Voice Model**: State-of-the-art natural voice synthesis
- **Professional Female Voice**: `en-US-Neural2-F`
- **Optimized for Interviews**: Configured for headphone playback
- **High Quality Audio**: MP3 format with optimal settings

#### Setup Instructions:

1. **Create Google Cloud Project**:
   ```bash
   # Go to https://console.cloud.google.com
   # Create a new project or select existing one
   ```

2. **Enable Text-to-Speech API**:
   ```bash
   # In Google Cloud Console:
   # APIs & Services > Enable APIs and Services
   # Search for "Cloud Text-to-Speech API"
   # Click Enable
   ```

3. **Create Service Account**:
   ```bash
   # IAM & Admin > Service Accounts
   # Create Service Account
   # Grant role: "Cloud Text-to-Speech User"
   # Create and download JSON key
   ```

4. **Configure Environment Variables**:
   
   Add to your `.env.local` file:
   ```env
   # Option 1: Using service account key file
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
   
   # Option 2: Using inline credentials (for deployment)
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
   ```

5. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## How It Works

### Voice Selection Flow:
```
1. Interview starts
   ↓
2. Question needs to be spoken
   ↓
3. Try Google Cloud TTS API
   ↓
4. If API available → Use Neural2 voice (premium quality)
   ↓
5. If API unavailable → Use enhanced browser TTS (good quality)
   ↓
6. Play audio to user
```

### Browser TTS Voice Selection:
```
Priority Order:
1. Google voices (en-*)
2. Microsoft Neural voices (en-*)
3. Natural voices (en-*)
4. Female/Professional voices (Samantha, Zira, etc.)
5. Any en-US voice
6. Default system voice
```

## Testing Voice Quality

### Test Browser TTS:
1. Start an interview session
2. Listen to the first question
3. The system will automatically use the best available browser voice

### Test Google Cloud TTS:
1. Configure Google Cloud credentials (see setup above)
2. Start an interview session
3. Check browser console for "Using Google Cloud TTS" message
4. Listen to significantly improved voice quality

### Troubleshooting:

**Voice sounds robotic**:
- Browser TTS is being used
- Consider setting up Google Cloud TTS for better quality
- Try different browsers (Chrome and Edge have better voices)

**No sound at all**:
- Check browser permissions for audio
- Check system volume
- Look for errors in browser console

**Google Cloud TTS not working**:
- Verify API is enabled in Google Cloud Console
- Check environment variables are set correctly
- Verify service account has correct permissions
- Check browser console for specific error messages

## Voice Customization

### Adjust Browser TTS Parameters:
Edit `app/components/interview/InterviewSession.tsx`:

```typescript
// In useBrowserTTS function
utterance.rate = 0.95;  // 0.1 to 10 (speed)
utterance.pitch = 1.05; // 0 to 2 (tone)
utterance.volume = 0.9; // 0 to 1 (loudness)
```

### Adjust Google Cloud TTS:
Edit `app/api/interview/text-to-speech/route.ts`:

```typescript
voice: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-F', // Change voice model
    ssmlGender: 'FEMALE',
},
audioConfig: {
    speakingRate: 0.95, // Adjust speed
    pitch: 0.5,         // Adjust pitch
    volumeGainDb: 0.0,  // Adjust volume
}
```

### Available Google Cloud Voices:
- `en-US-Neural2-A` - Male
- `en-US-Neural2-C` - Female
- `en-US-Neural2-D` - Male
- `en-US-Neural2-E` - Female
- `en-US-Neural2-F` - Female (current default)
- `en-US-Neural2-G` - Female
- `en-US-Neural2-H` - Female
- `en-US-Neural2-I` - Male
- `en-US-Neural2-J` - Male

## Cost Considerations

### Browser TTS:
- **Cost**: FREE
- **Quality**: Good (depends on system voices)
- **Limitations**: Voice quality varies by browser/OS

### Google Cloud TTS:
- **Cost**: Pay-per-use
  - First 1 million characters/month: FREE
  - Neural2 voices: $16 per 1 million characters after free tier
- **Quality**: Excellent (professional-grade)
- **Limitations**: Requires Google Cloud account

### Recommendation:
- **Development**: Use browser TTS (free, sufficient for testing)
- **Production**: Use Google Cloud TTS for best user experience
- **Free tier is generous**: ~200 interviews/month at no cost

## Performance

- **Browser TTS**: Instant (no network delay)
- **Google Cloud TTS**: ~200-500ms latency (includes API call + audio download)
- **Fallback**: Automatic and seamless if API fails

## Next Steps

1. ✅ Test current browser TTS implementation
2. ⚙️ (Optional) Set up Google Cloud TTS for premium quality
3. 🎨 Customize voice parameters to your preference
4. 📊 Monitor usage if using Google Cloud TTS

---

**Note**: The system works perfectly fine with just browser TTS. Google Cloud TTS is optional for those who want the absolute best voice quality.
