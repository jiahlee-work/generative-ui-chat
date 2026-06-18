import { readFileSync } from "fs";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { join } from "path";

const geminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
const systemPrompt = readFileSync(join(process.cwd(), "src/generated/system-prompt.txt"), "utf-8");

export class MissingGeminiApiKeyError extends Error {
  constructor() {
    super("Gemini API 키가 설정되지 않았습니다.");
    this.name = "MissingGeminiApiKeyError";
  }
}

export async function createGeminiChatStream(messages: ChatCompletionMessageParam[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new MissingGeminiApiKeyError();
  }

  const client = new OpenAI({
    apiKey,
    baseURL: geminiBaseUrl,
  });
  const response = await client.chat.completions.create({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
  });

  return response.toReadableStream();
}

export function getGeminiProviderStatus(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return typeof error.status === "number" ? error.status : null;
}

export function getGeminiInternalErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function isMissingGeminiApiKeyError(error: unknown) {
  return error instanceof MissingGeminiApiKeyError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
