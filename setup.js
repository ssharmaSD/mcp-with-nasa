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

  console.log('Please provide your API keys:');
  console.log('(You can get a NASA API key for free at https://api.nasa.gov/)');
  console.log('(You can get an OpenAI API key at https://platform.openai.com/)\n');

  const nasaKey = await question('NASA API Key: ');
  const openaiKey = await question('OpenAI API Key: ');
  const port = await question('Web server port (default: 3000): ') || '3000';
  const mcpPort = await question('MCP server port (default: 3001): ') || '3001';

  // Create .env file
  const envContent = `# NASA API Key (get from https://api.nasa.gov/)
NASA_API_KEY=${nasaKey}

# OpenAI API Key for agentic capabilities
OPENAI_API_KEY=${openaiKey}

# Server Configuration
PORT=${port}
MCP_SERVER_PORT=${mcpPort}
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

  console.log('\n🎉 Setup complete!');
  console.log('\nTo start the application:');
  console.log('  npm start');
  console.log('\nTo run the CLI tool:');
  console.log('  npm run client');
  console.log('\nTo run just the MCP server:');
  console.log('  npm run mcp-server');
  console.log('\nThen open your browser to http://localhost:' + port);

  rl.close();
}

setup().catch(console.error);
