import OpenAI from 'openai';
import NASAMCPClient from './client.js';
import FreeAgent from './free-agent.js';
import dotenv from 'dotenv';

dotenv.config();

class NASAImageAgent {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }) : null;
    this.mcpClient = new NASAMCPClient();
    this.freeAgent = new FreeAgent();
    this.imageCache = new Map();
    this.useFreeAgent = !process.env.OPENAI_API_KEY || process.env.USE_FREE_AGENT === 'true';
  }

  async initialize() {
    await this.mcpClient.connect();
  }

  async analyzeImage(imageUrl, question = null) {
    try {
      // Use free agent if configured or if OpenAI is not available
      if (this.useFreeAgent || !this.openai || !process.env.OPENAI_API_KEY) {
        return await this.freeAgent.analyzeImage(imageUrl, question);
      }

      // Get image data
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      // Prepare messages for OpenAI
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question || 'Analyze this NASA Astronomy Picture of the Day. Describe what you see, explain the scientific concepts, and provide interesting facts about the subject matter.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Fallback to free agent if OpenAI fails
      return await this.freeAgent.analyzeImage(imageUrl, question);
    }
  }

  getFallbackAnalysis(imageUrl, question = null) {
    const fallbackResponses = [
      "This is a beautiful NASA Astronomy Picture of the Day! While I can't analyze the specific details without AI capabilities, this image likely shows fascinating astronomical phenomena such as galaxies, nebulae, star clusters, or other cosmic objects. NASA's APOD features some of the most stunning and scientifically significant images from space.",
      "This NASA image appears to showcase incredible space phenomena! Without AI analysis, I can tell you that NASA's Astronomy Picture of the Day typically features galaxies, nebulae, planets, moons, and other celestial objects captured by various telescopes and spacecraft.",
      "What an amazing cosmic view! This NASA APOD image likely contains fascinating astronomical content. These images are carefully selected for their scientific significance and visual beauty, often featuring phenomena like star formation, galactic interactions, or planetary features."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return `${randomResponse}\n\nNote: For detailed AI analysis, please ensure your OpenAI API key has sufficient quota.`;
  }

  async getImageOfTheDayWithAnalysis(date = null, hd = false) {
    try {
      const result = await this.mcpClient.getImageOfTheDay(date, hd);
      
      if (result.content && result.content.length > 0) {
        const textContent = result.content.find(c => c.type === 'text');
        const imageContent = result.content.find(c => c.type === 'image_url');
        
        if (imageContent && imageContent.image_url) {
          const analysis = await this.analyzeImage(imageContent.image_url.url);
          
          return {
            ...result,
            analysis: analysis,
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting image with analysis:', error);
      throw error;
    }
  }

  async answerQuestion(question, imageUrl = null) {
    try {
      // Use free agent if configured or if OpenAI is not available
      if (this.useFreeAgent || !this.openai || !process.env.OPENAI_API_KEY) {
        return await this.freeAgent.answerQuestion(question, imageUrl);
      }

      let context = '';
      
      if (imageUrl) {
        // Analyze the specific image
        const analysis = await this.analyzeImage(imageUrl, question);
        context = `Based on the NASA image analysis: ${analysis}\n\n`;
      } else {
        // Get today's image for context
        const todayImage = await this.mcpClient.getImageOfTheDay();
        if (todayImage.content && todayImage.content.length > 0) {
          const textContent = todayImage.content.find(c => c.type === 'text');
          const imageContent = todayImage.content.find(c => c.type === 'image_url');
          
          if (textContent && imageContent) {
            context = `Current NASA APOD context: ${textContent.text}\n\n`;
            
            if (imageContent.image_url) {
              const analysis = await this.analyzeImage(imageContent.image_url.url, question);
              context += `Image analysis: ${analysis}\n\n`;
            }
          }
        }
      }

      const messages = [
        {
          role: 'system',
          content: `You are a knowledgeable astronomy and space science assistant. You have access to NASA's Astronomy Picture of the Day (APOD) and can analyze space images. ${context}Answer the user's question about astronomy, space science, or the NASA image. Be informative, accurate, and engaging.`,
        },
        {
          role: 'user',
          content: question,
        },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 800,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error answering question:', error);
      // Fallback to free agent if OpenAI fails
      return await this.freeAgent.answerQuestion(question, imageUrl);
    }
  }

  getFallbackAnswer(question, imageUrl = null) {
    const fallbackAnswers = [
      `Thank you for your question about "${question}". While I can't provide AI-powered analysis at the moment, I can tell you that NASA's Astronomy Picture of the Day features incredible images from space, including galaxies, nebulae, planets, and other cosmic phenomena. Each image is carefully selected for its scientific significance and visual beauty.`,
      `Great question! "${question}" relates to the fascinating world of astronomy and space science. NASA's APOD showcases some of the most stunning images from space, captured by various telescopes and spacecraft. These images help us understand the universe better.`,
      `That's an interesting question about "${question}"! NASA's Astronomy Picture of the Day is a wonderful resource for exploring space through images. Each day features a different astronomical object or phenomenon, often with detailed explanations from astronomers.`
    ];
    
    const randomAnswer = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
    return `${randomAnswer}\n\nNote: For detailed AI-powered answers, please ensure your OpenAI API key has sufficient quota.`;
  }

  async searchAndAnalyze(startDate, endDate, count = 5) {
    try {
      const searchResults = await this.mcpClient.searchAPOD(startDate, endDate, count);
      
      if (searchResults.content && searchResults.content.length > 0) {
        const textContent = searchResults.content[0].text;
        
        // Extract image URLs from the search results
        const urlRegex = /https:\/\/apod\.nasa\.gov\/apod\/image\/[^\s]+/g;
        const urls = textContent.match(urlRegex) || [];
        
        const analyses = [];
        for (const url of urls.slice(0, 3)) { // Limit to 3 images for analysis
          try {
            const analysis = await this.analyzeImage(url);
            analyses.push({
              url,
              analysis,
            });
          } catch (error) {
            console.warn(`Failed to analyze image ${url}:`, error.message);
          }
        }
        
        return {
          searchResults,
          analyses,
        };
      }
      
      return searchResults;
    } catch (error) {
      console.error('Error searching and analyzing:', error);
      throw error;
    }
  }

  async getConversationContext() {
    try {
      const todayImage = await this.mcpClient.getImageOfTheDay();
      return todayImage;
    } catch (error) {
      console.error('Error getting conversation context:', error);
      throw error;
    }
  }

  getAgentInfo() {
    if (this.useFreeAgent || !this.openai) {
      return this.freeAgent.getAgentInfo();
    }
    
    return {
      type: 'openai',
      capabilities: ['Image analysis', 'Text generation', 'Advanced AI', 'Paid API'],
      status: '🟢 OpenAI GPT-4o - Full AI capabilities'
    };
  }

  async disconnect() {
    await this.mcpClient.disconnect();
  }
}

export default NASAImageAgent;
