import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import VideoPlayerScreen from './VideoPlayerScreen';

interface VideoPlayerDebugProps {
  onBack: () => void;
}

const VideoPlayerDebug: React.FC<VideoPlayerDebugProps> = ({ onBack }) => {
  const [showPlayer, setShowPlayer] = React.useState(false);
  const [customUrl, setCustomUrl] = React.useState('');
  const [currentTestUrl, setCurrentTestUrl] = React.useState('');

  // Default test URL - a known working M3U8 stream
  const defaultTestUrl = '';

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const playCustomUrl = () => {
    const urlToTest = customUrl.trim();
    
    if (!urlToTest) {
      Alert.alert('Error', 'Please enter a URL to test');
      return;
    }

    if (!validateUrl(urlToTest)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setCurrentTestUrl(urlToTest);
    setShowPlayer(true);
  };

  const playDefaultUrl = () => {
    setCurrentTestUrl(defaultTestUrl);
    setShowPlayer(true);
  };

  if (showPlayer) {
    return (
      <VideoPlayerScreen
        videoUrl={currentTestUrl}
        channelName="Debug Test Channel"
        onBack={() => setShowPlayer(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Video Player Debug</Text>
      <Text style={styles.subtitle}>Test the video player with custom URLs</Text>
      
      {/* Custom URL Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Enter Custom URL:</Text>
        <TextInput
          style={styles.urlInput}
          value={customUrl}
          onChangeText={setCustomUrl}
          placeholder="Paste your M3U8 or video URL here..."
          placeholderTextColor="#999"
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={playCustomUrl}
        >
          <Text style={styles.buttonText}>Test Custom URL</Text>
        </TouchableOpacity>
      </View>

      {/* Default URL Test Section */}
      <View style={styles.defaultSection}>
        <Text style={styles.sectionTitle}>Or test with default URL:</Text>
        <TouchableOpacity 
          style={styles.defaultButton} 
          onPress={playDefaultUrl}
        >
          <Text style={styles.buttonText}>Test Default M3U8</Text>
        </TouchableOpacity>
      </View>

      {/* Quick URL Buttons */}
      <View style={styles.quickUrlSection}>
        <Text style={styles.sectionTitle}>Quick Test URLs:</Text>
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => setCustomUrl(defaultTestUrl)}
        >
          <Text style={styles.quickButtonText}>Load Default URL</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => setCustomUrl('')}
        >
          <Text style={styles.quickButtonText}>Clear Input</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBack}
      >
        <Text style={styles.buttonText}>Back to App</Text>
      </TouchableOpacity>

      {/* Default URL Display */}
      <View style={styles.urlContainer}>
        <Text style={styles.urlLabel}>Default Test URL:</Text>
        <Text style={styles.urlText}>{defaultTestUrl}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    minHeight: 80,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  defaultSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  defaultButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickUrlSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  urlContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  urlText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default VideoPlayerDebug;