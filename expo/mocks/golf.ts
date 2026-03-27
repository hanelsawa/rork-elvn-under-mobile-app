export type GolfCourse = {
  id: string;
  name: string;
  location: string;
  state: string;
  par: number;
  holes: number;
  rating: number;
  image: string;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  course: string;
  date: string;
  chipsEarned: number;
};

export type Scorecard = {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  date: string;
  holes: HoleScore[];
  totalScore: number;
  par: number;
};

export type HoleScore = {
  hole: number;
  par: number;
  score: number;
};

export const golfCourses: GolfCourse[] = [
  {
    id: 'c1',
    name: 'Royal Melbourne Golf Club',
    location: 'Black Rock',
    state: 'VIC',
    par: 72,
    holes: 18,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
  },
  {
    id: 'c2',
    name: 'Kingston Heath Golf Club',
    location: 'Cheltenham',
    state: 'VIC',
    par: 72,
    holes: 18,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800',
  },
  {
    id: 'c3',
    name: 'New South Wales Golf Club',
    location: 'La Perouse',
    state: 'NSW',
    par: 72,
    holes: 18,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
  },
  {
    id: 'c4',
    name: 'Royal Adelaide Golf Club',
    location: 'Seaton',
    state: 'SA',
    par: 71,
    holes: 18,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
  },
  {
    id: 'c5',
    name: 'Barnbougle Dunes',
    location: 'Bridport',
    state: 'TAS',
    par: 71,
    holes: 18,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800',
  },
];

export const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: '3',
    userName: 'Sam Taylor',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    score: 69,
    course: 'Royal Melbourne',
    date: '2024-10-01',
    chipsEarned: 500,
  },
  {
    rank: 2,
    userId: '1',
    userName: 'Alex Morgan',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    score: 72,
    course: 'Kingston Heath',
    date: '2024-09-30',
    chipsEarned: 300,
  },
  {
    rank: 3,
    userId: '2',
    userName: 'Jordan Lee',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    score: 74,
    course: 'NSW Golf Club',
    date: '2024-09-29',
    chipsEarned: 200,
  },
];
