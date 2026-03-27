export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  memberSince: string;
  chips: number;
  badges: Badge[];
  stats: UserStats;
};

export type Badge = {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedDate: string;
};

export type UserStats = {
  posts: number;
  followers: number;
  following: number;
  giveawaysWon: number;
  golfRounds: number;
  bestScore: number;
};

export const currentUser: User = {
  id: '1',
  name: 'Alex Morgan',
  username: '@alexmorgan',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  memberSince: '2023-01',
  chips: 2450,
  badges: [
    {
      id: 'b1',
      name: 'Founding Member',
      icon: 'trophy',
      color: '#FFD700',
      earnedDate: '2023-01-15',
    },
    {
      id: 'b2',
      name: 'Top 10 Player',
      icon: 'award',
      color: '#00FF87',
      earnedDate: '2024-03-20',
    },
    {
      id: 'b3',
      name: 'Social Butterfly',
      icon: 'users',
      color: '#C0C0C0',
      earnedDate: '2024-06-10',
    },
  ],
  stats: {
    posts: 127,
    followers: 1543,
    following: 892,
    giveawaysWon: 3,
    golfRounds: 48,
    bestScore: 72,
  },
};

export const users: User[] = [
  currentUser,
  {
    id: '2',
    name: 'Jordan Lee',
    username: '@jordanlee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    memberSince: '2023-02',
    chips: 1890,
    badges: [],
    stats: {
      posts: 89,
      followers: 1120,
      following: 654,
      giveawaysWon: 1,
      golfRounds: 32,
      bestScore: 78,
    },
  },
  {
    id: '3',
    name: 'Sam Taylor',
    username: '@samtaylor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    memberSince: '2023-03',
    chips: 3120,
    badges: [],
    stats: {
      posts: 156,
      followers: 2341,
      following: 1023,
      giveawaysWon: 5,
      golfRounds: 67,
      bestScore: 69,
    },
  },
];
