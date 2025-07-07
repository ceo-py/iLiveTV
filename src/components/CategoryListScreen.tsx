import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
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

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const CategoryListScreen: React.FC<CategoryListScreenProps> = ({ onCategorySelect }) => {
  const [channelsData, setChannelsData] = useState<TVChannelsData | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChannels();
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

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName} numberOfLines={2}>
          {item.displayName}
        </Text>
        <Text style={styles.channelCount}>
          {item.channelCount} channels
        </Text>
      </View>
    </TouchableOpacity>
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
          Choose a category to browse channels
        </Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: cardWidth,
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