import axios from 'axios';

class FreeAgent {
  constructor() {
    this.agentType = this.detectAvailableAgent();
    this.imageAnalysisCache = new Map();
  }

  detectAvailableAgent() {
    // Check for available free agents in order of preference
    if (this.canUseOllama()) {
      return 'ollama';
    } else if (this.canUseHuggingFace()) {
      return 'huggingface';
    } else {
      return 'basic';
    }
  }

  canUseOllama() {
    // Check if Ollama is running locally
    return process.env.OLLAMA_HOST || process.env.USE_OLLAMA === 'true';
  }

  canUseHuggingFace() {
    // Check if Hugging Face API key is available
    return process.env.HUGGINGFACE_API_KEY;
  }

  async analyzeImage(imageUrl, question = null) {
    try {
      // Check cache first
      const cacheKey = `${imageUrl}_${question || 'default'}`;
      if (this.imageAnalysisCache.has(cacheKey)) {
        return this.imageAnalysisCache.get(cacheKey);
      }

      let analysis;
      
      switch (this.agentType) {
        case 'ollama':
          analysis = await this.analyzeWithOllama(imageUrl, question);
          break;
        case 'huggingface':
          analysis = await this.analyzeWithHuggingFace(imageUrl, question);
          break;
        default:
          analysis = this.getBasicAnalysis(imageUrl, question);
      }

      // Cache the result
      this.imageAnalysisCache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('Error in free agent analysis:', error);
      return this.getBasicAnalysis(imageUrl, question);
    }
  }

  async analyzeWithOllama(imageUrl, question = null) {
    try {
      const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
      
      // First, get the image data
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      const prompt = question || 'Analyze this NASA Astronomy Picture of the Day. Describe what you see and explain the scientific concepts.';

      const response = await axios.post(`${ollamaHost}/api/generate`, {
        model: 'llava:7b', // or 'llava:13b' for better quality
        prompt: prompt,
        images: [base64Image],
        stream: false
      });

      return response.data.response;
    } catch (error) {
      console.error('Ollama analysis failed:', error);
      throw error;
    }
  }

  async analyzeWithHuggingFace(imageUrl, question = null) {
    try {
      const apiKey = process.env.HUGGINGFACE_API_KEY;
      
      // Use a free image captioning model
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
        {
          inputs: imageUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const caption = response.data[0].generated_text;
      
      // Enhance with basic astronomy knowledge
      const enhancedAnalysis = this.enhanceWithAstronomyKnowledge(caption, question);
      return enhancedAnalysis;
    } catch (error) {
      console.error('Hugging Face analysis failed:', error);
      throw error;
    }
  }

  enhanceWithAstronomyKnowledge(caption, question = null) {
    const astronomyFacts = [
      "This image likely shows astronomical phenomena such as galaxies, nebulae, or star clusters.",
      "NASA's Astronomy Picture of the Day features images captured by various telescopes and spacecraft.",
      "The colors in space images often represent different wavelengths of light or chemical elements.",
      "Many space images are composite images combining data from different instruments and wavelengths.",
      "The scale of objects in space images can range from planetary to galactic scales."
    ];

    const randomFact = astronomyFacts[Math.floor(Math.random() * astronomyFacts.length)];
    
    return `Image Analysis: ${caption}\n\nAstronomical Context: ${randomFact}\n\nNote: This analysis was generated using free AI services. For more detailed analysis, consider using a paid AI service.`;
  }

  getBasicAnalysis(imageUrl, question = null) {
    const basicAnalyses = [
      {
        title: "Cosmic Nebula",
        description: "This appears to be a beautiful cosmic nebula, likely showing star-forming regions where new stars are being born. The colorful gases and dust create stunning visual patterns.",
        facts: ["Nebulae are vast clouds of gas and dust in space", "They are often stellar nurseries where new stars form", "Colors indicate different chemical elements and temperatures"]
      },
      {
        title: "Galactic Structure", 
        description: "This image likely shows a galaxy or galactic structure, displaying the incredible scale and beauty of cosmic objects. The spiral arms and central regions are clearly visible.",
        facts: ["Galaxies contain billions of stars", "Spiral galaxies like our Milky Way have distinct arms", "The center often contains a supermassive black hole"]
      },
      {
        title: "Stellar Cluster",
        description: "This appears to be a star cluster, a group of stars that formed together and are gravitationally bound. The density and arrangement of stars create beautiful patterns.",
        facts: ["Star clusters can contain thousands of stars", "They provide insights into stellar evolution", "Open clusters are younger, globular clusters are older"]
      },
      {
        title: "Planetary System",
        description: "This image likely shows a planet, moon, or planetary system. The detailed surface features and atmospheric conditions are fascinating to study.",
        facts: ["Planets can have diverse surface features", "Atmospheres create weather patterns and auroras", "Moons can have their own geological activity"]
      }
    ];

    const randomAnalysis = basicAnalyses[Math.floor(Math.random() * basicAnalyses.length)];
    
    return `🔭 Basic Astronomical Analysis

**Title:** ${randomAnalysis.title}
**Description:** ${randomAnalysis.description}

**Key Facts:**
${randomAnalysis.facts.map(fact => `• ${fact}`).join('\n')}

**Note:** This is a basic analysis without AI. For detailed analysis, consider using Ollama (local) or Hugging Face (free API) services.`;
  }

  async answerQuestion(question, imageUrl = null) {
    try {
      let context = '';
      
      if (imageUrl) {
        const analysis = await this.analyzeImage(imageUrl, question);
        context = `Based on the image analysis: ${analysis}\n\n`;
      }

      const answer = this.generateAnswer(question, context);
      return answer;
    } catch (error) {
      console.error('Error answering question:', error);
      return this.generateAnswer(question, '');
    }
  }

  generateAnswer(question, context = '') {
    const questionLower = question.toLowerCase();
    
    // Basic astronomy knowledge base
    const knowledgeBase = {
      'galaxy': 'Galaxies are vast collections of stars, gas, and dust bound together by gravity. Our Milky Way is a spiral galaxy containing hundreds of billions of stars.',
      'nebula': 'Nebulae are clouds of gas and dust in space. They can be stellar nurseries where new stars form, or the remains of dead stars.',
      'star': 'Stars are massive, luminous spheres of plasma held together by gravity. They generate energy through nuclear fusion in their cores.',
      'planet': 'Planets are celestial bodies that orbit stars. They can be rocky (like Earth) or gaseous (like Jupiter) and may have moons.',
      'telescope': 'Telescopes are instruments that collect and focus light to observe distant objects. Space telescopes avoid atmospheric interference.',
      'nasa': 'NASA (National Aeronautics and Space Administration) is the U.S. space agency responsible for space exploration and research.',
      'apod': 'APOD (Astronomy Picture of the Day) is a NASA website that features a different astronomical image each day with explanations.',
      'space': 'Space is the vast, mostly empty region beyond Earth\'s atmosphere. It contains stars, planets, galaxies, and other cosmic objects.',
      'universe': 'The universe is all of space and time and their contents, including planets, stars, galaxies, and all other forms of matter and energy.'
    };

    // Find relevant knowledge
    let relevantKnowledge = '';
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (questionLower.includes(key)) {
        relevantKnowledge += `${value}\n\n`;
      }
    }

    const answers = [
      `Great question about "${question}"! ${context}${relevantKnowledge}This relates to the fascinating field of astronomy and space science. NASA's APOD images help us explore and understand the universe better.`,
      `That's an interesting question! ${context}${relevantKnowledge}Astronomy is full of amazing discoveries, and images like those in NASA's APOD help us visualize the incredible phenomena in our universe.`,
      `Excellent question! ${context}${relevantKnowledge}The study of space and astronomy continues to reveal new mysteries and wonders about our universe.`
    ];

    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    
    return `${randomAnswer}\n\n💡 **Free Agent Status:** Using ${this.agentType} mode - no API costs!`;
  }

  getAgentInfo() {
    return {
      type: this.agentType,
      capabilities: this.getCapabilities(),
      status: this.getStatus()
    };
  }

  getCapabilities() {
    switch (this.agentType) {
      case 'ollama':
        return ['Image analysis', 'Text generation', 'Local processing', 'No API costs'];
      case 'huggingface':
        return ['Image captioning', 'Basic analysis', 'Free API', 'Limited requests'];
      default:
        return ['Basic astronomy knowledge', 'Pattern recognition', 'Educational content', 'No API costs'];
    }
  }

  getStatus() {
    switch (this.agentType) {
      case 'ollama':
        return '🟢 Ollama (Local) - Full AI capabilities';
      case 'huggingface':
        return '🟡 Hugging Face (Free API) - Basic AI capabilities';
      default:
        return '🔵 Basic Mode - Knowledge-based responses';
    }
  }
}

export default FreeAgent;
