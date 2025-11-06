import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
  useWindowDimensions,
  ScrollView,
  RefreshControl,
  Animated,
  findNodeHandle,
  UIManager,
} from 'react-native';
import ChannelCard from './ChannelCard';
import tvChannelsService, { Channel, ChannelCategory } from '../api/tvChannelsService';

interface ChannelListScreenProps {
  categoryName: string;
  categoryData: ChannelCategory;
  onBack: () => void;
  onPlayVideo: (videoUrl: string, channelName: string) => void;
}

interface ChannelItem {
  id: string;
  name: string;
  channel: Channel;
}

const ChannelListScreen: React.FC<ChannelListScreenProps> = ({
  categoryName,
  categoryData,
  onBack,
  onPlayVideo,
}) => {
  const { width } = useWindowDimensions();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingChannel, setLoadingChannel] = useState<string | null>(null); // State for the loading channel name

  const scrollViewRef = useRef<ScrollView>(null);
  const cardRefs = useRef<any[]>([]);

  const isLargeScreen = width > 900;

  const CARD_MARGIN = isLargeScreen ? 20 : 10;
  const CARD_MIN_WIDTH = isLargeScreen ? 220 : 160;

  const channels: ChannelItem[] = Object.entries(categoryData).map(([name, ch]) => ({
    id: name,
    name,
    channel: ch,
  }));

  // Columns
  const numColumns = Math.max(
    1,
    Math.floor((width - CARD_MARGIN) / (CARD_MIN_WIDTH + CARD_MARGIN))
  );

  const cardWidth =
    (width - CARD_MARGIN * (numColumns + 1)) / numColumns;

  const scrollToFocused = (index: number) => {
    const ref = cardRefs.current[index];
    if (!ref) return;

    const handle = findNodeHandle(ref);
    if (!handle) return;

    UIManager.measure(handle, (_x, _y, _w, h, _px, py) => {
      if (!scrollViewRef.current) return;

      scrollViewRef.current.scrollTo({
        y: py - 150, // keep the card near top
        animated: true,
      });
    });
  };

  const handleChannelPress = async (channelName: string, channel: Channel) => {
    // Prevent pressing another channel while one is loading
    if (loadingChannel) return;

    try {
      setLoadingChannel(channelName); // Start loading for this specific channel
      const videoUrl = await tvChannelsService.getChannelVideoUrl(
        categoryName,
        channelName
      );

      if (typeof videoUrl !== 'string' || videoUrl.trim() === '') {
        Alert.alert('Error', `Invalid video URL for ${channelName}.`);
        return;
      }

      onPlayVideo(videoUrl.trim(), channelName);
    } catch (error) {
        Alert.alert('Error', `Failed to load video URL for ${channelName}.`);
    } finally {
      setLoadingChannel(null); // Stop loading when complete
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {tvChannelsService.formatCategoryName(categoryName)}
        </Text>
        <Text style={styles.headerSubtitle}>
          {channels.length} channels available
        </Text>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {channels.map((item, idx) => {
            const animatedScale = new Animated.Value(
              focusedIndex === idx ? 1.08 : 1
            );

            if (focusedIndex === idx) {
              Animated.spring(animatedScale, {
                toValue: 1.08,
                useNativeDriver: true,
                tension: 120,
                friction: 9,
              }).start();
            } else {
              Animated.spring(animatedScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 9,
              }).start();
            }
            
            // Check if this specific card is loading
            const isLoading = loadingChannel === item.name;

            return (
            <TouchableOpacity
              key={item.id}
              ref={(ref) => (cardRefs.current[idx] = ref)}
              focusable={true}
              onFocus={() => {
                setFocusedIndex(idx);
                scrollToFocused(idx);
              }}
              onBlur={() => setFocusedIndex(null)}
              // Disable press if already loading a channel
              onPress={isLoading ? undefined : () => handleChannelPress(item.name, item.channel)}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.channelWrapper,
                  {
                    width: cardWidth,
                    marginLeft: CARD_MARGIN,
                    marginRight:
                      (idx + 1) % numColumns === 0 ? CARD_MARGIN : 0,
                    transform: [{ scale: animatedScale }],
                    shadowOpacity: focusedIndex === idx ? 0.35 : 0.1,
                    shadowRadius: focusedIndex === idx ? 12 : 4,
                    shadowColor:
                      focusedIndex === idx ? 'rgba(0,122,255,0.6)' : '#000',
                    elevation: focusedIndex === idx ? 10 : 3,
                  },
                ]}
              >
                <ChannelCard
                  channelName={item.name}
                  channel={item.channel}
                  onPress={handleChannelPress}
                  width={cardWidth}
                />
                
                {/* >>>>> ADDED LOADING OVERLAY HERE <<<<< */}
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                )}
                
              </Animated.View>
            </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

//
// Styles
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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

  backButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },

  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },

  listContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  channelWrapper: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
  },

  // >>>>> ADDED LOADING OVERLAY STYLE HERE <<<<<
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent white
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // Match the card's border radius
  },
});

export default ChannelListScreen;
