import dotenv from 'dotenv';

dotenv.config();

class Config {
  constructor() {
    // Your pre-configured API keys (replace with your actual keys)
    this.FALLBACK_NASA_API_KEY = 'Kk9dgtd0FlR83k8m2U61pJFzdLze5Oa1anbnnlAU'; // Your NASA API key
    this.FALLBACK_OPENAI_API_KEY = null; // Replace with your OpenAI API key if you want to provide it
    
    // Load user's environment variables
    this.userNasaKey = process.env.NASA_API_KEY;
    this.userOpenaiKey = process.env.OPENAI_API_KEY;
    this.useFreeAgent = process.env.USE_FREE_AGENT === 'true';
    
    // Determine which keys to use
    this.nasaApiKey = this.userNasaKey || this.FALLBACK_NASA_API_KEY;
    this.openaiApiKey = this.userOpenaiKey || this.FALLBACK_OPENAI_API_KEY;
    
    // Server configuration
    this.port = process.env.PORT || 3000;
    this.mcpServerPort = process.env.MCP_SERVER_PORT || 3001;
    
    // AI configuration
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.useOllama = process.env.USE_OLLAMA === 'true';
  }

  getNasaApiKey() {
    return this.nasaApiKey;
  }

  getOpenaiApiKey() {
    return this.openaiApiKey;
  }

  isUsingFallbackKeys() {
    return {
      nasa: !this.userNasaKey,
      openai: !this.userOpenaiKey && this.FALLBACK_OPENAI_API_KEY
    };
  }

  getKeyStatus() {
    const fallback = this.isUsingFallbackKeys();
    return {
      nasa: {
        available: !!this.nasaApiKey,
        usingFallback: fallback.nasa,
        source: fallback.nasa ? 'fallback' : 'user'
      },
      openai: {
        available: !!this.openaiApiKey,
        usingFallback: fallback.openai,
        source: fallback.openai ? 'fallback' : 'user'
      },
      freeAgent: this.useFreeAgent,
      ollama: this.useOllama,
      huggingface: !!this.huggingfaceApiKey
    };
  }

  getSetupInstructions() {
    const status = this.getKeyStatus();
    const instructions = [];

    if (status.nasa.usingFallback) {
      instructions.push({
        type: 'info',
        message: `🌍 NASA API: Using fallback key (${status.nasa.available ? 'available' : 'not available'})`,
        action: 'To use your own NASA API key, add NASA_API_KEY=your_key to your .env file'
      });
    } else {
      instructions.push({
        type: 'success',
        message: '🌍 NASA API: Using your personal key',
        action: null
      });
    }

    if (status.openai.usingFallback) {
      instructions.push({
        type: 'info',
        message: `🤖 OpenAI API: Using fallback key (${status.openai.available ? 'available' : 'not available'})`,
        action: 'To use your own OpenAI API key, add OPENAI_API_KEY=your_key to your .env file'
      });
    } else if (status.openai.available) {
      instructions.push({
        type: 'success',
        message: '🤖 OpenAI API: Using your personal key',
        action: null
      });
    } else if (status.freeAgent) {
      instructions.push({
        type: 'info',
        message: '🤖 AI: Using free agent mode (no API costs)',
        action: 'For advanced AI features, add OPENAI_API_KEY=your_key to your .env file'
      });
    } else {
      instructions.push({
        type: 'warning',
        message: '🤖 AI: No AI capabilities available',
        action: 'Add OPENAI_API_KEY=your_key to your .env file or set USE_FREE_AGENT=true'
      });
    }

    return instructions;
  }

  validateConfiguration() {
    const errors = [];
    const warnings = [];

    // Check NASA API key
    if (!this.nasaApiKey || this.nasaApiKey === 'DEMO_KEY') {
      warnings.push('NASA API key is not configured. Using demo key with limited functionality.');
    }

    // Check AI configuration
    if (!this.openaiApiKey && !this.useFreeAgent && !this.useOllama && !this.huggingfaceApiKey) {
      warnings.push('No AI service configured. Set USE_FREE_AGENT=true for basic functionality or add an API key.');
    }

    return { errors, warnings };
  }
}

export default Config;
