/**
 * ForcaMaster - Game Engine
 * Mecânica central de regras de negócio da forca com suporte transparente a
 * palavras com acentos, cedilhas, hífens, apóstrofos e caracteres especiais.
 */

import { removeAccents, normalizeChar } from './words.js';
import { sound } from './audio.js';

export const MAX_ERRORS = 6;

export class GameEngine {
  constructor() {
    this.state = {
      originalWord: '',
      normalizedWord: '',
      category: '',
      hint: '',
      mode: 'solo', // 'solo' | 'challenge' | 'ai' | 'pvp'
      difficulty: 'medio',
      guessedLetters: new Set(),
      wrongGuesses: 0,
      status: 'idle', // 'idle' | 'playing' | 'won' | 'lost'
      startTime: null,
      endTime: null,
      score: 0
    };

    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  getState() {
    return {
      ...this.state,
      guessedLetters: new Set(this.state.guessedLetters),
      isGameOver: this.state.status === 'won' || this.state.status === 'lost'
    };
  }

  start({ word, category = 'Geral', hint = '', mode = 'solo', difficulty = 'medio' }) {
    const cleanWord = word.trim().toUpperCase();
    this.state = {
      originalWord: cleanWord,
      normalizedWord: removeAccents(cleanWord),
      category: category,
      hint: hint,
      mode: mode,
      difficulty: difficulty,
      guessedLetters: new Set(),
      wrongGuesses: 0,
      status: 'playing',
      startTime: Date.now(),
      endTime: null,
      score: 0
    };

    this.notify();
  }

  guess(rawChar) {
    if (this.state.status !== 'playing') return null;

    const char = normalizeChar(rawChar);
    if (!char || char.length !== 1 || !/[A-Z]/.test(char)) {
      return null;
    }

    // Se já foi tentada anteriormente, ignora
    if (this.state.guessedLetters.has(char)) {
      return null;
    }

    this.state.guessedLetters.add(char);

    const isHit = this.state.normalizedWord.includes(char);

    if (isHit) {
      sound.playCorrect();
      const allFound = this.checkAllLettersFound();
      if (allFound) {
        this.finishGame(true);
        return { isHit: true, isWin: true, isLoss: false, char };
      }
      this.notify();
      return { isHit: true, isWin: false, isLoss: false, char };
    } else {
      this.state.wrongGuesses++;
      sound.playWrong();

      if (this.state.wrongGuesses >= MAX_ERRORS) {
        this.finishGame(false);
        return { isHit: false, isWin: false, isLoss: true, char };
      }
      this.notify();
      return { isHit: false, isWin: false, isLoss: false, char };
    }
  }

  /**
   * Avalia se todas as letras alfabéticas da palavra foram encontradas.
   * Caracteres especiais (espaço, hífen, apóstrofo, pontuação) são desconsiderados na verificação.
   */
  checkAllLettersFound() {
    const orig = this.state.originalWord;
    for (let i = 0; i < orig.length; i++) {
      const origChar = orig[i];
      const normChar = normalizeChar(origChar);

      // Se for uma letra alfabética A-Z
      if (/[A-Z]/.test(normChar)) {
        if (!this.state.guessedLetters.has(normChar)) {
          return false;
        }
      }
    }
    return true;
  }

  finishGame(isWin) {
    this.state.status = isWin ? 'won' : 'lost';
    this.state.endTime = Date.now();
    this.state.score = this.calculateScore(isWin);

    if (isWin) {
      sound.playWin();
    } else {
      sound.playLose();
    }

    this.notify();
  }

  calculateScore(isWin) {
    if (!isWin) return 0;
    const basePoints = {
      facil: 100,
      medio: 250,
      dificil: 500
    }[this.state.difficulty] || 150;

    const timeSeconds = Math.max(1, Math.floor((this.state.endTime - this.state.startTime) / 1000));
    const timeBonus = Math.max(0, 120 - timeSeconds) * 2;
    const errorPenalty = this.state.wrongGuesses * 25;

    return Math.max(50, basePoints + timeBonus - errorPenalty);
  }

  /**
   * Retorna os slots estruturados agrupados por palavras para permitir
   * quebra de linha harmoniosa (word-wrap) sem quebrar palavras no meio em telas pequenas.
   */
  getDisplayWords() {
    const orig = this.state.originalWord;
    const words = orig.split(' ');

    return words.map(wordText => {
      const slots = [];
      for (let i = 0; i < wordText.length; i++) {
        const char = wordText[i];
        const normChar = normalizeChar(char);
        const isLetter = /[A-Z]/.test(normChar);

        if (!isLetter) {
          // Hífen, apóstrofo, pontuação são mostrados diretamente
          slots.push({
            char: char,
            revealed: true,
            isSpecial: true
          });
        } else {
          const isRevealed = this.state.status === 'lost' || this.state.guessedLetters.has(normChar);
          slots.push({
            char: char,
            revealed: isRevealed,
            wasMissed: this.state.status === 'lost' && !this.state.guessedLetters.has(normChar),
            isSpecial: false
          });
        }
      }
      return slots;
    });
  }
}

export const game = new GameEngine();
