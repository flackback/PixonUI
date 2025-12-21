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
    version: "0.2.0",
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
      {
        name: "list_hooks",
        description: "List all available PixonUI hooks",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_hook_info",
        description: "Get detailed information about a specific hook including its parameters and usage",
        inputSchema: {
          type: "object",
          properties: {
            hookName: {
              type: "string",
              description: "The name of the hook (e.g., useChat, useKanban, useVirtualList)",
            },
          },
          required: ["hookName"],
        },
      },
      {
        name: "list_utils",
        description: "List all available PixonUI utility functions",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_util_info",
        description: "Get detailed information about a specific utility function",
        inputSchema: {
          type: "object",
          properties: {
            utilName: {
              type: "string",
              description: "The name of the utility function (e.g., formatDate, truncate, slugify)",
            },
          },
          required: ["utilName"],
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

  if (name === "list_hooks") {
    try {
      const hooksDir = path.join(UI_SRC_PATH, "hooks");
      const files = await fs.readdir(hooksDir);
      const allHooks = files
        .filter(f => (f.endsWith(".tsx") || f.endsWith(".ts")) && !f.includes(".test."))
        .map(f => f.replace(/\.(tsx|ts)$/, ""));

      return {
        content: [
          {
            type: "text",
            text: `Available PixonUI Hooks:\n${allHooks.sort().join("\n")}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error listing hooks: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === "get_hook_info") {
    const hookName = args?.hookName as string;
    try {
      const hooksDir = path.join(UI_SRC_PATH, "hooks");
      const files = await fs.readdir(hooksDir);
      const match = files.find(f => f.toLowerCase() === `${hookName.toLowerCase()}.ts` || f.toLowerCase() === `${hookName.toLowerCase()}.tsx`);

      if (!match) {
        return {
          content: [{ type: "text", text: `Hook "${hookName}" not found.` }],
          isError: true,
        };
      }

      const hookPath = path.join(hooksDir, match);
      const content = await fs.readFile(hookPath, "utf-8");
      
      // Simple regex to extract options/props interface
      const optionsMatch = content.match(/interface\s+(\w+(Options|Props))\s*{([^}]+)}/);
      const options = optionsMatch ? optionsMatch[0] : "Options interface not found";

      const usage = `import { ${hookName} } from '@pixonui/react';\n\n// Basic usage\nconst { ... } = ${hookName}({ /* options */ });`;

      return {
        content: [
          {
            type: "text",
            text: `Hook: ${hookName}\n\nOptions/Parameters:\n${options}\n\nUsage Example:\n${usage}\n\nSource Code:\n${content}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error getting hook info: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === "list_utils") {
    try {
      const utilsDir = path.join(UI_SRC_PATH, "utils");
      const files = await fs.readdir(utilsDir);
      const allUtils = files
        .filter(f => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.includes(".test.") && f !== "cn.ts")
        .map(f => f.replace(/\.(ts|tsx)$/, ""));

      return {
        content: [
          {
            type: "text",
            text: `Available PixonUI Utility Modules:\n${allUtils.sort().join("\n")}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error listing utils: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === "get_util_info") {
    const utilName = args?.utilName as string;
    try {
      const utilsDir = path.join(UI_SRC_PATH, "utils");
      const files = await fs.readdir(utilsDir);
      const match = files.find(f => f.toLowerCase() === `${utilName.toLowerCase()}.ts` || f.toLowerCase() === `${utilName.toLowerCase()}.tsx`);

      if (!match) {
        return {
          content: [{ type: "text", text: `Utility module "${utilName}" not found.` }],
          isError: true,
        };
      }

      const utilPath = path.join(utilsDir, match);
      const content = await fs.readFile(utilPath, "utf-8");
      
      return {
        content: [
          {
            type: "text",
            text: `Utility Module: ${utilName}\n\nSource Code:\n${content}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error getting util info: ${error.message}` }],
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
