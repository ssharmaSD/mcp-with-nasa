# NASA APOD with MCP and AI Agent

A comprehensive project that uses the Model Context Protocol (MCP) to pull NASA's Astronomy Picture of the Day (APOD) and provides agentic capabilities for answering questions about space images using AI.

Note: This project was developed with the help of Cursor!

## 🌟 Features

- **MCP Integration**: Full Model Context Protocol implementation for NASA API
- **AI-Powered Analysis**: GPT-4 Vision integration for image analysis
- **Interactive Web Interface**: Beautiful, responsive web UI
- **CLI Tool**: Command-line interface for testing MCP functionality
- **Agentic Q&A**: Ask questions about space images and get intelligent answers
- **Image Search**: Search APOD images by date range
- **HD Support**: Access high-definition versions of images

## 🌐 Live Demo

**GitHub Pages**: [View Live Demo](https://ssharmaSD.github.io/mcp-with-nasa/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- **Optional**: NASA API key (free at [api.nasa.gov](https://api.nasa.gov/))
- **Optional**: AI API key (multiple free options available!)

### Installation

#### Option 1: Quick Start (Uses Fallback Keys)

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd mcp-with-nasa
   npm install
   ```

2. **Start immediately:**
   ```bash
   npm start
   ```
   
   The application will use fallback API keys and work out of the box! 🎉

#### Option 2: Use Your Own API Keys

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd mcp-with-nasa
   npm install
   ```

2. **Run the setup script:**
   ```bash
   npm run setup
   ```
   
   This interactive script will help you configure your API keys and AI options.

3. **Start the application:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### 🔑 API Key Options

#### NASA API (Required for APOD data)
- **Free**: Get your key at [api.nasa.gov](https://api.nasa.gov/)
- **Fallback**: Uses demo key with limited functionality

#### AI Capabilities (Optional)
- **OpenAI** (Paid, best quality): Get key at [platform.openai.com](https://platform.openai.com/)
- **Free Agent** (No costs): Basic astronomy knowledge and pattern recognition
- **Ollama** (Local, free): Install [Ollama](https://ollama.ai/) for local AI
- **Hugging Face** (Free API): Get key at [huggingface.co](https://huggingface.co/)

### 📊 Configuration Status

Check your configuration at: `http://localhost:3000/api/config-status`

## 📖 Usage

### Web Interface

The web interface provides:
- **Today's Image**: View NASA's current APOD
- **AI Analysis**: Get AI-powered analysis of images
- **Chat Interface**: Ask questions about images
- **Date Selection**: View images from specific dates
- **HD Images**: Access high-definition versions

### CLI Tool

Run the command-line interface:
```bash
npm run client
```

Available commands:
- `today [--hd] [--analyze]` - Get today's APOD
- `date <MM/DD/YYYYs>` - Get APOD for specific date
- `search <start> <end>` - Search APOD by date range
- `tools` - List available MCP tools
- `help` - Show help
- `exit` - Exit the CLI

### MCP Server

Run the MCP server standalone:
```bash
npm run mcp-server
```

## 🏗️ Architecture

### Components

1. **MCP Server** (`src/mcp-server.js`)
   - Implements Model Context Protocol
   - Provides tools for NASA API integration
   - Handles image retrieval and metadata

2. **MCP Client** (`src/client.js`)
   - Connects to MCP server
   - Provides easy-to-use API for NASA data
   - Handles communication protocols

3. **AI Agent** (`src/agent.js`)
   - Integrates OpenAI GPT-4 Vision
   - Provides image analysis capabilities
   - Handles Q&A about space images

4. **Web Server** (`src/index.js`)
   - Express.js REST API
   - Serves web interface
   - Coordinates between components

5. **Web Interface** (`public/index.html`)
   - Modern, responsive UI
   - Real-time chat interface
   - Image display and controls

### MCP Tools

The MCP server provides these tools:

- `get_image_of_the_day`: Get NASA's APOD
- `get_image_info`: Get detailed image information
- `search_apod`: Search images by date range

## 🔧 API Endpoints

### REST API

- `GET /api/image-of-the-day?date=&hd=&analyze=` - Get APOD
- `GET /api/image-info/:date` - Get image info for specific date
- `GET /api/search?start_date=&end_date=&count=&analyze=` - Search APOD
- `POST /api/ask` - Ask questions about images
- `POST /api/analyze-image` - Analyze specific image
- `GET /api/context` - Get conversation context
- `GET /api/health` - Health check

### Example API Usage

```javascript
// Get today's image with AI analysis
const response = await fetch('/api/image-of-the-day?analyze=true');
const data = await response.json();

// Ask a question about the current image
const answer = await fetch('/api/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: "What type of galaxy is shown in this image?",
    imageUrl: "https://apod.nasa.gov/apod/image/..."
  })
});
```

## 🤖 Agentic Capabilities

The AI agent can:

- **Analyze Images**: Describe what's shown in space images
- **Answer Questions**: Respond to queries about astronomy and space
- **Provide Context**: Explain scientific concepts and phenomena
- **Search and Compare**: Analyze multiple images from different dates
- **Educational Content**: Offer detailed explanations suitable for learning

### Example Questions

- "What type of celestial object is this?"
- "Explain the physics behind this phenomenon"
- "How far away is this object?"
- "What telescope captured this image?"
- "Compare this image to similar astronomical objects"

## 🛠️ Development

### Project Structure

```
mcp-with-nasa/
├── src/
│   ├── mcp-server.js    # MCP server implementation
│   ├── client.js        # MCP client
│   ├── agent.js         # AI agent with OpenAI integration
│   ├── index.js         # Express web server
│   └── cli.js           # Command-line interface
├── public/
│   └── index.html       # Web interface
├── package.json         # Dependencies and scripts
├── env.example          # Environment variables template
└── README.md           # This file
```

### Scripts

- `npm start` - Start the web server
- `npm run dev` - Start with auto-reload
- `npm run mcp-server` - Run MCP server only
- `npm run client` - Run CLI tool

### Adding New Features

1. **New MCP Tools**: Add to `src/mcp-server.js`
2. **API Endpoints**: Add to `src/index.js`
3. **AI Capabilities**: Extend `src/agent.js`
4. **UI Components**: Modify `public/index.html`

## 🔐 Security Notes

- Store API keys in environment variables
- Never commit `.env` files to version control
- Use HTTPS in production
- Implement rate limiting for production use

## 🔑 Fallback API Keys

This repository includes fallback API keys that allow users to run the application immediately without setting up their own keys:

- **NASA API**: Uses demo key with limited functionality
- **OpenAI API**: Not included (users must provide their own or use free alternatives)

### Using Your Own Keys

To use your own API keys:

1. **Run the setup script:**
   ```bash
   npm run setup
   ```

2. **Or manually edit `.env`:**
   ```env
   # NASA API Key (get from https://api.nasa.gov/)
   NASA_API_KEY=your_nasa_api_key_here
   
   # AI Configuration (choose one)
   OPENAI_API_KEY=your_openai_api_key_here
   # OR
   USE_FREE_AGENT=true
   # OR
   OLLAMA_HOST=http://localhost:11434
   USE_OLLAMA=true
   # OR
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   
   # Server Configuration
   PORT=3000
   MCP_SERVER_PORT=3001
   ```

### Configuration Status

The application provides real-time configuration status:

- **Web Interface**: Visit `/api/config-status` for detailed status
- **Console Output**: Shows configuration status on startup
- **Agent Status**: Visit `/api/agent-status` for AI capabilities

## 📚 Learning Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [NASA API Documentation](https://api.nasa.gov/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Astronomy Picture of the Day](https://apod.nasa.gov/)

## 🌐 GitHub Pages Deployment

This project is automatically deployed to GitHub Pages! 

### View Live Demo
- **Live Site**: https://ssharmaSD.github.io/mcp-with-nasa/
- **Repository**: https://github.com/ssharmaSD/mcp-with-nasa

### Deploy Your Own
1. Fork this repository
2. Go to Settings → Pages
3. Select "GitHub Actions" as source
4. The site will automatically deploy on every push to main

### Custom Domain (Optional)
1. Add a `CNAME` file with your domain
2. Configure DNS to point to `ssharmaSD.github.io`
3. Enable HTTPS in GitHub Pages settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- NASA for providing the amazing APOD API
- OpenAI for GPT-4 Vision capabilities
- The MCP community for protocol development