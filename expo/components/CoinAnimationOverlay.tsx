import { View, StyleSheet } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import CoinAnimation from './CoinAnimation';

export default function CoinAnimationOverlay() {
  const { coinAnimations, removeCoinAnimation } = useApp();

  return (
    <View style={styles.container} pointerEvents="none">
      {coinAnimations.map(animation => (
        <View
          key={animation.id}
          style={[
            styles.animationWrapper,
            {
              left: animation.x - 50,
              top: animation.y - 50,
            },
          ]}
        >
          <CoinAnimation
            amount={animation.amount}
            startX={animation.x}
            startY={animation.y}
            onComplete={() => removeCoinAnimation(animation.id)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  animationWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
});
