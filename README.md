# YouTube Clone

A full-stack YouTube clone built with Next.js 16, MongoDB, Cloudinary, and NextAuth.js with Google OAuth.

![YouTube Clone](./meta/youtube.webp)

## Features

- 🔐 **Authentication** - Email/password + Google OAuth sign-in
- 📺 **Video Upload** - Upload videos with thumbnails via Cloudinary
- 🎥 **Video Playback** - Stream videos with custom player
- 💬 **Comments** - Add and delete comments on videos
- ❤️ **Likes** - Like/unlike videos
- 📺 **Subscriptions** - Subscribe to channels
- 🔍 **Search** - Search videos by title, description, category
- 🕒 **Watch History** - Track watched videos
- 📚 **Library** - Access your videos, history, and liked videos

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Storage**: Cloudinary (videos & thumbnails)
- **Auth**: NextAuth.js with Google OAuth + Credentials
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- Cloudinary account
- Google Cloud Console project (for OAuth)

### 1. MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 2. Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. From your Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the consent screen if prompted
6. Select **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `http://localhost:3001/api/auth/callback/google` (alternative port)
   - `https://yourdomain.com/api/auth/callback/google` (production)
8. Copy the **Client ID** and **Client Secret**

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/youtube-clone

# NextAuth Secret (Required) - generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# JWT Secret (for backwards compatibility)
JWT_SECRET=your-jwt-secret-here

# Cloudinary Configuration (Required for video uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (Required for Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/
├── (auth)/                  # Auth pages (login, register)
├── (main)/                  # Main app pages with sidebar
│   ├── page.tsx            # Home page
│   ├── watch/[id]/         # Video watch page
│   ├── upload/             # Video upload page
│   ├── channel/[id]/       # Channel page
│   ├── search/             # Search page
│   ├── history/            # Watch history
│   ├── liked/              # Liked videos
│   ├── subscriptions/      # Subscription feed
│   ├── trending/           # Trending videos
│   └── library/            # User library
├── api/
│   ├── auth/               # Auth endpoints (NextAuth)
│   ├── videos/             # Video CRUD & actions
│   ├── comments/           # Comment endpoints
│   ├── users/              # User/subscription endpoints
│   ├── upload/             # File upload endpoint
│   ├── search/             # Search endpoint
│   └── history/            # History endpoint

components/
├── AuthProvider.tsx        # NextAuth session provider
├── Sidebar.tsx             # Navigation sidebar
├── Topbar.tsx              # Top navigation bar
├── VideoCard.tsx           # Video thumbnail card
├── VideoGrid.tsx           # Grid of video cards
└── SearchBar.tsx           # Search input component

lib/
├── mongodb.ts              # MongoDB connection
├── cloudinary.ts           # Cloudinary config
├── auth.ts                 # Auth utilities
├── auth-options.ts         # NextAuth configuration
├── types.ts                # TypeScript types
└── utils.ts                # Helper functions

models/
├── User.ts                 # User model
├── Video.ts                # Video model
├── Comment.ts              # Comment model
├── Like.ts                 # Like model
├── History.ts              # Watch history model
└── View.ts                 # View tracking model
```

## API Endpoints

### Authentication (NextAuth)
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/register` - Register new user (email/password)

### Videos
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Create video
- `GET /api/videos/[id]` - Get single video
- `PATCH /api/videos/[id]` - Update video
- `DELETE /api/videos/[id]` - Delete video
- `POST /api/videos/[id]/view` - Record view
- `POST /api/videos/[id]/like` - Toggle like
- `GET /api/videos/[id]/like` - Get like status
- `GET /api/videos/channel/[userId]` - Get channel videos
- `GET /api/videos/category/[slug]` - Get category videos

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/[videoId]` - Get video comments
- `DELETE /api/comments/delete/[id]` - Delete comment

### Users & Subscriptions
- `POST /api/users/[id]/subscribe` - Subscribe to channel
- `POST /api/users/[id]/unsubscribe` - Unsubscribe
- `GET /api/users/[id]/subscriptions` - Get subscriptions

### Other
- `POST /api/upload` - Upload video/thumbnail
- `GET /api/search?q=query` - Search videos
- `GET /api/history` - Get watch history
- `POST /api/history` - Add to history

## License

MIT
