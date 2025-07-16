import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  BackHandler,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import Orientation from 'react-native-orientation-locker';

interface VideoPlayerScreenProps {
  videoUrl: string;
  channelName: string;
  onBack: () => void;
}

const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  videoUrl,
  channelName,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const videoRef = useRef<VideoRef>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate videoUrl
  const validVideoUrl = typeof videoUrl === 'string' && videoUrl.trim() !== '' ? videoUrl.trim() : null;

  useEffect(() => {
    // Check if videoUrl is valid
    if (!validVideoUrl) {
      console.error('Invalid video URL:', videoUrl);
      setHasError(true);
      setIsLoading(false);
      return;
    }
  }, [validVideoUrl, videoUrl]);

  useEffect(() => {
    // Lock orientation to landscape for better TV experience
    Orientation.lockToLandscape();

    // Listen for orientation changes and update screen dimensions
    const updateDimensions = () => {
      setScreenDimensions(Dimensions.get('window'));
    };
    Dimensions.addEventListener('change', updateDimensions);

    // Handle back button
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      Orientation.unlockAllOrientations();
    };
  }, []);

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (isControlsVisible) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isControlsVisible]);

  const handleBack = () => {
    Orientation.unlockAllOrientations();
    onBack();
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    setIsLoading(false);
    setHasError(true);
    Alert.alert(
      'Playback Error',
      'Unable to play this video stream. Please try again or select another channel.',
      [
        { text: 'Retry', onPress: () => setHasError(false) },
        { text: 'Back', onPress: handleBack },
      ]
    );
  };

  const handleVideoBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    setIsLoading(isBuffering);
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (hasError || !validVideoUrl) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar hidden />
        <Text style={styles.errorTitle}>Playback Error</Text>
        <Text style={styles.errorMessage}>
          {!validVideoUrl 
            ? `Invalid video URL provided for ${channelName}. Please try selecting the channel again.`
            : `Unable to load the video stream for ${channelName}`
          }
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setHasError(false)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back to Channels</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <TouchableOpacity 
        style={styles.videoContainer} 
        activeOpacity={1} 
        onPress={toggleControls}
      >
        {validVideoUrl && (
          <Video
            ref={videoRef}
            source={{ uri: validVideoUrl }}
            style={{ width: screenDimensions.width, height: screenDimensions.height }}
            resizeMode="cover"
            onLoad={handleVideoLoad}
            onError={handleVideoError}
            onBuffer={handleVideoBuffer}
            repeat={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            mixWithOthers="duck"
          />
        )}
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading stream...</Text>
          </View>
        )}

        {isControlsVisible && (
          <View style={styles.controlsOverlay}>
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.controlButton} onPress={handleBack}>
                <Text style={styles.controlButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.channelTitle}>{channelName}</Text>
              <TouchableOpacity style={styles.controlButton} onPress={toggleFullscreen}>
                <Text style={styles.controlButtonText}>
                  {isFullscreen ? '⊡' : '⊞'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomControls}>
              <Text style={styles.liveIndicator}>● LIVE</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {},
  fullscreenVideo: {},
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  channelTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  liveIndicator: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoPlayerScreen;