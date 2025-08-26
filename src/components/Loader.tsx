import React from 'react';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const Loader: React.FC = () => (
  <ShimmerPlaceHolder
    LinearGradient={LinearGradient}
    style={{ height: 56, margin: 12 }}
  />
);

export default Loader;
