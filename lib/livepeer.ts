import { Livepeer } from 'livepeer';

const livepeer = new Livepeer({
  apiKey: process.env.LIVEPEER_API_KEY!,
});

export interface CreateStreamResponse {
  streamId: string;
  playbackId: string;
  playbackUrl: string;
  ingestUrl: string;
  streamKey: string;
}

export async function createLivepeerStream(name: string): Promise<CreateStreamResponse> {
  try {
    const stream = await livepeer.stream.create({
      name,
      record: true,
      profiles: [
        {
          name: '720p',
          bitrate: 2000000,
          fps: 30,
          width: 1280,
          height: 720,
        },
        {
          name: '480p',
          bitrate: 1000000,
          fps: 30,
          width: 854,
          height: 480,
        },
        {
          name: '360p',
          bitrate: 500000,
          fps: 30,
          width: 640,
          height: 360,
        },
      ],
    });

    if (!stream.stream) {
      throw new Error('Failed to create stream');
    }

    const { id, playbackId, streamKey } = stream.stream;

    // Construct URLs
    const ingestUrl = `rtmp://rtmp.livepeer.com/live`;
    const playbackUrl = `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;

    return {
      streamId: id!,
      playbackId: playbackId!,
      playbackUrl,
      ingestUrl,
      streamKey: streamKey!,
    };
  } catch (error) {
    console.error('Livepeer create stream error:', error);
    throw error;
  }
}

export async function getLivepeerStream(streamId: string) {
  try {
    const stream = await livepeer.stream.get(streamId);
    return stream.stream;
  } catch (error) {
    console.error('Livepeer get stream error:', error);
    throw error;
  }
}

export async function deleteLivepeerStream(streamId: string) {
  try {
    await livepeer.stream.delete(streamId);
    return true;
  } catch (error) {
    console.error('Livepeer delete stream error:', error);
    throw error;
  }
}

export async function checkStreamStatus(streamId: string): Promise<{
  isActive: boolean;
  viewerCount: number;
}> {
  try {
    const stream = await livepeer.stream.get(streamId);
    return {
      isActive: stream.stream?.isActive || false,
      viewerCount: 0, // Livepeer doesn't provide direct viewer count, we track it ourselves
    };
  } catch (error) {
    console.error('Livepeer check status error:', error);
    return { isActive: false, viewerCount: 0 };
  }
}

export default livepeer;

