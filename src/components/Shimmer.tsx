import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

interface ShimmerTextProps {
  width?: number | string;
  height?: number;
  style?: any;
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const theme = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );

    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );
};

const ShimmerText: React.FC<ShimmerTextProps> = ({
  width = '100%',
  height = 16,
  style,
}) => {
  return (
    <Shimmer
      width={width}
      height={height}
      borderRadius={height / 2}
      style={style}
    />
  );
};

const ShimmerTitle: React.FC<ShimmerTextProps> = props => {
  return (
    <ShimmerText
      {...props}
      height={20}
      width={props.width || '80%'}
      style={[props.style, { marginBottom: 8 }]}
    />
  );
};

const ShimmerDescription: React.FC<ShimmerTextProps> = props => {
  return (
    <ShimmerText
      {...props}
      height={14}
      width={props.width || '60%'}
      style={[props.style, { marginBottom: 4 }]}
    />
  );
};

const ShimmerCard: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <View
      style={[
        styles.shimmerCard,
        {
          backgroundColor: 'transparent',
        },
        style,
      ]}
    >
      <ShimmerTitle width="70%" />
      <ShimmerDescription width="90%" />
      <ShimmerDescription width="50%" />
    </View>
  );
};

const ShimmerList: React.FC<{ count?: number; style?: any }> = ({
  count = 3,
  style,
}) => {
  return (
    <View style={[styles.shimmerList, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.shimmerListItem,
            {
              backgroundColor: 'transparent',
            },
          ]}
        >
          <ShimmerTitle width="40%" />
          <ShimmerDescription width="80%" />
        </View>
      ))}
    </View>
  );
};

const InitialShimmerList: React.FC<{ count?: number; style?: any }> = ({
  count = 5,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.initialShimmerList, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.initialShimmerItem,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.outline,
            },
          ]}
        >
          <ShimmerTitle width="30%" />
          <ShimmerDescription width="70%" />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  shimmer: {
    overflow: 'hidden',
  },
  shimmerCard: {
    padding: 16,
    borderRadius: 8,
  },
  shimmerList: {
    flex: 1,
  },
  shimmerListItem: {
    padding: 16,
  },
  initialShimmerList: {
    flex: 1,
  },
  initialShimmerItem: {
    padding: 16,
  },
});

export default Shimmer;
export {
  ShimmerText,
  ShimmerTitle,
  ShimmerDescription,
  ShimmerCard,
  ShimmerList,
  InitialShimmerList,
};
