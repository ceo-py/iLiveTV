import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Channel } from '../api/tvChannelsService';

interface ChannelCardProps {
  channelName: string;
  channel: Channel;
  onPress: (channelName: string, channel: Channel) => void;
}

const { width, height } = Dimensions.get('window');
const isPortrait = height > width;
const cardWidth = isPortrait ? (width - 60) / 2 : (width - 80) / 3; // Responsive columns

const ChannelCard: React.FC<ChannelCardProps> = ({
  channelName,
  channel,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(channelName, channel)}
      activeOpacity={0.7}>
      <View style={styles.imageContainer}>
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
  imageContainer: {
    height: 80,
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