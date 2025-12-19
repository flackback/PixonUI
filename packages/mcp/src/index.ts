import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UI_SRC_PATH = path.resolve(__dirname, "../../../ui/src");

const server = new Server(
  {
    name: "pixonui-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_components",
        description: "List all available PixonUI components",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_component_info",
        description: "Get detailed information about a specific component including its props and usage",
        inputSchema: {
          type: "object",
          properties: {
            componentName: {
              type: "string",
              description: "The name of the component (e.g., Button, Card, Dialog)",
            },
          },
          required: ["componentName"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_components") {
    try {
      const componentsDir = path.join(UI_SRC_PATH, "components");
      const categories = await fs.readdir(componentsDir);
      let allComponents: string[] = [];

      for (const category of categories) {
        const categoryPath = path.join(componentsDir, category);
        const stats = await fs.stat(categoryPath);
        if (stats.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          allComponents = allComponents.concat(
            files
              .filter(f => (f.endsWith(".tsx") || f.endsWith(".ts")) && !f.includes(".test."))
              .map(f => f.replace(/\.(tsx|ts)$/, ""))
          );
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `Available PixonUI Components:\n${allComponents.sort().join("\n")}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error listing components: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === "get_component_info") {
    const componentName = args?.componentName as string;
    try {
      const componentsDir = path.join(UI_SRC_PATH, "components");
      const categories = await fs.readdir(componentsDir);
      let componentPath = "";

      for (const category of categories) {
        const categoryPath = path.join(componentsDir, category);
        const stats = await fs.stat(categoryPath);
        if (stats.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          const match = files.find(f => f.toLowerCase() === `${componentName.toLowerCase()}.tsx` || f.toLowerCase() === `${componentName.toLowerCase()}.ts`);
          if (match) {
            componentPath = path.join(categoryPath, match);
            break;
          }
        }
      }

      if (!componentPath) {
        return {
          content: [{ type: "text", text: `Component "${componentName}" not found.` }],
          isError: true,
        };
      }

      const content = await fs.readFile(componentPath, "utf-8");
      
      // Simple regex to extract props interface
      const propsMatch = content.match(/interface\s+(\w+Props)\s*{([^}]+)}/);
      const props = propsMatch ? propsMatch[0] : "Props interface not found";

      // Generate a simple usage example based on component name
      const usage = `import { ${componentName} } from '@pixonui/react';\n\n// Basic usage\n<${componentName}>\n  {/* children */}\n</${componentName}>`;

      return {
        content: [
          {
            type: "text",
            text: `Component: ${componentName}\n\nProps:\n${props}\n\nUsage Example:\n${usage}\n\nSource Code:\n${content}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error getting component info: ${error.message}` }],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PixonUI MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
