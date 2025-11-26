// Type for populated user reference
export interface PopulatedUser {
  _id: { toString: () => string };
  name: string;
  avatar?: string;
  subscribers?: number;
}

// Type for serialized video (for client components)
export interface SerializedVideo {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

// Type for serialized comment
export interface SerializedComment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

// Helper to format populated video documents
export function formatVideo(video: {
  _id: { toString: () => string };
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  createdAt: { toISOString: () => string };
  userId: PopulatedUser | { toString: () => string };
}): SerializedVideo {
  const creator = video.userId as PopulatedUser;
  return {
    _id: video._id.toString(),
    title: video.title,
    thumbnail: video.thumbnail,
    duration: video.duration,
    views: video.views,
    createdAt: video.createdAt.toISOString(),
    userId: {
      _id: creator._id.toString(),
      name: creator.name,
      avatar: creator.avatar,
    },
  };
}

