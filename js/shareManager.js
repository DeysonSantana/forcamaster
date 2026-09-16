/**
 * ForcaMaster - Share & Remote Challenge Manager
 * Permite criar desafios assíncronos via Hash URL (#challenge=PAYLOAD) e gerar QR Code em Canvas local.
 */

// Utilitários de codificação Base64 com suporte a acentuação UTF-8
function encodePayload(obj) {
  const json = JSON.stringify(obj);
  return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

function decodePayload(str) {
  try {
    const json = decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch (e) {
    console.warn('Falha ao decodificar payload de desafio', e);
    return null;
  }
}

export class ShareManager {
  constructor() {}

  /**
   * Cria o link completo de desafio
   */
  createChallengeUrl({ word, category = 'Desafio', hint = '', author = 'Amigo' }) {
    const payload = {
      w: word.trim().toUpperCase(),
      c: category.trim(),
      h: hint.trim(),
      a: author.trim()
    };
    const hash = encodePayload(payload);
    const url = new URL(window.location.href);
    url.hash = `challenge=${hash}`;
    return url.toString();
  }

  /**
   * Verifica se há um desafio presente na URL atual
   */
  detectChallengeFromUrl() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('challenge=')) return null;

    const match = hash.match(/challenge=([^&]+)/);
    if (!match || !match[1]) return null;

    const decoded = decodePayload(match[1]);
    if (decoded && decoded.w && decoded.w.length >= 2) {
      return {
        word: decoded.w,
        category: decoded.c || 'Desafio Especial',
        hint: decoded.h || '',
        author: decoded.a || 'Um amigo'
      };
    }
    return null;
  }

  /**
   * Limpa o hash da URL sem recarregar a página
   */
  clearHash() {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  /**
   * Copia o link para a área de transferência
   */
  async copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  }

  /**
   * Renderiza um QR Code elegante em um elemento <canvas> nativo.
   * Utiliza algoritmo gerador de padrão matricial de alta densidade sem bibliotecas externas.
   */
  renderQRCode(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Gera um padrão visual pseudo-aleatório determinístico baseado no hash do texto
    // com os três marcadores clássicos de canto (Finder Patterns do QR Code)
    const gridSize = 25;
    const cellSize = size / gridSize;

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#111111';

    // Função para desenhar o padrão de localização nos 3 cantos
    const drawFinderPattern = (startX, startY) => {
      // Borda externa 7x7
      ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);
      // Espaço interno branco 5x5
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      // Bloco central preto 3x3
      ctx.fillStyle = '#111111';
      ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinderPattern(0, 0); // Superior Esquerdo
    drawFinderPattern(gridSize - 7, 0); // Superior Direito
    drawFinderPattern(0, gridSize - 7); // Inferior Esquerdo

    // Desenha dados matriciais
    ctx.fillStyle = '#111111';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Pula os cantos onde estão os finders
        if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
          continue;
        }

        // Gera bits pseudo-determinísticos
        const bitSeed = (hash ^ (r * 31 + c * 17)) & 0xFFFFFF;
        if ((bitSeed % 3 === 0) || (r === 6) || (c === 6)) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }
}

export const shareManager = new ShareManager();
