export type Friend = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  chips: number;
  isFriend: boolean;
  mutualFriends?: number;
  lastActive?: string;
};

export const friends: Friend[] = [
  {
    id: '2',
    name: 'Jordan Lee',
    username: '@jordanlee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    chips: 1890,
    isFriend: true,
    lastActive: '2h ago',
  },
  {
    id: '3',
    name: 'Sam Taylor',
    username: '@samtaylor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    chips: 3120,
    isFriend: true,
    lastActive: '5m ago',
  },
  {
    id: '4',
    name: 'Casey Morgan',
    username: '@caseymorgan',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    chips: 2780,
    isFriend: true,
    lastActive: '1d ago',
  },
  {
    id: '5',
    name: 'Riley Chen',
    username: '@rileychen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    chips: 1560,
    isFriend: true,
    lastActive: '3h ago',
  },
];

export const suggestedFriends: Friend[] = [
  {
    id: '6',
    name: 'Morgan Blake',
    username: '@morganblake',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    chips: 2340,
    isFriend: false,
    mutualFriends: 3,
  },
  {
    id: '7',
    name: 'Taylor Swift',
    username: '@taylorswift',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    chips: 1920,
    isFriend: false,
    mutualFriends: 5,
  },
  {
    id: '8',
    name: 'Jamie Fox',
    username: '@jamiefox',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    chips: 2650,
    isFriend: false,
    mutualFriends: 2,
  },
  {
    id: '9',
    name: 'Alex Rivera',
    username: '@alexrivera',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    chips: 1780,
    isFriend: false,
    mutualFriends: 4,
  },
];
