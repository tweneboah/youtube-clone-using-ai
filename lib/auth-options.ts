import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import User from '@/models/User';
import { verifyPassword } from './auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
        
        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.password) {
          throw new Error('Please use Google to sign in');
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();

          // Check if user exists
          let existingUser = await User.findOne({
            $or: [
              { email: user.email?.toLowerCase() },
              { oauthProvider: 'google', oauthId: account.providerAccountId },
            ],
          });

          if (!existingUser) {
            // Create new user
            const newUser = new User({
              name: user.name,
              email: user.email?.toLowerCase(),
              avatar: user.image,
              oauthProvider: 'google',
              oauthId: account.providerAccountId,
            });
            existingUser = await newUser.save();
          } else if (!existingUser.oauthId) {
            // Link Google account to existing email user
            existingUser.oauthProvider = 'google';
            existingUser.oauthId = account.providerAccountId;
            if (!existingUser.avatar && user.image) {
              existingUser.avatar = user.image;
            }
            await existingUser.save();
          }

          return true;
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      
      if (account?.provider === 'google') {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email?.toLowerCase() });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

