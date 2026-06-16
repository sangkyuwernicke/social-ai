# AI Chat Webapp Setup Guide

## Overview

This project now includes an AI chat webapp that supports both **Claude (Anthropic)** and **Gemini (Google)** AI models. Users can seamlessly switch between APIs through a simple dropdown selector.

## Features

✅ **Dual AI Support**: Choose between Claude and Gemini APIs  
✅ **Real-time Streaming**: Fast response times with loading indicators  
✅ **Conversation History**: Messages persist in the session  
✅ **Clean UI**: Modern, responsive chat interface  
✅ **Vercel Ready**: Fully optimized for Vercel deployment  

## Project Structure

```
social-ai/
├── app/
│   ├── api/chat/route.ts          # API endpoint handling both Claude and Gemini
│   ├── chat/page.tsx              # Chat interface page
│   ├── persona/page.tsx           # Persona Studio page (original app)
│   ├── page.tsx                   # Landing page with app selector
│   └── layout.tsx
├── components/
│   ├── ChatInterface.tsx          # Main chat component
│   └── ChatInterface.module.css   # Chat styling
├── lib/
│   ├── chat-api.ts               # Client API utility
│   └── types.ts                  # TypeScript types
├── .env.example                  # Environment variables template
└── vercel.json                   # Vercel configuration
```

## Environment Setup

### 1. Copy Environment Variables

```bash
cp .env.example .env.local
```

### 2. Add API Keys

Edit `.env.local` and add:

```env
# Claude API (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Gemini API (Google)
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. Get API Keys

**Claude (Anthropic)**:
- Visit [console.anthropic.com](https://console.anthropic.com)
- Create an API key
- Supported models: `claude-opus-4-1`

**Gemini (Google)**:
- Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- Create a new API key
- Supported models: `gemini-pro`

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see:
- **Landing Page**: Shows available apps
- **Chat App**: `/chat` - AI chat interface
- **Persona Studio**: `/persona` - Original social media app

### Build for Production

```bash
npm run build
npm start
```

## API Details

### Chat Endpoint: `POST /api/chat`

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "How are you?" }
  ],
  "model": "claude" // or "gemini"
}
```

**Response**:
```json
{
  "content": "I'm doing well, thank you for asking!",
  "model": "claude",
  "usage": {
    "input_tokens": 42,
    "output_tokens": 15
  }
}
```

## Deployment to Vercel

### 1. Connect Repository

```bash
vercel link
```

### 2. Set Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   - `ANTHROPIC_API_KEY` = your Claude API key
   - `GOOGLE_API_KEY` = your Gemini API key

### 3. Deploy

```bash
vercel deploy --prod
```

Or push to GitHub and enable auto-deployment in Vercel.

## How It Works

### API Selection Flow

```
User selects model (Claude/Gemini)
    ↓
User sends message
    ↓
ChatInterface sends to /api/chat with selected model
    ↓
Route handler calls appropriate API
    ↓
Response displayed in chat with model badge
```

### Claude Request Flow

1. Message sent to Anthropic API (`/v1/messages`)
2. Returns structured JSON response
3. Extracts text from `content[0].text`
4. Displays with "claude" badge

### Gemini Request Flow

1. Message sent to Google's GenerativeAI API
2. Transforms message roles (user → user, assistant → model)
3. Extracts text from `candidates[0].content.parts[0].text`
4. Displays with "gemini" badge

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting

### "API key not configured"
- Check `.env.local` has correct key names
- Restart dev server after adding keys

### "Failed to get response"
- Verify API keys are valid
- Check API rate limits
- Ensure account has available credits

### CORS Errors
- This shouldn't happen as API calls are server-side
- If occurs, verify `/api/chat` route is accessible

### Model Not Responding
- Try the other model to isolate the issue
- Check API console for error messages
- Verify internet connection

## Advanced Configuration

### Change Default Model

Edit `components/ChatInterface.tsx`:
```typescript
const [model, setModel] = useState<"claude" | "gemini">("gemini"); // default to gemini
```

### Adjust Model Parameters

Edit `app/api/chat/route.ts`:

**For Claude**:
```typescript
max_tokens: 2048,  // increase for longer responses
```

**For Gemini**:
```typescript
maxOutputTokens: 2048,
```

### Add System Prompt

Modify the API route to prepend system instructions:
```typescript
const systemPrompt = "You are a helpful assistant.";
messages.unshift({ role: "user", content: systemPrompt });
```

## Performance Tips

1. **Message Pagination**: Limit history sent to API (e.g., last 10 messages)
2. **Debouncing**: Add input debounce to prevent rapid submissions
3. **Caching**: Cache responses for similar queries
4. **Model Selection**: Use Claude for complex reasoning, Gemini for quick answers

## Security Considerations

- ✅ API keys stored server-side in environment variables
- ✅ No keys exposed to client
- ✅ HTTPS enforced in production
- ✅ Input validation on API routes
- ⚠️ Consider rate limiting for production use

## Future Enhancements

- [ ] Message search and filtering
- [ ] Export conversation history
- [ ] Custom system prompts
- [ ] Voice input/output
- [ ] Multi-file upload support
- [ ] Conversation branching
- [ ] Custom model parameters UI

## Support

For issues:
1. Check the Troubleshooting section
2. Review API documentation:
   - [Anthropic Docs](https://docs.anthropic.com)
   - [Google Gemini Docs](https://ai.google.dev/)
3. Check GitHub issues

## License

Same as parent project
