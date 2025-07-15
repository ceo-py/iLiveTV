/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, TouchableOpacity, Text } from 'react-native';
import TVChannelsScreen from './src/components/TVChannelsScreen';
import VideoPlayerDebug from './src/components/VideoPlayerDebug';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showDebug, setShowDebug] = useState(false);

  if (showDebug) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <VideoPlayerDebug onBack={() => setShowDebug(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <TouchableOpacity 
        style={styles.debugButton} 
        onPress={() => setShowDebug(true)}
      >
        <Text style={styles.debugButtonText}>Debug Video Player</Text>
      </TouchableOpacity>
      <TVChannelsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default App;
