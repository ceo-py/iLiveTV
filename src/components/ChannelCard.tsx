import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Channel } from '../api/tvChannelsService';

interface ChannelCardProps {
  channelName: string;
  channel: Channel;
  onPress: (channelName: string, channel: Channel) => void;
  width: number;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channelName,
  channel,
  onPress,
  width,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onFocus = () => {
    Animated.spring(scale, {
      toValue: 1.08,
      useNativeDriver: true,
    }).start();
  };

  const onBlur = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const IMAGE_HEIGHT = width * 0.18;

  return (
    <Animated.View
      style={[
        styles.cardAnimated,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        focusable={true}
        onFocus={onFocus}
        onBlur={onBlur}
        style={[styles.card, { width }]}
        activeOpacity={0.7}
        onPress={() => onPress(channelName, channel)}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardAnimated: {
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: 'rgba(0,122,255,0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 12,
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
