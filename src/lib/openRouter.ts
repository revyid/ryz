// src/lib/openRouter.ts
interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

const SYSTEM_PROMPT = `You are Ryz, an AI assistant for AI Vision platform. Follow these guidelines:
- Be helpful, friendly and professional
- Keep responses concise but informative
- Format responses with proper spacing for readability
- For code, use markdown formatting
- If unsure, ask clarifying questions
- Don't make up information you don't know`;

export const sendToOpenRouter = async (messages: OpenRouterMessage[], apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "I cannot connect to the AI service at the moment. Please check back later.";
  }

  try {
    // Prepend system prompt to messages
    const messagesWithSystemPrompt = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://your-site.com',
        'X-Title': 'AI Vision Assistant'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        messages: messagesWithSystemPrompt
      } as OpenRouterRequest)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API returned ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter Error:', error);
    return "Sorry, I encountered an error processing your request. Please try again.";
  }
};