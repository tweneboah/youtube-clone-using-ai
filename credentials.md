# Environment Variables Setup

Copy these to your `.env.local` file and replace with your own values.

```env
# 1. MongoDB Connection (Required)
MONGODB_URI=your_mongodb_connection_string

# 2. JWT Secret (Required) - any random string
JWT_SECRET=your_jwt_secret_here

# 3. Cloudinary (Required for video uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# 4. Google OAuth (For Google Sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 5. NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to get these credentials:

### MongoDB
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string from Database > Connect > Connect your application

### Cloudinary
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Find your credentials in the Dashboard

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth Client ID
5. Set authorized redirect URIs to `http://localhost:3000/api/auth/callback/google`
