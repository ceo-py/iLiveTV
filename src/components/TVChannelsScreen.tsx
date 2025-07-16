import React, { useState } from 'react';
import CategoryListScreen from './CategoryListScreen';
import ChannelListScreen from './ChannelListScreen';
import VideoPlayerScreen from './VideoPlayerScreen';
import { ChannelCategory } from '../api/tvChannelsService';

type ScreenType = 'categories' | 'channels' | 'player';

interface SelectedCategory {
  name: string;
  data: ChannelCategory;
}

interface VideoPlayerData {
  videoUrl: string;
  channelName: string;
}

interface TVChannelsScreenProps {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
}

const TVChannelsScreen: React.FC<TVChannelsScreenProps> = ({ currentScreen, setCurrentScreen }) => {
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [videoPlayerData, setVideoPlayerData] = useState<VideoPlayerData | null>(null);

  const handleCategorySelect = (categoryName: string, categoryData: ChannelCategory) => {
    setSelectedCategory({
      name: categoryName,
      data: categoryData,
    });
    setCurrentScreen('channels');
  };

  const handleBackToCategories = () => {
    setCurrentScreen('categories');
    setSelectedCategory(null);
  };

  const handlePlayVideo = (videoUrl: string, channelName: string) => {
    setVideoPlayerData({
      videoUrl,
      channelName,
    });
    setCurrentScreen('player');
  };

  const handleBackFromPlayer = () => {
    setCurrentScreen('channels');
    setVideoPlayerData(null);
  };

  if (currentScreen === 'categories') {
    return <CategoryListScreen onCategorySelect={handleCategorySelect} />;
  }

  if (currentScreen === 'channels' && selectedCategory) {
    return (
      <ChannelListScreen
        categoryName={selectedCategory.name}
        categoryData={selectedCategory.data}
        onBack={handleBackToCategories}
        onPlayVideo={handlePlayVideo}
      />
    );
  }

  if (currentScreen === 'player' && videoPlayerData) {
    return (
      <VideoPlayerScreen
        videoUrl={videoPlayerData.videoUrl}
        channelName={videoPlayerData.channelName}
        onBack={handleBackFromPlayer}
      />
    );
  }

  // Fallback to categories screen
  return <CategoryListScreen onCategorySelect={handleCategorySelect} />;
};

export default TVChannelsScreen;