# Tatsumaki Chat 💬

A modern, real-time chat application built with Next.js and React. Tatsumaki Chat provides a seamless messaging experience with real-time updates, user management, and an intuitive interface.

## ✨ Features

### 🚀 Core Features
- **Real-time Messaging**: Instant message delivery using Server-Sent Events (SSE)
- **Multi-chat Support**: Create and manage multiple chat rooms
- **User Authentication**: Secure token-based authentication system
- **Responsive Design**: Optimized for desktop and mobile devices
- **Unread Message Indicators**: Visual indicators for new messages

### 💬 Chat Management
- **Create Chat Rooms**: Start new conversations with multiple users
- **Edit Chat Details**: Modify chat names and members
- **Delete Chats**: Remove unwanted conversations
- **Search Users**: Find and add users to conversations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.3, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: FontAwesome
- **Real-time**: Server-Sent Events (SSE)
- **Authentication**: Token-based authentication
- **Development**: Turbopack for fast development

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A backend API server running (for authentication and message handling)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/PandaX185/tatsumaki-web.git
   cd tatsumaki-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=your_backend_api_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.