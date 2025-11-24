# AI Mock Interview Setup Guide

## Overview
The AI Mock Interview feature provides a realistic interview practice experience using Vapi AI for natural voice conversations and video integration.

## Features
- 🎥 **Dual Video Display**: See both yourself and the AI interviewer
- 🎤 **Voice AI**: Natural conversation powered by Vapi AI
- 📝 **Real-time Transcript**: Track the entire conversation
- ⏱️ **Timed Sessions**: Configurable interview duration (10-30 minutes)
- 🎯 **Customizable**: Set role, experience level, and tech stack
- 📊 **Performance Tracking**: Get feedback on your interview performance

## Setup Instructions

### 1. Get Vapi AI API Key

1. Go to [Vapi AI Dashboard](https://vapi.ai/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new public key
5. Copy the public key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
```

**Important**: This must be a public key (starts with `NEXT_PUBLIC_`) as it's used in the client-side code.

### 3. Video Setup

The AI interviewer video is located at:
```
/public/video/Professional Interview Scene.mp4
```

This video plays when the AI is speaking and pauses when listening.

### 4. Browser Permissions

Users will need to grant:
- **Microphone access**: For voice input to Vapi AI
- **Camera access**: For displaying user video

## Usage

1. Navigate to `/ai-interview`
2. Fill in the interview configuration:
   - **Target Role**: The position you're interviewing for
   - **Experience Level**: Entry, Intermediate, or Senior
   - **Tech Stack**: Technologies you want to be asked about
   - **Duration**: How long the interview should last
3. Click "Start Interview"
4. Grant microphone and camera permissions when prompted
5. The AI will greet you and begin asking questions
6. Speak naturally - Vapi AI will transcribe and respond
7. End the interview at any time or let it complete automatically

## Technical Details

### Components

- **`/app/ai-interview/page.tsx`**: Main interview setup page
- **`/app/components/VapiInterviewInterface.tsx`**: Interview interface with video and Vapi integration

### Vapi Configuration

The assistant is configured with:
- **Model**: GPT-4 for intelligent responses
- **Voice**: OpenAI Alloy (professional voice)
- **System Prompt**: Customized based on role, experience, and tech stack

### Video Behavior

- **AI Video**: Plays during AI speech, pauses when listening
- **User Video**: Continuously displays webcam feed (mirrored)
- **Muted AI Video**: Audio comes from Vapi, not the video file

## Customization

### Change AI Voice

Edit the voice configuration in `VapiInterviewInterface.tsx`:

```typescript
voice: {
  provider: 'openai',
  voiceId: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
}
```

### Modify Interview Prompt

Update the system message in `VapiInterviewInterface.tsx` to change how the AI interviewer behaves.

### Add Different Videos

Replace or add videos in `/public/video/` and update the video source in the component.

## Troubleshooting

### "Could not access webcam"
- Check browser permissions
- Ensure no other application is using the camera
- Try a different browser

### "Failed to start interview"
- Verify your Vapi API key is correct
- Check that the key is properly set in `.env.local`
- Restart the development server after adding environment variables

### Video not playing
- Ensure the video file exists at `/public/video/Professional Interview Scene.mp4`
- Check browser console for errors
- Try a different video format if needed

### No audio from AI
- Check your system volume
- Verify Vapi API key is valid
- Check browser console for Vapi errors

## Best Practices

1. **Quiet Environment**: Find a quiet space for best speech recognition
2. **Good Lighting**: Ensure your face is well-lit for video
3. **Stable Connection**: Use a reliable internet connection
4. **Clear Speech**: Speak clearly and at a moderate pace
5. **Headphones**: Use headphones to prevent echo

## Future Enhancements

Potential features to add:
- [ ] Recording and playback of interviews
- [ ] Detailed performance analytics
- [ ] Multiple AI interviewer personas
- [ ] Question bank customization
- [ ] Integration with resume data
- [ ] Eye contact tracking
- [ ] Sentiment analysis
- [ ] Post-interview report generation

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Vapi AI documentation: https://docs.vapi.ai
3. Ensure all dependencies are installed: `npm install`

## Dependencies

```json
{
  "@vapi-ai/web": "^2.5.0",
  "react": "19.2.0",
  "react-icons": "^5.5.0"
}
```

All dependencies are already included in the project's `package.json`.
