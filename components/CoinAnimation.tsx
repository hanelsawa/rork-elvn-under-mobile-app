import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Image, Text, View, Dimensions } from 'react-native';
import colors from '@/constants/colors';

interface CoinAnimationProps {
  amount: number;
  onComplete?: () => void;
  startX?: number;
  startY?: number;
}

const { width, height } = Dimensions.get('window');

export default function CoinAnimation({ amount, onComplete, startX = width / 2, startY = height / 2 }: CoinAnimationProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-200)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dropAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.2,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);

    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    const sparkleAnimation = Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(sparkleScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(sparkleOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    const textAnimation = Animated.sequence([
      Animated.delay(200),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    const flyAwayAnimation = Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width - startX - 40,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -startY + 60,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    spinAnimation.start();
    glowAnimation.start();
    dropAnimation.start();
    sparkleAnimation.start();
    textAnimation.start();
    flyAwayAnimation.start(({ finished }) => {
      if (finished && onComplete) {
        onComplete();
      }
    });

    return () => {
      spinAnimation.stop();
      glowAnimation.stop();
    };
  }, [opacity, scale, translateY, translateX, spinValue, textOpacity, glowScale, sparkleOpacity, sparkleScale, onComplete, startX, startY, width]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scaleX = spinValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.4, 1, 0.4, 1],
  });

  const sparkles = [
    { rotation: '0deg', distance: 50 },
    { rotation: '45deg', distance: 50 },
    { rotation: '90deg', distance: 50 },
    { rotation: '135deg', distance: 50 },
    { rotation: '180deg', distance: 50 },
    { rotation: '225deg', distance: 50 },
    { rotation: '270deg', distance: 50 },
    { rotation: '315deg', distance: 50 },
  ];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowScale.interpolate({
              inputRange: [1, 1.3],
              outputRange: [0.3, 0.6],
            }),
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {sparkles.map((sparkle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.sparkle,
            {
              opacity: sparkleOpacity,
              transform: [
                { rotate: sparkle.rotation },
                {
                  translateX: sparkleScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, sparkle.distance],
                  }),
                },
                { scale: sparkleScale },
              ],
            },
          ]}
        >
          <View style={styles.sparkleInner} />
        </Animated.View>
      ))}

      <Animated.View
        style={[
          styles.coinContainer,
          {
            transform: [{ rotateY: spin }, { scaleX }],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/2imazzlxtvuqxy2icngbc' }}
          style={styles.coinImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.amountContainer, { opacity: textOpacity }]}>
        <Text style={styles.amountText}>+{amount} Chips!</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  glowContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  coinContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.goldDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: colors.goldDark,
  },
  coinImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleInner: {
    width: 8,
    height: 8,
    backgroundColor: colors.gold,
    borderRadius: 4,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  amountContainer: {
    position: 'absolute',
    top: -50,
    backgroundColor: 'rgba(11, 30, 45, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  amountText: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: '700' as const,
    textShadowColor: colors.goldDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
