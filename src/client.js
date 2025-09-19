import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class NASAMCPClient {
  constructor() {
    this.nasaApiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.nasaApiBase = 'https://api.nasa.gov/planetary/apod';
  }

  async connect() {
    // For this implementation, we'll directly use the NASA API
    // The MCP server functionality is embedded in the web server
    console.log('Connected to NASA API');
  }

  async getImageOfTheDay(date = null, hd = false) {
    try {
      const params = new URLSearchParams({
        api_key: this.nasaApiKey,
      });
      
      if (date) params.append('date', date);
      if (hd) params.append('hd', 'true');

      const response = await axios.get(`${this.nasaApiBase}?${params}`);
      const data = response.data;

      return {
        content: [
          {
            type: 'text',
            text: `# NASA Astronomy Picture of the Day - ${data.date}\n\n**Title:** ${data.title}\n\n**Explanation:** ${data.explanation}\n\n**Image URL:** ${hd && data.hdurl ? data.hdurl : data.url}\n\n**Copyright:** ${data.copyright || 'Public Domain'}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: hd && data.hdurl ? data.hdurl : data.url,
            },
          },
        ],
      };
    } catch (error) {
      console.error('Error getting image of the day:', error);
      throw error;
    }
  }

  async getImageInfo(date) {
    try {
      if (!date) {
        throw new Error('Date is required for get_image_info');
      }

      const params = new URLSearchParams({
        api_key: this.nasaApiKey,
        date: date,
      });

      const response = await axios.get(`${this.nasaApiBase}?${params}`);
      const data = response.data;

      return {
        content: [
          {
            type: 'text',
            text: `# APOD Information for ${data.date}\n\n**Title:** ${data.title}\n\n**Explanation:** ${data.explanation}\n\n**Media Type:** ${data.media_type}\n\n**Service Version:** ${data.service_version}\n\n**Copyright:** ${data.copyright || 'Public Domain'}\n\n**URL:** ${data.url}\n\n**HD URL:** ${data.hdurl || 'Not available'}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      throw error;
    }
  }

  async searchAPOD(startDate = null, endDate = null, count = 10) {
    try {
      const params = new URLSearchParams({
        api_key: this.nasaApiKey,
      });
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      // Only add count if we don't have date range (NASA API limitation)
      if (count && !startDate && !endDate) {
        params.append('count', Math.min(count, 100).toString());
      }

      const response = await axios.get(`${this.nasaApiBase}?${params}`);
      const data = response.data;

      let content = `# APOD Search Results\n\nFound ${Array.isArray(data) ? data.length : 1} image(s):\n\n`;
      
      const images = Array.isArray(data) ? data : [data];
      
      images.forEach((item, index) => {
        content += `## ${index + 1}. ${item.title} (${item.date})\n`;
        content += `**Explanation:** ${item.explanation.substring(0, 200)}...\n`;
        content += `**URL:** ${item.url}\n\n`;
      });

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      console.error('Error searching APOD:', error);
      throw error;
    }
  }

  async listTools() {
    return {
      tools: [
        {
          name: 'get_image_of_the_day',
          description: 'Get NASA\'s Astronomy Picture of the Day (APOD)',
        },
        {
          name: 'get_image_info',
          description: 'Get detailed information about a specific APOD image',
        },
        {
          name: 'search_apod',
          description: 'Search APOD images by date range',
        },
      ],
    };
  }

  async disconnect() {
    // No cleanup needed for direct API calls
    console.log('Disconnected from NASA API');
  }
}

export default NASAMCPClient;
