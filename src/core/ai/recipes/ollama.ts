import type { Recipe } from '../types.ts';

export const ollama: Recipe = {
  id: 'ollama',
  name: 'Ollama (local)',
  tier: 'openai-compat',
  implementation: 'openai-compatible',
  base_url_default: 'http://localhost:11434/v1',
  auth_env: {
    required: [], // Ollama runs unauthenticated locally; users pass `ollama` as the key.
    optional: ['OLLAMA_BASE_URL', 'OLLAMA_API_KEY'],
    setup_url: 'https://ollama.ai',
  },
  touchpoints: {
    embedding: {
      models: ['nomic-embed-text', 'mxbai-embed-large', 'all-minilm', 'bge-m3', 'qwen3-embedding'],
      default_dims: 768, // nomic-embed-text native dim
      cost_per_1m_tokens_usd: 0,
      price_last_verified: '2026-04-20',
      // Custom: Ollama on CPU processes embedding inputs serially (~15s/chunk
      // for bge-m3). Without batch caps, gateway sends a single embedMany()
      // call with the entire input array, hitting HTTP timeout on large batches.
      // Pre-split at 10K chars (= max_batch_tokens × safety_factor / chars_per_token)
      // = ~3 typical chunks per batch; recursive halving on token-limit fallback.
      max_batch_tokens: 40000,
      safety_factor: 1.0,
      chars_per_token: 4,
    },
  },
  setup_hint: 'Install Ollama from https://ollama.ai, then `ollama pull nomic-embed-text` and `ollama serve`.',
};
