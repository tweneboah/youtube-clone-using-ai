import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance (lazy initialization)
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
  if (typeof window === 'undefined') {
    throw new Error('Pusher client can only be used on the client side');
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }

  return pusherClientInstance;
};

// Event types
export const PUSHER_EVENTS = {
  MESSAGE_NEW: 'message:new',
  VIEWER_JOIN: 'viewer:join',
  VIEWER_LEAVE: 'viewer:leave',
  STREAM_START: 'stream:start',
  STREAM_END: 'stream:end',
  VIEWER_COUNT: 'viewer:count',
} as const;

// Channel name generators
export const getStreamChannelName = (streamId: string) => `live-stream-${streamId}`;
export const getPresenceChannelName = (streamId: string) => `presence-live-stream-${streamId}`;

// Message types
export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
}

export interface ViewerUpdate {
  count: number;
  streamId: string;
}

// Server-side message broadcast
export async function broadcastMessage(streamId: string, message: ChatMessage) {
  await pusherServer.trigger(
    getStreamChannelName(streamId),
    PUSHER_EVENTS.MESSAGE_NEW,
    message
  );
}

export async function broadcastViewerCount(streamId: string, count: number) {
  await pusherServer.trigger(
    getStreamChannelName(streamId),
    PUSHER_EVENTS.VIEWER_COUNT,
    { count, streamId }
  );
}

export async function broadcastStreamStart(streamId: string) {
  await pusherServer.trigger(
    getStreamChannelName(streamId),
    PUSHER_EVENTS.STREAM_START,
    { streamId }
  );
}

export async function broadcastStreamEnd(streamId: string) {
  await pusherServer.trigger(
    getStreamChannelName(streamId),
    PUSHER_EVENTS.STREAM_END,
    { streamId }
  );
}

export default pusherServer;

