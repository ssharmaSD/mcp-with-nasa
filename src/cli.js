#!/usr/bin/env node

import NASAMCPClient from './client.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class NASACLI {
  constructor() {
    this.client = new NASAMCPClient();
  }

  async start() {
    console.log('🚀 NASA MCP CLI - Connecting to server...');
    
    try {
      await this.client.connect();
      console.log('✅ Connected to NASA MCP Server');
      this.showHelp();
      this.promptUser();
    } catch (error) {
      console.error('❌ Failed to connect:', error.message);
      process.exit(1);
    }
  }

  showHelp() {
    console.log('\n📖 Available commands:');
    console.log('  today [--hd] [--analyze]  - Get today\'s APOD');
    console.log('  date <MM/DD/YYYY>         - Get APOD for specific date');
    console.log('  search <start> <end>      - Search APOD by date range');
    console.log('  tools                     - List available tools');
    console.log('  help                      - Show this help');
    console.log('  exit                      - Exit the CLI');
    console.log('');
  }

  promptUser() {
    rl.question('nasa> ', async (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      try {
        await this.handleCommand(command, args);
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
      
      this.promptUser();
    });
  }

  async handleCommand(command, args) {
    switch (command.toLowerCase()) {
      case 'today':
        await this.getToday(args);
        break;
      case 'date':
        await this.getDate(args[0]);
        break;
      case 'search':
        await this.search(args[0], args[1]);
        break;
      case 'tools':
        await this.listTools();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'exit':
        console.log('👋 Goodbye!');
        await this.client.disconnect();
        process.exit(0);
        break;
      default:
        console.log('❌ Unknown command. Type "help" for available commands.');
    }
  }

  async getToday(args) {
    const hd = args.includes('--hd');
    const analyze = args.includes('--analyze');
    
    console.log('📡 Fetching today\'s APOD...');
    
    const result = await this.client.getImageOfTheDay(null, hd);
    
    if (result.content && result.content.length > 0) {
      const textContent = result.content.find(c => c.type === 'text');
      const imageContent = result.content.find(c => c.type === 'image_url');
      
      if (textContent) {
        console.log('\n' + textContent.text);
      }
      
      if (imageContent && imageContent.image_url) {
        console.log(`\n🖼️  Image URL: ${imageContent.image_url.url}`);
      }
    }
  }

  async getDate(date) {
    if (!date) {
      console.log('❌ Please provide a date in MM/DD/YYYY format');
      return;
    }
    
    console.log(`📡 Fetching APOD for ${date}...`);
    
    const result = await this.client.getImageInfo(date);
    
    if (result.content && result.content.length > 0) {
      const textContent = result.content[0];
      console.log('\n' + textContent.text);
    }
  }

  async search(startDate, endDate) {
    if (!startDate || !endDate) {
      console.log('❌ Please provide both start and end dates in MM/DD/YYYY format');
      return;
    }
    
    console.log(`📡 Searching APOD from ${startDate} to ${endDate}...`);
    
    const result = await this.client.searchAPOD(startDate, endDate, 10);
    
    if (result.content && result.content.length > 0) {
      const textContent = result.content[0];
      console.log('\n' + textContent.text);
    }
  }

  async listTools() {
    console.log('📋 Available MCP tools:');
    
    const result = await this.client.listTools();
    
    if (result.tools) {
      result.tools.forEach(tool => {
        console.log(`\n🔧 ${tool.name}`);
        console.log(`   ${tool.description}`);
        if (tool.inputSchema && tool.inputSchema.properties) {
          const props = Object.keys(tool.inputSchema.properties);
          if (props.length > 0) {
            console.log(`   Parameters: ${props.join(', ')}`);
          }
        }
      });
    }
  }
}

const cli = new NASACLI();
cli.start().catch(console.error);
