import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
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

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchChannels();
    Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
  }, []);

  useEffect(() => {
    if (channelsData) updateCategoriesList();
  }, [channelsData]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await tvChannelsService.getAllChannels();
      setChannelsData(data);
    } catch {
      Alert.alert('Error', 'Failed to fetch TV channels.', [{ text: 'OK' }]);
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

    const categoryItems: CategoryItem[] = Object.entries(channelsData).map(
      ([key, ch]) => ({
        id: key,
        name: key,
        displayName: tvChannelsService.formatCategoryName(key),
        channelCount: Object.keys(ch).length,
      })
    );

    setCategories(categoryItems);
  };

  const screenWidth = dimensions.width;
  const numColumns = Math.max(
    1,
    Math.floor((screenWidth - CARD_MARGIN) / (CARD_MIN_WIDTH + CARD_MARGIN))
  );
  const cardWidth =
    (screenWidth - CARD_MARGIN * (numColumns + 1)) / numColumns;

  const renderCategoryCards = () => (
    <View style={styles.grid}>
      {categories.map((item, idx) => {
        const scale = new Animated.Value(1);

        const onFocus = () => {
          Animated.spring(scale, {
            toValue: 1.08,
            useNativeDriver: true,
          }).start();

          const row = Math.floor(idx / numColumns);
          scrollRef.current?.scrollTo({ y: row * 180, animated: true });
        };

        const onBlur = () => {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        };

        return (
          <Animated.View
            key={item.id}
            style={{
              transform: [{ scale }],
              width: cardWidth,
              marginLeft: CARD_MARGIN,
              marginRight: (idx + 1) % numColumns === 0 ? CARD_MARGIN : 0,
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              focusable={true}
              onFocus={onFocus}
              onBlur={onBlur}
              activeOpacity={0.7}
              style={styles.categoryCard}
              onPress={() => onCategorySelect(item.name, channelsData![item.name])}
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
          </Animated.View>
        );
      })}
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
        <Text style={styles.headerSubtitle}>Choose a category</Text>
      </View>

      <ScrollView
        ref={scrollRef}
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa',
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  header: {
    marginTop: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  listContainer: { paddingVertical: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },

  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: 'rgba(0,122,255,0.6)',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  categoryContent: {
    padding: 20, minHeight: 100, justifyContent: 'center', alignItems: 'center',
  },
  categoryName: {
    fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 8,
  },
  channelCount: {
    fontSize: 12, color: '#666', textAlign: 'center',
  },
});

export default CategoryListScreen;
