/**
 * ForcaMaster - AI Service (Google Gemini API - BYOK)
 * Gera palavras secretas personalizadas e dicas ricas com base em qualquer tema digitado pelo usuário.
 */

const GEMINI_KEY_STORAGE = 'forcamaster_gemini_api_key';

export class AIService {
  constructor() {
    this.apiKey = localStorage.getItem(GEMINI_KEY_STORAGE) || '';
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : '';
    if (this.apiKey) {
      localStorage.setItem(GEMINI_KEY_STORAGE, this.apiKey);
    } else {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Gera uma palavra secreta e dica contextual via Google Gemini
   */
  async generateWordChallenge(themePrompt, difficulty = 'medio') {
    if (!this.apiKey) {
      throw new Error('Chave da API do Google Gemini não configurada.');
    }

    const systemPrompt = `Você é um gerador de desafios do Jogo da Forca em Língua Portuguesa (pt-BR).
O usuário deseja um desafio sobre o tema: "${themePrompt}". Nível de dificuldade: "${difficulty}".
Retorne OBRIGATORIAMENTE APENAS um objeto JSON válido (sem blocos de código markdown ou texto adicional) com o seguinte formato:
{
  "word": "PALAVRA",
  "category": "Nome Curto do Tema",
  "hint": "Uma dica inteligente e desafiadora que ajude a adivinhar sem entregar a resposta diretamente",
  "difficulty": "${difficulty}"
}
Regras:
1. "word" deve ser uma palavra ou termo de 4 a 14 letras em português, SEM números ou caracteres especiais (exceto hífen se for palavra composta).
2. Não coloque acentos na palavra ("word" deve estar em caixa alta pura, ex: "ESFINGE", "FOTOSSINTESE").
3. A dica deve ser em português claro e estimulante.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `Erro na API Gemini (${response.status})`;
      throw new Error(msg);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('A IA retornou uma resposta vazia.');
    }

    // Extrai o JSON da resposta (mesmo se vier envelopado em ```json ```)
    const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não foi possível interpretar a resposta estruturada da IA.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.word || parsed.word.length < 3) {
      throw new Error('Palavra gerada é inválida.');
    }

    return {
      word: parsed.word.toUpperCase().trim(),
      category: parsed.category || themePrompt,
      hint: parsed.hint || 'Sem dica disponível.',
      difficulty: parsed.difficulty || difficulty
    };
  }
}

export const aiService = new AIService();
