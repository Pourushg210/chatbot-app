# Chatbot Platform

A configurable chatbot platform built with Next.js, React, Redux Toolkit, and Socket.IO for real-time communication.

## Features

- **Real-time WebSocket Communication**: Live messaging with typing indicators
- **Role-based Authentication**: Admin and user roles with different access levels
- **Configurable Chatbot Flows**: Create custom conversation flows
- **Voice Support**: Text-to-speech and speech-to-text capabilities
- **Analytics Dashboard**: Track conversation metrics and performance
- **Dark Mode**: Full dark mode support across the application
- **Export/Import**: Save and load chatbot configurations

## Login Instructions

To access the application, you must log in with one of the following credentials:

- **Admin Login**

  - Username: `admin`
  - Password: `adminpass`
  - Access: Admin dashboard and bot configuration at `/admin`

- **User Login**
  - Username: `user`
  - Password: `userpass`
  - Access: Chat interface at `/chat`

**How to log in:**

1. Start the app and navigate to [http://localhost:3000/auth/login](http://localhost:3000/auth/login).
2. Enter your username and password from above.
3. You will be redirected to the appropriate dashboard based on your role.

If you try to access a protected route without logging in, you will be redirected to the login page.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

And start the WebSocket server (in a separate terminal):

```bash
npm run server
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## WebSocket Testing

Visit `/test-websocket` to test the real-time messaging functionality. The test page includes:

- Connection status indicators
- Real-time message sending and receiving
- Typing indicators
- Message history display

## Voice Features Testing

Visit `/voice-test` to test the advanced voice functionality. The test page includes:

- **Speech Recognition**: Real-time voice input with interim results
- **Text-to-Speech**: Convert text to speech with customizable settings
- **Voice Settings**: Configure language, voice type, pitch, rate, and volume
- **Voice Commands**: Control the system with voice commands
- **Bot/User Voice Differentiation**: Different voice settings for bot and user messages
- **Multi-language Support**: Support for multiple languages and voices

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
