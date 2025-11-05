export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  imageUrl?: string;
};

export type Chat = {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTyping?: boolean;
  messages: Message[];
};

export const chats: Chat[] = [
  {
    id: 'c1',
    type: 'direct',
    name: 'Jordan Lee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    participants: ['1', '2'],
    lastMessage: 'See you at the course tomorrow!',
    lastMessageTime: '2m ago',
    unreadCount: 2,
    isTyping: false,
    messages: [
      {
        id: 'm1',
        senderId: '2',
        senderName: 'Jordan Lee',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        content: 'Hey! How was your round today?',
        timestamp: '2024-01-15T10:30:00Z',
        type: 'text',
      },
      {
        id: 'm2',
        senderId: '1',
        senderName: 'Alex Morgan',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        content: 'Amazing! Shot a 72, my best score yet!',
        timestamp: '2024-01-15T10:32:00Z',
        type: 'text',
      },
      {
        id: 'm3',
        senderId: '2',
        senderName: 'Jordan Lee',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        content: 'That\'s incredible! We should play together soon.',
        timestamp: '2024-01-15T10:35:00Z',
        type: 'text',
      },
      {
        id: 'm4',
        senderId: '2',
        senderName: 'Jordan Lee',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        content: 'See you at the course tomorrow!',
        timestamp: '2024-01-15T10:38:00Z',
        type: 'text',
      },
    ],
  },
  {
    id: 'c2',
    type: 'direct',
    name: 'Sam Taylor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    participants: ['1', '3'],
    lastMessage: 'Thanks for the tips!',
    lastMessageTime: '1h ago',
    unreadCount: 0,
    isTyping: false,
    messages: [
      {
        id: 'm5',
        senderId: '3',
        senderName: 'Sam Taylor',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        content: 'Can you share your swing technique?',
        timestamp: '2024-01-15T09:00:00Z',
        type: 'text',
      },
      {
        id: 'm6',
        senderId: '1',
        senderName: 'Alex Morgan',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        content: 'Sure! Focus on your grip and follow through.',
        timestamp: '2024-01-15T09:15:00Z',
        type: 'text',
      },
      {
        id: 'm7',
        senderId: '3',
        senderName: 'Sam Taylor',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        content: 'Thanks for the tips!',
        timestamp: '2024-01-15T09:20:00Z',
        type: 'text',
      },
    ],
  },
  {
    id: 'c3',
    type: 'group',
    name: 'Weekend Warriors',
    avatar: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    participants: ['1', '2', '3', '4'],
    lastMessage: 'Casey: Count me in!',
    lastMessageTime: '3h ago',
    unreadCount: 5,
    isTyping: true,
    messages: [
      {
        id: 'm8',
        senderId: '2',
        senderName: 'Jordan Lee',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        content: 'Who\'s up for a round this Saturday?',
        timestamp: '2024-01-15T07:00:00Z',
        type: 'text',
      },
      {
        id: 'm9',
        senderId: '3',
        senderName: 'Sam Taylor',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        content: 'I\'m in! What time?',
        timestamp: '2024-01-15T07:05:00Z',
        type: 'text',
      },
      {
        id: 'm10',
        senderId: '1',
        senderName: 'Alex Morgan',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        content: 'How about 9 AM at Pebble Beach?',
        timestamp: '2024-01-15T07:10:00Z',
        type: 'text',
      },
      {
        id: 'm11',
        senderId: '4',
        senderName: 'Casey Morgan',
        senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        content: 'Count me in!',
        timestamp: '2024-01-15T07:15:00Z',
        type: 'text',
      },
    ],
  },
  {
    id: 'c4',
    type: 'direct',
    name: 'Riley Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    participants: ['1', '5'],
    lastMessage: 'Congrats on the win!',
    lastMessageTime: '1d ago',
    unreadCount: 0,
    isTyping: false,
    messages: [
      {
        id: 'm12',
        senderId: '5',
        senderName: 'Riley Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        content: 'Congrats on the win!',
        timestamp: '2024-01-14T15:00:00Z',
        type: 'text',
      },
    ],
  },
];
