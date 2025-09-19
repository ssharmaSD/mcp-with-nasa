import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NASAImageAgent from './agent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize the NASA Image Agent
const agent = new NASAImageAgent();

// Initialize agent on startup
agent.initialize().catch(console.error);

// Routes
app.get('/api/image-of-the-day', async (req, res) => {
  try {
    const { date, hd, analyze } = req.query;
    
    if (analyze === 'true') {
      const result = await agent.getImageOfTheDayWithAnalysis(date, hd === 'true');
      res.json(result);
    } else {
      const result = await agent.mcpClient.getImageOfTheDay(date, hd === 'true');
      res.json(result);
    }
  } catch (error) {
    console.error('Error getting image of the day:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/image-info/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await agent.mcpClient.getImageInfo(date);
    res.json(result);
  } catch (error) {
    console.error('Error getting image info:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { start_date, end_date, count, analyze } = req.query;
    
    if (analyze === 'true') {
      const result = await agent.searchAndAnalyze(start_date, end_date, parseInt(count) || 5);
      res.json(result);
    } else {
      const result = await agent.mcpClient.searchAPOD(start_date, end_date, parseInt(count) || 10);
      res.json(result);
    }
  } catch (error) {
    console.error('Error searching APOD:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ask', async (req, res) => {
  try {
    const { question, imageUrl } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const answer = await agent.answerQuestion(question, imageUrl);
    res.json({ answer });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageUrl, question } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const analysis = await agent.analyzeImage(imageUrl, question);
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/context', async (req, res) => {
  try {
    const context = await agent.getConversationContext();
    res.json(context);
  } catch (error) {
    console.error('Error getting context:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Agent status
app.get('/api/agent-status', (req, res) => {
  try {
    const agentInfo = agent.getAgentInfo();
    res.json(agentInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await agent.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await agent.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 NASA MCP Server running on http://localhost:${PORT}`);
  console.log(`📡 MCP Server available at stdio`);
  console.log(`🔬 Agentic capabilities enabled`);
});
