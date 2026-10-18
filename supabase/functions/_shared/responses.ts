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
  config: { apiKey: string; instructions: string; effort?: "low" | "medium" | "high"; background?: boolean; signal?: AbortSignal },
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
    maxOutputTokens: 6000,
    maxRetries: 1,
    // Background jobs must outlive the browser request that started them.
    abortSignal: AbortSignal.any([AbortSignal.timeout(180000), ...(config.background ? [] : [request.signal]), ...(config.signal ? [config.signal] : [])]),
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

/** Finds an HTTP status anywhere in a wrapped SDK error (statusCode, lastError, cause, retry errors[]). */
function findStatus(e: unknown, depth = 0): number | null {
  if (!e || typeof e !== "object" || depth > 4) return null;
  const o = e as Record<string, unknown>;
  const direct = o.statusCode ?? o.status;
  if (typeof direct === "number" && direct >= 400 && direct < 600) return direct;
  for (const key of ["lastError", "cause", "error"]) {
    const s = findStatus(o[key], depth + 1);
    if (s) return s;
  }
  if (Array.isArray(o.errors)) {
    for (const inner of o.errors) {
      const s = findStatus(inner, depth + 1);
      if (s) return s;
    }
  }
  return null;
}

/** Maps gateway/SDK failures to a friendly message and the upstream status. */
export function gatewayError(e: unknown): { status: number; message: string } {
  const status = findStatus(e) ?? 500;
  if (status === 429) return { status, message: "Too many requests right now — please wait a moment and try again." };
  if (status === 402) return { status, message: "AI credits have run out. Add credits in Settings → Plans & credits." };
  if (status === 403) return { status, message: "AI access is currently blocked for this workspace." };
  return { status: status >= 400 ? status : 500, message: "The AI could not respond right now. Please try again." };
}
