export interface Channel {
  url: string;
  url_hd: string;
  image: string;
}

export interface ChannelCategory {
  [channelName: string]: Channel;
}

export interface TVChannelsData {
  [categoryName: string]: ChannelCategory;
}

class TVChannelsService {
  private baseUrl = 'http://192.168.0.100:5000';

  async getAllChannels(): Promise<TVChannelsData> {
    try {
      const response = await fetch(`${this.baseUrl}/get-all-channels`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.channels || result;
    } catch (error) {
      console.error('Error fetching TV channels:', error);
      throw error;
    }
  }

  async getChannelVideoUrl(channelType: string, channelName: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/get-channel-video-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_type: channelType,
          channel_name: channelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.url;
      } else {
        throw new Error(data.error || 'Failed to get video URL');
      }
    } catch (error) {
      console.error('Error fetching channel video URL:', error);
      throw error;
    }
  }

  // Helper method to get channels by category
  getChannelsByCategory(data: TVChannelsData, category: string): ChannelCategory | null {
    return data[category] || null;
  }

  // Helper method to get all categories
  getCategories(data: TVChannelsData): string[] {
    return Object.keys(data);
  }

  // Helper method to format category name for display
  formatCategoryName(category: string): string {
    return category
      .replace('-channels', '')
      .replace('-', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export default new TVChannelsService();