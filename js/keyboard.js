/**
 * ForcaMaster - Keyboard Component
 * Teclado virtual ultra-responsivo com conformidade de alvos de toque (Lei de Fitts),
 * zero atraso em dispositivos móveis (touch-action), suporte bivalente a C/Ç e feedback RGB.
 */

import { sound } from './audio.js';
import { normalizeChar } from './words.js';

export class VirtualKeyboard {
  constructor(containerElement, onKeyClick) {
    this.container = containerElement;
    this.onKeyClick = onKeyClick;
    // Mapeia normChar -> Set de botões para sincronizar 'C' e 'Ç' simultaneamente
    this.keyButtons = new Map();

    // Layout ergonômico brasileiro ABNT em 3 linhas
    this.rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    this.render();
    this.attachPhysicalKeyboard();
  }

  render() {
    this.container.innerHTML = '';
    this.keyButtons.clear();

    this.rows.forEach(rowKeys => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      rowKeys.forEach(char => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'virtual-key';
        btn.textContent = char;
        btn.setAttribute('data-char', char);
        btn.setAttribute('aria-label', `Letra ${char}`);

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          sound.playKeyTick();
          if (this.onKeyClick) {
            this.onKeyClick(char);
          }
        });

        const norm = normalizeChar(char);
        if (!this.keyButtons.has(norm)) {
          this.keyButtons.set(norm, new Set());
        }
        this.keyButtons.get(norm).add(btn);

        rowDiv.appendChild(btn);
      });

      this.container.appendChild(rowDiv);
    });
  }

  updateState(guessedLetters, normalizedWord, isGameOver) {
    this.keyButtons.forEach((btnSet, normChar) => {
      const isGuessed = guessedLetters.has(normChar);
      const isHit = normalizedWord.includes(normChar);

      btnSet.forEach(btn => {
        if (isGuessed) {
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
          if (isHit) {
            btn.classList.add('key-hit');
            btn.classList.remove('key-miss');
          } else {
            btn.classList.add('key-miss');
            btn.classList.remove('key-hit');
          }
        } else {
          btn.disabled = isGameOver;
          btn.setAttribute('aria-disabled', isGameOver ? 'true' : 'false');
          btn.classList.remove('key-hit', 'key-miss');
        }
      });
    });
  }

  attachPhysicalKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Ignora atalhos de sistema ou foco em campos de formulário
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const norm = normalizeChar(e.key);
      if (norm && norm.length === 1 && /[A-Z]/.test(norm)) {
        sound.playKeyTick();
        if (this.onKeyClick) {
          this.onKeyClick(norm);
        }
      }
    });
  }

  reset() {
    this.keyButtons.forEach(btnSet => {
      btnSet.forEach(btn => {
        btn.disabled = false;
        btn.setAttribute('aria-disabled', 'false');
        btn.classList.remove('key-hit', 'key-miss');
      });
    });
  }
}
