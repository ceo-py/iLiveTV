import React, { useState } from 'react';
import CategoryListScreen from './CategoryListScreen';
import ChannelListScreen from './ChannelListScreen';
import { ChannelCategory } from '../api/tvChannelsService';

type ScreenType = 'categories' | 'channels';

interface SelectedCategory {
  name: string;
  data: ChannelCategory;
}

const TVChannelsScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('categories');
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);

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

  if (currentScreen === 'categories') {
    return <CategoryListScreen onCategorySelect={handleCategorySelect} />;
  }

  if (currentScreen === 'channels' && selectedCategory) {
    return (
      <ChannelListScreen
        categoryName={selectedCategory.name}
        categoryData={selectedCategory.data}
        onBack={handleBackToCategories}
      />
    );
  }

  // Fallback to categories screen
  return <CategoryListScreen onCategorySelect={handleCategorySelect} />;
};

export default TVChannelsScreen;