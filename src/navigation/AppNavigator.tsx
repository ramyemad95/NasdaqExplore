import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import SplashScreen from '../screens/Splash/SplashScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import StockDetailScreen from '../screens/Details/StockDetailScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import { Ticker } from '../store/stocksSlice';
import { useSettings } from '../hooks/useSettings';

export type RootStackParamList = {
  Splash: undefined;
  Explore: undefined;
  Details: { stock: Ticker };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const theme = useTheme();
  const { language } = useSettings();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            color: theme.colors.onSurface,
          },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            title: language === 'ar' ? 'استكشف' : 'Explore',
            headerTitleAlign: language === 'ar' ? 'center' : 'left',
          }}
        />
        <Stack.Screen
          name="Details"
          component={StockDetailScreen}
          options={{
            title: language === 'ar' ? 'تفاصيل' : 'Details',
            headerTitleAlign: language === 'ar' ? 'center' : 'left',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: language === 'ar' ? 'الإعدادات' : 'Settings',
            headerTitleAlign: language === 'ar' ? 'center' : 'left',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
