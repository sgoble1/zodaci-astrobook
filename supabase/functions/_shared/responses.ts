import { createOpenAI } from "npm:@ai-sdk/openai@4.0.83";
import { streamText, type ModelMessage } from "npm:ai@7.0.127";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const CHAT_MODEL = "openai/gpt-6-astra";

/** Streams one Responses call through Lovable AI Gateway. Create per request. */
export function createResponsesCall(
  request: Request,
  config: { apiKey: string; instructions: string; effort?: "low" | "medium" | "high" },
  messages: ModelMessage[],
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(CHAT_MODEL),
    instructions: config.instructions,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: config.effort ?? "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return {
    result,
    runIdFetch,
    wrap: (response: Response, init?: HeadersInit) => withLovableAiGatewayRunIdHeader(response, runIdFetch, init),
  };
}

/** Maps gateway/SDK failures to a friendly message and the upstream status. */
export function gatewayError(e: unknown): { status: number; message: string } {
  const status = (e as { statusCode?: number })?.statusCode ?? (e as { lastError?: { statusCode?: number } })?.lastError?.statusCode ?? 500;
  if (status === 429) return { status, message: "Too many requests right now — please wait a moment and try again." };
  if (status === 402) return { status, message: "AI credits have run out. Add credits in Settings → Plans & credits." };
  if (status === 403) return { status, message: "AI access is currently blocked for this workspace." };
  return { status: status >= 400 ? status : 500, message: "The AI could not respond right now. Please try again." };
}
