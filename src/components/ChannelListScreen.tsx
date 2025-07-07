import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
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
  const [loadingChannel, setLoadingChannel] = useState<string | null>(null);
  
  const { width, height } = Dimensions.get('window');
  const isPortrait = height > width;

  const channels: ChannelItem[] = Object.entries(categoryData).map(([channelName, channel]) => ({
    id: channelName,
    name: channelName,
    channel,
  }));

  const analyzeUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const isM3U8 = url.includes('.m3u8');
      const hasToken = urlObj.searchParams.has('token');
      const domain = urlObj.hostname;
      
      return {
        domain,
        isM3U8,
        hasToken,
        protocol: urlObj.protocol,
        pathname: urlObj.pathname,
        tokenValue: hasToken ? urlObj.searchParams.get('token') : null
      };
    } catch {
      return null;
    }
  };

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
      
      onPlayVideo(videoUrl.trim(), channelName)
    } finally {
      setLoadingChannel(null);
    }
  };

  const renderChannelItem = ({ item }: { item: ChannelItem }) => (
    <View style={styles.channelWrapper}>
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tvChannelsService.formatCategoryName(categoryName)}
        </Text>
        <Text style={styles.headerSubtitle}>
          {channels.length} channels available
        </Text>
      </View>

      <FlatList
        data={channels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        numColumns={isPortrait ? 2 : 3}
        columnWrapperStyle={isPortrait ? styles.row : styles.rowLandscape}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    marginBottom: 8,
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
  flatList: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  rowLandscape: {
    justifyContent: 'space-around',
  },
  channelWrapper: {
    position: 'relative',
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