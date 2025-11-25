# Hat Yai Flood Rescue

A real-time coordination platform for flood relief in Hat Yai. This application allows victims to pin their location and request specific aid. It uses Google Gemini AI to automatically categorize the urgency of requests based on the text description.

## Features
- Interactive Map with Geolocation
- Form for victims to request help
- AI-powered urgency analysis (Google Gemini)
- Real-time filtering and visualization

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your API Key:
   ```
   API_KEY=your_google_gemini_api_key
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

## Deployment

This project is optimized for Vercel. Ensure you add the `API_KEY` in the Vercel Environment Variables settings.
