import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const orders = {
  "1001": { orderId: "1001", status: "Shipped", item: "Wireless Mouse" },
  "1002": { orderId: "1002", status: "Processing", item: "Keyboard" },
  "1003": { orderId: "1003", status: "Delivered", item: "Monitor" },
};

const products = [
  { id: "p1", name: "Nike Running Shoes", category: "Sports" },
  { id: "p2", name: "Cotton T-Shirt", category: "Clothing" },
  { id: "p3", name: "Wireless Earbuds", category: "Electronics" },
  { id: "p4", name: "Laptop Stand", category: "Office" },
  { id: "p5", name: "Yoga Mat", category: "Fitness" },
];

function getOrderStatus(orderId: string) {
  const order = orders[orderId as keyof typeof orders];

  if (!order) {
    return {
      orderId,
      status: "Not found",
      message: "This order ID does not exist.",
    };
  }

  return order;
}

function searchProducts(query: string) {
  const searchText = query.toLowerCase();

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText),
  );
}

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_order_status",
      description: "Get the current status of an order by order ID.",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "The order ID to check.",
          },
        },
        required: ["orderId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description: "Search products using a keyword.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The product search keyword.",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
];

const toolHandlers = {
  get_order_status: ({ orderId }: { orderId: string }) => getOrderStatus(orderId),
  search_products: ({ query }: { query: string }) => searchProducts(query),
} as const;

async function demoWithoutApi() {
  const userPrompt = "Do you have any running shoes?";

  console.log("\n=== Tool-calling flow with mock data ===");
  console.log("User prompt:", userPrompt);

  const simulatedToolCall = {
    id: "call_demo_search",
    type: "function",
    function: {
      name: "search_products",
      arguments: JSON.stringify({ query: "running shoes" }),
    },
  };

  console.log("\n1) Model decides to call a tool:");
  console.log(JSON.stringify(simulatedToolCall, null, 2));

  const result = toolHandlers.search_products({ query: "running shoes" });

  console.log("\n2) Your application executes the tool function:");
  console.log(JSON.stringify(result, null, 2));

  console.log("\n3) Final answer generated for the user:");
  console.log("I found matching products: Nike Running Shoes in Sports.");
}

async function runWithGroq() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.log("GROQ_API_KEY is missing. Showing the mock tool-calling demo instead.\n");
    await demoWithoutApi();
    return;
  }

  const client = new Groq({ apiKey });
 const model = "openai/gpt-oss-20b";

  const userPrompt = "Check order 1001 and also find a t-shirt.";

  console.log("\n=== Real Groq tool-calling example ===");
  console.log("User prompt:", userPrompt);

  let firstResponse;

  try {
    firstResponse = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: userPrompt }],
      tools,
      tool_choice: "auto",
    });
  } catch (error) {
    console.log("\nGroq model request failed. Falling back to the mock demo so you can still learn the flow.\n");
    console.log(error instanceof Error ? error.message : String(error));
    await demoWithoutApi();
    return;
  }

  const assistantMessage = firstResponse.choices[0]?.message;
  const toolCalls = assistantMessage?.tool_calls ?? [];

  console.log("\n1) Model decides which tool to call:");
  console.log(JSON.stringify(toolCalls, null, 2));

  if (toolCalls.length === 0) {
    console.log("No tool call was requested.");
    console.log(assistantMessage?.content ?? "No content returned.");
    return;
  }

  const toolResults = await Promise.all(
    toolCalls.map(async (toolCall) => {
      const toolName = toolCall.function.name as keyof typeof toolHandlers;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const result = toolHandlers[toolName](toolArgs);

      return {
        id: toolCall.id,
        result,
      };
    }),
  );

  console.log("\n2) Tool results returned to the model:");
  console.log(JSON.stringify(toolResults, null, 2));

  const secondResponse = await client.chat.completions.create({
    model,
    messages: [
      { role: "user", content: userPrompt },
      {
        role: "assistant",
        tool_calls: toolCalls,
      },
      ...toolResults.map((toolResult) => ({
        role: "tool" as const,
        tool_call_id: toolResult.id,
        content: JSON.stringify(toolResult.result),
      })),
    ],
    tools,
  });

  console.log("\n3) Final answer from Groq:");
  console.log(secondResponse.choices[0]?.message?.content ?? "No final answer.");
}

async function main() {
  await runWithGroq();
}

main().catch((error) => {
  console.error("Groq tool-calling example failed:", error);
});
