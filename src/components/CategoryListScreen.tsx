import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControlProps,
} from 'react-native';
import tvChannelsService, { TVChannelsData } from '../api/tvChannelsService';

interface CategoryListScreenProps {
  onCategorySelect: (category: string, categoryData: any) => void;
}

interface CategoryItem {
  id: string;
  name: string;
  displayName: string;
  channelCount: number;
}

const CARD_MIN_WIDTH = 160;
const CARD_MARGIN = 10;

const CategoryListScreen: React.FC<CategoryListScreenProps> = ({ onCategorySelect }) => {
  const [channelsData, setChannelsData] = useState<TVChannelsData | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    fetchChannels();
    Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
  }, []);

  useEffect(() => {
    if (channelsData) {
      updateCategoriesList();
    }
  }, [channelsData]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await tvChannelsService.getAllChannels();
      setChannelsData(data);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to fetch TV channels. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChannels();
    setRefreshing(false);
  };

  const updateCategoriesList = () => {
    if (!channelsData) return;

    const categoryItems: CategoryItem[] = Object.entries(channelsData).map(([categoryKey, categoryChannels]) => ({
      id: categoryKey,
      name: categoryKey,
      displayName: tvChannelsService.formatCategoryName(categoryKey),
      channelCount: Object.keys(categoryChannels).length,
    }));

    setCategories(categoryItems);
  };

  const handleCategoryPress = (category: CategoryItem) => {
    if (channelsData && channelsData[category.name]) {
      onCategorySelect(category.name, channelsData[category.name]);
    }
  };

  // Responsive calculation
  const screenWidth = dimensions.width;
  const numColumns = Math.max(1, Math.floor((screenWidth - CARD_MARGIN) / (CARD_MIN_WIDTH + CARD_MARGIN)));
  const cardWidth = (screenWidth - CARD_MARGIN * (numColumns + 1)) / numColumns;

  const renderCategoryCards = () => (
    <View style={styles.grid}>
      {categories.map((item, idx) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.categoryCard,
            {
              width: cardWidth,
              marginLeft: CARD_MARGIN,
              marginRight: (idx + 1) % numColumns === 0 ? CARD_MARGIN : 0,
            },
          ]}
          onPress={() => handleCategoryPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryContent}>
            <Text style={styles.categoryName} numberOfLines={2}>
              {item.displayName}
            </Text>
            <Text style={styles.channelCount}>
              {item.channelCount} channels
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Categories...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>iLiveTV</Text>
        <Text style={styles.headerSubtitle}>
          Choose a category
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderCategoryCards()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginTop: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryContent: {
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  channelCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default CategoryListScreen;