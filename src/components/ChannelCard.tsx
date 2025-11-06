import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Channel } from '../api/tvChannelsService';

interface ChannelCardProps {
  channelName: string;
  channel: Channel;
  onPress: (channelName: string, channel: Channel) => void;
  width: number; // ✅ Responsive width passed from parent
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channelName,
  channel,
  onPress,
  width,
}) => {

  // ✅ Dynamic height based on card width (better for TV & tablets)
  const IMAGE_HEIGHT = width * 0.18;

  return (
    <TouchableOpacity
      focusable={true}        // ✅ Required for Android TV navigation
      hasTVPreferredFocus={false}
      activeOpacity={0.7}
      onPress={() => onPress(channelName, channel)}
      style={[styles.card, { width }]}
    >
      <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
        <Image
          source={{ uri: channel.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.channelName} numberOfLines={2}>
          {channelName}
        </Text>

        {channel.url_hd && (
          <View style={styles.hdBadge}>
            <Text style={styles.hdText}>HD</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  imageContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  textContainer: {
    padding: 12,
    minHeight: 60,
    justifyContent: 'space-between',
  },

  channelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  hdBadge: {
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },

  hdText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ChannelCard;
