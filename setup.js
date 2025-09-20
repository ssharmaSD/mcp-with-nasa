#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🚀 NASA APOD with MCP and AI Agent - Setup');
  console.log('==========================================\n');

  // Check if .env already exists
  if (fs.existsSync('.env')) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  console.log('🔑 API Key Configuration:');
  console.log('You can use your own API keys or use the provided fallback keys.\n');

  // NASA API Key
  const nasaKey = await question('Enter your NASA API key (or press Enter to use fallback): ');
  
  // AI Configuration
  console.log('\n🤖 AI Configuration Options:');
  console.log('1. OpenAI (paid, best quality)');
  console.log('2. Free Agent (no costs, basic functionality)');
  console.log('3. Ollama (local, free, requires installation)');
  console.log('4. Hugging Face (free API, limited)');
  
  const aiChoice = await question('Choose AI option (1-4, default: 2): ');
  
  let envContent = `# NASA API Key (get from https://api.nasa.gov/)
NASA_API_KEY=${nasaKey || 'your_nasa_api_key_here'}

`;

  switch (aiChoice) {
    case '1':
      const openaiKey = await question('Enter your OpenAI API key: ');
      envContent += `# OpenAI API Key (paid, best quality)
OPENAI_API_KEY=${openaiKey || 'your_openai_api_key_here'}
USE_FREE_AGENT=false

`;
      break;
    case '3':
      const ollamaHost = await question('Enter Ollama host (default: http://localhost:11434): ');
      envContent += `# Ollama Configuration (local, free)
OLLAMA_HOST=${ollamaHost || 'http://localhost:11434'}
USE_OLLAMA=true
USE_FREE_AGENT=false

`;
      break;
    case '4':
      const hfKey = await question('Enter your Hugging Face API key: ');
      envContent += `# Hugging Face API Key (free API, limited)
HUGGINGFACE_API_KEY=${hfKey || 'your_huggingface_api_key_here'}
USE_FREE_AGENT=false

`;
      break;
    default:
      envContent += `# Free Agent Mode (no costs)
USE_FREE_AGENT=true

`;
  }

  // Server Configuration
  const port = await question('Enter server port (default: 3000): ');
  const mcpPort = await question('Enter MCP server port (default: 3001): ');
  
  envContent += `# Server Configuration
PORT=${port || '3000'}
MCP_SERVER_PORT=${mcpPort || '3001'}
`;

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ .env file created successfully!');

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }

  // Show configuration summary
  console.log('\n📋 Configuration Summary:');
  console.log(`🌍 NASA API: ${nasaKey ? 'Your key' : 'Fallback key'}`);
  
  switch (aiChoice) {
    case '1':
      console.log(`🤖 OpenAI: ${openaiKey ? 'Your key' : 'Not configured'}`);
      break;
    case '3':
      console.log('🤖 Ollama: Local installation');
      break;
    case '4':
      console.log(`🤖 Hugging Face: ${hfKey ? 'Your key' : 'Not configured'}`);
      break;
    default:
      console.log('🤖 Free Agent: Basic functionality');
  }
  
  console.log(`🌐 Server Port: ${port || '3000'}`);
  console.log(`📡 MCP Port: ${mcpPort || '3001'}`);

  console.log('\n🎉 Setup complete!');
  console.log('\nTo start the application:');
  console.log('  npm start');
  console.log('\nTo run the CLI tool:');
  console.log('  npm run client');
  console.log('\nTo run just the MCP server:');
  console.log('  npm run mcp-server');
  console.log('\nThen open your browser to http://localhost:' + (port || '3000'));
  console.log('\n📖 Visit http://localhost:' + (port || '3000') + '/api/config-status to check configuration');

  rl.close();
}

setup().catch(console.error);
