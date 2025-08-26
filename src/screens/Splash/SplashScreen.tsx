import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Explore');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Image
        source={require('../../assets/nasdaq-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.credit, { color: theme.colors.onBackground }]}>
        Ramy Mehanna
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 160, height: 160 },
  credit: { position: 'absolute', bottom: 32, fontSize: 14, opacity: 0.6 },
});

export default SplashScreen;
