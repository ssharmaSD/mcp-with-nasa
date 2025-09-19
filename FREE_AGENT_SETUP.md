# Free AI Agent Setup Guide

This guide shows you how to set up completely free AI agent capabilities for your NASA APOD project, eliminating all API costs while maintaining useful functionality.

## 🆓 Free Agent Options

### 1. Basic Mode (Default - No Setup Required)
- **Cost**: $0
- **Setup**: None required
- **Capabilities**: Knowledge-based responses, basic astronomy facts
- **Quality**: Good for educational content

**How to enable:**
```bash
echo "USE_FREE_AGENT=true" >> .env
```

### 2. Ollama (Local AI - Recommended)
- **Cost**: $0
- **Setup**: Install Ollama locally
- **Capabilities**: Full AI analysis, image understanding, local processing
- **Quality**: Excellent (comparable to paid services)

**Setup steps:**
1. Install Ollama: https://ollama.ai/
2. Pull a vision model:
   ```bash
   ollama pull llava:7b
   # or for better quality:
   ollama pull llava:13b
   ```
3. Update your .env:
   ```bash
   echo "USE_FREE_AGENT=true" >> .env
   echo "OLLAMA_HOST=http://localhost:11434" >> .env
   echo "USE_OLLAMA=true" >> .env
   ```

### 3. Hugging Face (Free API)
- **Cost**: $0 (with rate limits)
- **Setup**: Get free API key
- **Capabilities**: Image captioning, basic AI analysis
- **Quality**: Good for basic analysis

**Setup steps:**
1. Get free API key: https://huggingface.co/settings/tokens
2. Update your .env:
   ```bash
   echo "USE_FREE_AGENT=true" >> .env
   echo "HUGGINGFACE_API_KEY=your_key_here" >> .env
   ```

## 🚀 Quick Start (Basic Mode)

1. **Enable free agent mode:**
   ```bash
   echo "USE_FREE_AGENT=true" >> .env
   ```

2. **Restart the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration Examples

### Basic Mode (.env)
```env
NASA_API_KEY=your_nasa_key
USE_FREE_AGENT=true
PORT=3000
```

### Ollama Mode (.env)
```env
NASA_API_KEY=your_nasa_key
USE_FREE_AGENT=true
OLLAMA_HOST=http://localhost:11434
USE_OLLAMA=true
PORT=3000
```

### Hugging Face Mode (.env)
```env
NASA_API_KEY=your_nasa_key
USE_FREE_AGENT=true
HUGGINGFACE_API_KEY=your_hf_key
PORT=3000
```

## 📊 Feature Comparison

| Feature | Basic Mode | Ollama | Hugging Face |
|---------|------------|--------|--------------|
| Cost | $0 | $0 | $0 |
| Setup | None | Install Ollama | Get API key |
| Image Analysis | Basic | Full AI | Captioning |
| Text Generation | Knowledge-based | Full AI | Limited |
| Internet Required | Yes (NASA API) | No | Yes |
| Quality | Good | Excellent | Good |

## 🎯 Recommended Setup

**For most users**: Start with Basic Mode, then upgrade to Ollama if you want better AI capabilities.

**For developers**: Use Ollama for the best free experience with full AI capabilities.

**For quick testing**: Use Basic Mode - no setup required!

## 🔍 Troubleshooting

### Basic Mode Not Working
- Check that `USE_FREE_AGENT=true` is in your .env file
- Restart the server after changing .env

### Ollama Not Working
- Ensure Ollama is running: `ollama list`
- Check the model is installed: `ollama pull llava:7b`
- Verify the host URL in .env

### Hugging Face Not Working
- Check your API key is valid
- Ensure you have remaining free requests
- Check the API key is in .env

## 🌟 Benefits of Free Agents

1. **No API Costs**: Completely free to use
2. **Privacy**: Data stays local (with Ollama)
3. **Reliability**: No rate limits (with Basic/Ollama)
4. **Educational**: Learn about AI and astronomy
5. **Customizable**: Modify responses and add knowledge

## 📚 Next Steps

1. Try Basic Mode first
2. Install Ollama for better AI capabilities
3. Customize the knowledge base in `src/free-agent.js`
4. Add your own astronomy facts and responses

Enjoy exploring the cosmos with your free AI agent! 🌌✨
