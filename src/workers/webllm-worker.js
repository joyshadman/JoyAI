// WebLLM Worker - ES Module version
// This worker handles WebLLM engine operations in a separate thread
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Create the handler instance
const handler = new WebWorkerMLCEngineHandler();

// Set up message handling
self.onmessage = (msg) => {
  handler.onmessage(msg);
};
