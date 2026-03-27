export type Giveaway = {
  id: string;
  title: string;
  description: string;
  image: string;
  entryCost: number;
  totalEntries: number;
  endDate: string;
  status: 'active' | 'upcoming' | 'ended';
  prize: string;
  winner?: {
    userId: string;
    userName: string;
    userAvatar: string;
  };
};

export const giveaways: Giveaway[] = [
  {
    id: 'g1',
    title: 'Premium Golf Club Set',
    description: 'Win a complete set of Titleist T200 irons + TSR3 driver. Valued at $3,500!',
    image: 'https://images.unsplash.com/photo-1530028828-25e8270e8c4d?w=800',
    entryCost: 100,
    totalEntries: 847,
    endDate: '2024-10-15T23:59:59Z',
    status: 'active',
    prize: 'Titleist Club Set',
  },
  {
    id: 'g2',
    title: 'Golf Weekend Getaway',
    description: '2-night stay at a luxury golf resort with unlimited rounds. Includes spa access!',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    entryCost: 150,
    totalEntries: 0,
    endDate: '2024-11-01T23:59:59Z',
    status: 'upcoming',
    prize: 'Resort Package',
  },
  {
    id: 'g3',
    title: 'Smart Golf Watch',
    description: 'Garmin Approach S62 GPS golf watch with course mapping and performance tracking.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    entryCost: 75,
    totalEntries: 0,
    endDate: '2024-11-20T23:59:59Z',
    status: 'upcoming',
    prize: 'Garmin Watch',
  },
  {
    id: 'g4',
    title: 'Premium Golf Bag',
    description: 'Callaway Org 14 cart bag with 14-way top and premium features.',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
    entryCost: 50,
    totalEntries: 1243,
    endDate: '2024-09-30T23:59:59Z',
    status: 'ended',
    prize: 'Callaway Bag',
    winner: {
      userId: '3',
      userName: 'Sam Taylor',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
  },
];
