import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setFilters } from '../../../store/filtersSlice';
import { useDebounce } from '../../../hooks/useDebounce';
import { useRTL } from '../../../hooks/useRTL';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheetFilterRef } from '../../../components/BottomSheetFilter';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';
import { useStocks } from '../../../hooks/useStocks';

interface ExploreHeaderProps {
  filterSheetRef: React.RefObject<BottomSheetFilterRef | null>;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = React.memo(
  ({ filterSheetRef }) => {
    const theme = useTheme();
    const { isRTL, flexDirection, textAlign } = useRTL();
    const { t } = useTranslation();
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Use the new useStocks hook
    const { searchStocks, resetStocks } = useStocks();

    // Performance monitoring

    const filters = useSelector((state: RootState) => state.filters);
    const [query, setQuery] = React.useState('');
    const debounced = useDebounce(query, 500);

    // Memoize filters string to prevent unnecessary API calls
    const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

    // Memoize the search effect to prevent unnecessary API calls
    const searchEffect = useMemo(() => {
      return {
        search: debounced,
        filters: filters,
      };
    }, [debounced, filtersString]);

    useEffect(() => {
      // Only reset and fetch if we have a new search or filters
      const shouldFetch = debounced !== '' || Object.keys(filters).length > 0;

      if (shouldFetch) {
        resetStocks();
        searchStocks(debounced, filters);
      }
    }, [searchEffect, resetStocks, searchStocks]);

    // Memoize search styles to prevent recreation
    const searchStyles = useMemo(
      () => [
        styles.search,
        {
          backgroundColor: theme.colors.surfaceVariant,
          marginRight: isRTL ? 0 : 4,
          marginLeft: isRTL ? 4 : 0,
        },
      ],
      [theme.colors.surfaceVariant, isRTL],
    );

    // Memoize search input styles
    const searchInputStyles = useMemo(
      () => ({
        color: theme.colors.onSurface,
        textAlign: textAlign as
          | 'auto'
          | 'center'
          | 'right'
          | 'left'
          | 'justify',
      }),
      [theme.colors.onSurface, textAlign],
    );

    // Memoize container styles
    const containerStyles = useMemo(
      () => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          flexDirection: flexDirection as any,
        },
      ],
      [theme.colors.surface, flexDirection],
    );

    const handleSearchChange = useCallback((text: string) => {
      setQuery(text);
    }, []);

    const handleFilterPress = useCallback(() => {
      if (filterSheetRef.current) {
        filterSheetRef.current.expand();
      }
    }, [filterSheetRef]);

    const handleSettingsPress = useCallback(() => {
      navigation.navigate('Settings');
    }, [navigation]);

    return (
      <View style={containerStyles}>
        <View style={searchStyles}>
          <TouchableOpacity style={styles.searchIconContainer}>
            <Image
              source={require('../../../assets/search.png')}
              style={[
                styles.searchIcon,
                { tintColor: theme.colors.onSurfaceVariant },
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TextInput
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={query}
            onChangeText={handleSearchChange}
            style={[styles.searchInput, searchInputStyles]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t('explore.searchPlaceholder')}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.clearButton}
            >
              <Image
                source={require('../../../assets/close.png')}
                style={[
                  styles.clearIcon,
                  { tintColor: theme.colors.onSurfaceVariant },
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={handleFilterPress}
          accessibilityLabel={isRTL ? 'فلاتر' : 'Filters'}
          style={styles.iconButton}
        >
          <Image
            source={require('../../../assets/filter.png')}
            style={[styles.icon, { tintColor: theme.colors.primary }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSettingsPress}
          accessibilityLabel={isRTL ? 'الإعدادات' : 'Settings'}
          style={styles.iconButton}
        >
          <Image
            source={require('../../../assets/setting.png')}
            style={[styles.icon, { tintColor: theme.colors.primary }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    zIndex: 1, // Lower z-index than bottom sheet
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearIcon: {
    width: 18,
    height: 18,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default ExploreHeader;
