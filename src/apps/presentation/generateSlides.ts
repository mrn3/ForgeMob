/**
 * Generate slide outline from a prompt using a free LLM.
 * Default: Ollama (local, no API key). Set VITE_AI_API_URL to override.
 * Optional placeholder images via Picsum (free, no key).
 */

export type GeneratedSlideInput = {
  title: string
  content: string
}

const DEFAULT_OLLAMA_BASE = '/api/ollama'
const SLIDE_PROMPT = `You are a presentation outline generator. Given the user's topic or prompt, respond with a JSON array of slides. Each slide must have exactly: "title" (string, short heading) and "content" (string, body text; use \\n for line breaks, keep concise). Use 4-8 slides. First slide is usually a title slide, then content slides. Output only the JSON array, no markdown or explanation. Example format: [{"title":"Introduction","content":"Key point 1\\nKey point 2"},{"title":"Details","content":"More info here"}]`

function getApiBase(): string {
  return (import.meta.env.VITE_AI_API_URL as string) || DEFAULT_OLLAMA_BASE
}

function extractJsonArray(text: string): GeneratedSlideInput[] {
  const trimmed = text.trim()
  // Strip markdown code block if present
  let raw = trimmed
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeMatch) raw = codeMatch[1].trim()
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) throw new Error('Response is not a JSON array')
  return parsed.map((item) => {
    if (item && typeof item === 'object' && 'title' in item && 'content' in item) {
      return {
        title: String((item as { title: unknown }).title),
        content: String((item as { content: unknown }).content),
      }
    }
    throw new Error('Each slide must have title and content')
  })
}

/**
 * Call Ollama /api/generate (or compatible endpoint). Uses stream: false for one response.
 */
export async function generateSlideOutlineFromPrompt(prompt: string): Promise<GeneratedSlideInput[]> {
  const base = getApiBase().replace(/\/$/, '')
  const url = `${base}/api/generate`
  const body = {
    model: (import.meta.env.VITE_AI_MODEL as string) || 'llama3.2',
    prompt: `${SLIDE_PROMPT}\n\nUser topic: ${prompt}`,
    stream: false,
    format: 'json',
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    if (res.status === 404 || errText.includes('connection refused') || errText.includes('Failed to fetch')) {
      throw new Error(
        'Cannot reach AI service. For local AI, install Ollama (ollama.com) and run: ollama run llama3.2'
      )
    }
    throw new Error(errText || `AI request failed: ${res.status}`)
  }

  const data = (await res.json()) as { response?: string }
  const responseText = data.response
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Invalid AI response format')
  }

  return extractJsonArray(responseText)
}

/** Picsum placeholder image URL (free, no API key). Deterministic per seed. */
export function placeholderImageUrl(seed: string, width = 720, height = 405): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}
