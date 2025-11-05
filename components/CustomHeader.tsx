import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Bell, Coins } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomHeader() {
  const { user, notifications } = useApp();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user.chips, scaleAnim, user]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
      <View style={styles.leftSection}>
        <Image
          source={{ uri: 'https://drive.google.com/uc?export=view&id=1s1FPeoAumWpiwG337JINLlZG9mTdB8cQ' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.rightSection}>
        <Animated.View style={[styles.chipsContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Coins size={18} color={Colors.gold} />
          <Text style={styles.chipsText}>{user.chips.toLocaleString()}</Text>
        </Animated.View>

        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={Colors.textPrimary} />
          {notifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  chipsText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
