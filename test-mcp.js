#!/usr/bin/env node

import NASAMCPClient from './src/client.js';
import dotenv from 'dotenv';

dotenv.config();

async function testMCP() {
  console.log('🧪 Testing NASA MCP Integration');
  console.log('================================\n');

  const client = new NASAMCPClient();

  try {
    console.log('1. Connecting to MCP server...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    console.log('2. Listing available tools...');
    const tools = await client.listTools();
    console.log('Available tools:');
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log('');

    console.log('3. Testing NASA API connection...');
    const todayImage = await client.getImageOfTheDay();
    if (todayImage.content && todayImage.content.length > 0) {
      const textContent = todayImage.content.find(c => c.type === 'text');
      if (textContent) {
        const lines = textContent.text.split('\n');
        const title = lines.find(line => line.startsWith('**Title:**'))?.replace('**Title:**', '').trim();
        console.log(`✅ Today's APOD: ${title || 'Unknown'}`);
      }
    }
    console.log('');

    console.log('4. Testing image info for a specific date...');
    const testDate = '2024-01-01';
    const imageInfo = await client.getImageInfo(testDate);
    if (imageInfo.content && imageInfo.content.length > 0) {
      console.log(`✅ Retrieved image info for ${testDate}`);
    }
    console.log('');

    console.log('5. Testing search functionality...');
    const searchResults = await client.searchAPOD('2024-01-01', '2024-01-05', 3);
    if (searchResults.content && searchResults.content.length > 0) {
      console.log('✅ Search functionality working');
    }
    console.log('');

    console.log('🎉 All tests passed! MCP integration is working correctly.');
    console.log('\nYou can now:');
    console.log('  - Run "npm start" to start the web server');
    console.log('  - Run "npm run client" to use the CLI tool');
    console.log('  - Open http://localhost:3000 in your browser');

  } catch (error) {
    if (error.status === 403 || error.message.includes('403')) {
      console.log('❌ NASA API Error: Invalid or missing API key');
      console.log('\n🔧 To fix this:');
      console.log('  1. Get a free NASA API key from: https://api.nasa.gov/');
      console.log('  2. Edit your .env file and replace "your_nasa_api_key_here" with your actual key');
      console.log('  3. Run "npm test" again');
      console.log('\n💡 You can also run "npm run setup" to configure your API keys interactively');
    } else {
      console.error('❌ Test failed:', error.message);
      console.log('\nTroubleshooting:');
      console.log('  - Make sure you have a valid NASA_API_KEY in your .env file');
      console.log('  - Check your internet connection');
      console.log('  - Verify the MCP server can start properly');
    }
  } finally {
    await client.disconnect();
  }
}

testMCP().catch(console.error);
