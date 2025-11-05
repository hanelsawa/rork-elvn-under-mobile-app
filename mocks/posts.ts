export type Post = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
};

export const posts: Post[] = [
  {
    id: 'p1',
    userId: '2',
    userName: 'Jordan Lee',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    content: 'Perfect day at Royal Melbourne! Shot my personal best today 🏌️‍♂️⛳',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    likes: 234,
    comments: [
      {
        id: 'c1',
        userId: '1',
        userName: 'Alex Morgan',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        content: 'Congrats! That course is tough!',
        timestamp: '2024-10-02T14:30:00Z',
        likes: 12,
      },
    ],
    timestamp: '2024-10-02T10:15:00Z',
    isLiked: true,
  },
  {
    id: 'p2',
    userId: '3',
    userName: 'Sam Taylor',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    content: 'New clubs just arrived! Can\'t wait to test them out this weekend 🎯',
    image: 'https://images.unsplash.com/photo-1530028828-25e8270e8c4d?w=800',
    likes: 189,
    comments: [
      {
        id: 'c2',
        userId: '2',
        userName: 'Jordan Lee',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        content: 'Those look amazing! What brand?',
        timestamp: '2024-10-01T16:45:00Z',
        likes: 8,
      },
    ],
    timestamp: '2024-10-01T15:20:00Z',
    isLiked: false,
  },
  {
    id: 'p3',
    userId: '1',
    userName: 'Alex Morgan',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    content: 'Sunrise rounds hit different ☀️ Who else is out there early?',
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800',
    likes: 412,
    comments: [],
    timestamp: '2024-09-30T06:30:00Z',
    isLiked: false,
  },
  {
    id: 'p4',
    userId: '2',
    userName: 'Jordan Lee',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    content: 'Finally broke 80! All the practice is paying off 💪',
    likes: 298,
    comments: [
      {
        id: 'c3',
        userId: '3',
        userName: 'Sam Taylor',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        content: 'Legendary! Keep it up!',
        timestamp: '2024-09-29T19:20:00Z',
        likes: 15,
      },
    ],
    timestamp: '2024-09-29T18:45:00Z',
    isLiked: true,
  },
];
