#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

class NASAMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'nasa-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_image_of_the_day',
            description: 'Get NASA\'s Astronomy Picture of the Day (APOD)',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'Date in MM/DD/YYYY format (optional, defaults to today)',
                },
                hd: {
                  type: 'boolean',
                  description: 'Whether to return HD version of the image (default: false)',
                },
              },
            },
          },
          {
            name: 'get_image_info',
            description: 'Get detailed information about a specific APOD image',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'Date in MM/DD/YYYY format',
                  required: true,
                },
              },
            },
          },
          {
            name: 'search_apod',
            description: 'Search APOD images by date range',
            inputSchema: {
              type: 'object',
              properties: {
                start_date: {
                  type: 'string',
                  description: 'Start date in MM/DD/YYYY format',
                },
                end_date: {
                  type: 'string',
                  description: 'End date in MM/DD/YYYY format',
                },
                count: {
                  type: 'number',
                  description: 'Number of images to return (max 100)',
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_image_of_the_day':
            return await this.getImageOfTheDay(args);
          case 'get_image_info':
            return await this.getImageInfo(args);
          case 'search_apod':
            return await this.searchAPOD(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async getImageOfTheDay(args = {}) {
    const { date, hd = false } = args;
    
    const params = new URLSearchParams({
      api_key: NASA_API_KEY,
    });
    
    if (date) params.append('date', date);
    if (hd) params.append('hd', 'true');

    const response = await axios.get(`${NASA_API_BASE}?${params}`);
    const data = response.data;

    return {
      content: [
        {
          type: 'text',
          text: `# NASA Astronomy Picture of the Day - ${data.date}\n\n**Title:** ${data.title}\n\n**Explanation:** ${data.explanation}\n\n**Image URL:** ${hd && data.hdurl ? data.hdurl : data.url}\n\n**Copyright:** ${data.copyright || 'Public Domain'}`,
        },
        {
          type: 'image_url',
          image_url: {
            url: hd && data.hdurl ? data.hdurl : data.url,
          },
        },
      ],
    };
  }

  async getImageInfo(args) {
    const { date } = args;
    
    if (!date) {
      throw new Error('Date is required for get_image_info');
    }

    const params = new URLSearchParams({
      api_key: NASA_API_KEY,
      date: date,
    });

    const response = await axios.get(`${NASA_API_BASE}?${params}`);
    const data = response.data;

    return {
      content: [
        {
          type: 'text',
          text: `# APOD Information for ${data.date}\n\n**Title:** ${data.title}\n\n**Explanation:** ${data.explanation}\n\n**Media Type:** ${data.media_type}\n\n**Service Version:** ${data.service_version}\n\n**Copyright:** ${data.copyright || 'Public Domain'}\n\n**URL:** ${data.url}\n\n**HD URL:** ${data.hdurl || 'Not available'}`,
        },
      ],
    };
  }

  async searchAPOD(args = {}) {
    const { start_date, end_date, count = 10 } = args;
    
    const params = new URLSearchParams({
      api_key: NASA_API_KEY,
    });
    
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (count) params.append('count', Math.min(count, 100).toString());

    const response = await axios.get(`${NASA_API_BASE}?${params}`);
    const data = response.data;

    let content = `# APOD Search Results\n\nFound ${Array.isArray(data) ? data.length : 1} image(s):\n\n`;
    
    const images = Array.isArray(data) ? data : [data];
    
    images.forEach((item, index) => {
      content += `## ${index + 1}. ${item.title} (${item.date})\n`;
      content += `**Explanation:** ${item.explanation.substring(0, 200)}...\n`;
      content += `**URL:** ${item.url}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('NASA MCP Server running on stdio');
  }
}

const server = new NASAMCPServer();
server.run().catch(console.error);
