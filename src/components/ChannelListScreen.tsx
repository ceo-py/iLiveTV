import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
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

const CARD_MIN_WIDTH = 160;
const CARD_MARGIN = 10;

const ChannelListScreen: React.FC<ChannelListScreenProps> = ({
  categoryName,
  categoryData,
  onBack,
  onPlayVideo,
}) => {
  const [loadingChannel, setLoadingChannel] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
  }, []);

  const channels: ChannelItem[] = Object.entries(categoryData).map(([channelName, channel]) => ({
    id: channelName,
    name: channelName,
    channel,
  }));

  const handleChannelPress = async (channelName: string, channel: Channel) => {
    try {
      setLoadingChannel(channelName);

      // Make API request to get video URL
      const videoUrl = await tvChannelsService.getChannelVideoUrl(categoryName, channelName);
      // Validate the video URL
      if (typeof videoUrl !== 'string' || videoUrl.trim() === '') {
        Alert.alert(
          'Error',
          `Invalid video URL received for ${channelName}. Please try again.`,
          [{ text: 'OK' }]
        );
        return;
      }

      onPlayVideo(videoUrl.trim(), channelName);
    } finally {
      setLoadingChannel(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
  };

  // Responsive calculation
  const screenWidth = dimensions.width;
  const numColumns = Math.max(1, Math.floor((screenWidth - CARD_MARGIN) / (CARD_MIN_WIDTH + CARD_MARGIN)));
  const cardWidth = (screenWidth - CARD_MARGIN * (numColumns + 1)) / numColumns;

  const renderChannelCards = () => (
    <View style={styles.grid}>
      {channels.map((item, idx) => (
        <View
          key={item.id}
          style={[
            styles.channelWrapper,
            {
              width: cardWidth,
              marginLeft: CARD_MARGIN,
              marginRight: (idx + 1) % numColumns === 0 ? CARD_MARGIN : 0,
            },
          ]}
        >
          <ChannelCard
            channelName={item.name}
            channel={item.channel}
            onPress={handleChannelPress}
          />
          {loadingChannel === item.name && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}
        </View>
      ))}
    </View>
  );

  // Handle back button
  const handleBack = () => {
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {tvChannelsService.formatCategoryName(categoryName)}
        </Text>
        <Text style={styles.headerSubtitle}>
          {channels.length} channels available
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderChannelCards()}
      </ScrollView>
    </SafeAreaView>
  );
};

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
  backButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
  channelWrapper: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});

export default ChannelListScreen;