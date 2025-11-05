import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { currentUser } from '@/mocks/users';

export interface FirebaseUserData {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
  lastSeen: Date;
  typing?: { [chatId: string]: boolean };
}

export interface FirebaseMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  createdAt: Timestamp;
  read: boolean;
  readBy: string[];
}

export interface FirebaseChat {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  participants: string[];
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

const [FirebaseProviderInternal, useFirebaseInternal] = createContextHook(() => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<FirebaseUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chats, setChats] = useState<FirebaseChat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: FirebaseMessage[] }>({});
  const [unreadCounts, setUnreadCounts] = useState<{ [chatId: string]: number }>({});

  useEffect(() => {
    console.log('[Firebase] Setting up auth listener');
    
    if (!auth) {
      console.warn('[Firebase] Firebase auth not initialized - invalid credentials');
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('[Firebase] Auth state changed:', user?.uid);
        setFirebaseUser(user);
        
        if (user) {
          await initializeUserData(user);
        } else if (auth) {
          console.log('[Firebase] Signing in anonymously');
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('[Firebase] Auth error:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const initializeUserData = async (user: FirebaseUser) => {
    try {
      if (!db) {
        console.warn('[Firebase] Firestore not initialized');
        return;
      }
      
      console.log('[Firebase] Initializing user data for:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log('[Firebase] Creating new user document');
        const newUserData: FirebaseUserData = {
          id: user.uid,
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatar,
          online: true,
          lastSeen: new Date(),
        };
        
        await setDoc(userRef, {
          ...newUserData,
          lastSeen: serverTimestamp(),
        });
        
        setUserData(newUserData);
      } else {
        console.log('[Firebase] User document exists, updating online status');
        const data = userSnap.data() as FirebaseUserData;
        setUserData(data);
        
        await updateDoc(userRef, {
          online: true,
          lastSeen: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('[Firebase] Error initializing user data:', error);
    }
  };

  const subscribeToMessages = useCallback((chatId: string) => {
    if (!db) return;
    
    console.log('[Firebase] Subscribing to messages for chat:', chatId);
    
    try {
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          console.log('[Firebase] Messages updated for chat:', chatId, 'count:', snapshot.docs.length);
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as FirebaseMessage[];
          
          setMessages(prev => ({
            ...prev,
            [chatId]: messagesData,
          }));

          if (firebaseUser) {
            const unreadCount = messagesData.filter(
              msg => msg.senderId !== firebaseUser.uid && !msg.readBy.includes(firebaseUser.uid)
            ).length;
            
            setUnreadCounts(prev => ({
              ...prev,
              [chatId]: unreadCount,
            }));
          }
        },
        (error) => {
          console.error('[Firebase] Error listening to messages for chat:', chatId, error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('[Firebase] Error subscribing to messages:', error);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser || !userData || !db) return;

    console.log('[Firebase] Setting up chats listener for user:', firebaseUser.uid);
    
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', firebaseUser.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        chatsQuery,
        (snapshot) => {
          console.log('[Firebase] Chats updated, count:', snapshot.docs.length);
          const chatsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as FirebaseChat[];
          
          setChats(chatsData);

          chatsData.forEach(chat => {
            subscribeToMessages(chat.id);
          });
        },
        (error) => {
          console.error('[Firebase] Error listening to chats:', error);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('[Firebase] Error setting up chats listener:', error);
    }
  }, [firebaseUser, userData, subscribeToMessages]);

  const sendMessage = useCallback(async (
    chatId: string,
    content: string,
    type: 'text' | 'image' = 'text',
    imageUrl?: string
  ) => {
    if (!firebaseUser || !userData || !db) {
      console.error('[Firebase] Cannot send message: user not authenticated or Firebase not initialized');
      return;
    }

    try {
      console.log('[Firebase] Sending message to chat:', chatId);
      
      const messageData = {
        chatId,
        senderId: firebaseUser.uid,
        senderName: userData.name,
        senderAvatar: userData.avatar,
        content,
        type,
        imageUrl,
        createdAt: serverTimestamp(),
        read: false,
        readBy: [firebaseUser.uid],
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: type === 'text' ? content : '📷 Image',
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('[Firebase] Message sent successfully');
    } catch (error) {
      console.error('[Firebase] Error sending message:', error);
    }
  }, [firebaseUser, userData]);

  const createChat = useCallback(async (
    participantIds: string[],
    type: 'direct' | 'group',
    name?: string
  ): Promise<string | null> => {
    if (!firebaseUser || !userData || !db) {
      console.error('[Firebase] Cannot create chat: user not authenticated or Firebase not initialized');
      return null;
    }

    try {
      console.log('[Firebase] Creating new chat, type:', type);

    const allParticipants = [firebaseUser.uid, ...participantIds];

    if (type === 'direct' && allParticipants.length === 2) {
      const existingChatsQuery = query(
        collection(db, 'chats'),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', firebaseUser.uid)
      );
      
      const existingChatsSnap = await getDocs(existingChatsQuery);
      const existingChat = existingChatsSnap.docs.find(doc => {
        const data = doc.data();
        return data.participants.length === 2 && 
               data.participants.includes(participantIds[0]);
      });

      if (existingChat) {
        console.log('[Firebase] Direct chat already exists:', existingChat.id);
        return existingChat.id;
      }
    }

    const participantNames: { [key: string]: string } = {};
    const participantAvatars: { [key: string]: string } = {};

    for (const participantId of allParticipants) {
      const userDoc = await getDoc(doc(db, 'users', participantId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as FirebaseUserData;
        participantNames[participantId] = userData.name;
        participantAvatars[participantId] = userData.avatar;
      }
    }

    const otherParticipantId = participantIds[0];
    const chatName = type === 'direct' 
      ? participantNames[otherParticipantId] 
      : name || 'Group Chat';
    const chatAvatar = type === 'direct'
      ? participantAvatars[otherParticipantId]
      : 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400';

    const chatData: Omit<FirebaseChat, 'id'> = {
      type,
      name: chatName,
      avatar: chatAvatar,
      participants: allParticipants,
      participantNames,
      participantAvatars,
      lastMessage: '',
      lastMessageTime: serverTimestamp() as Timestamp,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      createdBy: firebaseUser.uid,
    };

      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      console.log('[Firebase] Chat created successfully:', chatRef.id);
      
      return chatRef.id;
    } catch (error) {
      console.error('[Firebase] Error creating chat:', error);
      return null;
    }
  }, [firebaseUser, userData]);

  const markMessagesAsRead = useCallback(async (chatId: string) => {
    if (!firebaseUser || !db) return;

    try {
      console.log('[Firebase] Marking messages as read for chat:', chatId);
      
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('senderId', '!=', firebaseUser.uid)
      );

      const snapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.readBy.includes(firebaseUser.uid)) {
          batch.update(doc.ref, {
            readBy: [...data.readBy, firebaseUser.uid],
          });
        }
      });

      await batch.commit();
      console.log('[Firebase] Messages marked as read');
    } catch (error) {
      console.error('[Firebase] Error marking messages as read:', error);
    }
  }, [firebaseUser]);

  const setTyping = useCallback(async (chatId: string, isTyping: boolean) => {
    if (!firebaseUser || !db) return;

    try {
      console.log('[Firebase] Setting typing status for chat:', chatId, isTyping);
      
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        [`typing.${chatId}`]: isTyping,
      });
    } catch (error) {
      console.error('[Firebase] Error setting typing status:', error);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser || !db) return;

    const updateOnlineStatus = async (online: boolean) => {
      if (!db) return;
      try {
        console.log('[Firebase] Updating online status:', online);
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          online,
          lastSeen: serverTimestamp(),
        });
      } catch (error) {
        console.error('[Firebase] Error updating online status:', error);
      }
    };

    updateOnlineStatus(true);

    return () => {
      updateOnlineStatus(false);
    };
  }, [firebaseUser]);

  return useMemo(
    () => ({
      firebaseUser,
      userData,
      loading,
      chats,
      messages,
      unreadCounts,
      sendMessage,
      createChat,
      markMessagesAsRead,
      setTyping,
    }),
    [firebaseUser, userData, loading, chats, messages, unreadCounts, sendMessage, createChat, markMessagesAsRead, setTyping]
  );
});

export const FirebaseProvider = FirebaseProviderInternal;

export const useFirebase = () => {
  const context = useFirebaseInternal();
  if (!context) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return context;
};
