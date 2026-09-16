/**
 * ForcaMaster Pro - Main Application Controller (ES6 Module)
 * Orquestrador central: gerencia o ciclo de vida, eventos de UI, modais, integração com IA e PWA.
 */

import { sound } from './audio.js';
import { themeManager } from './themeManager.js';
import { getRandomWord, getCategories, normalizeChar } from './words.js';
import { game, MAX_ERRORS } from './gameEngine.js';
import { VirtualKeyboard } from './keyboard.js';
import { statsManager } from './statsManager.js';
import { shareManager } from './shareManager.js';
import { aiService } from './aiService.js';

class AppController {
  constructor() {
    this.dom = {};
    this.keyboard = null;
    this.filterDifficulty = 'medio';
    this.filterCategory = 'todas';
    this.isHintVisible = false;
  }

  init() {
    this.cacheDomElements();
    this.initPWA();
    themeManager.init();
    this.initVirtualKeyboard();
    this.populateCategorySelect();
    this.bindEvents();
    this.setupGameSubscription();

    // Checa se o usuário abriu um link de desafio via Hash (#challenge=...)
    const remoteChallenge = shareManager.detectChallengeFromUrl();
    if (remoteChallenge) {
      this.startRemoteChallenge(remoteChallenge);
    } else {
      this.startNewGame();
    }
  }

  cacheDomElements() {
    this.dom = {
      btnAudioToggle: document.getElementById('btn-audio-toggle'),
      btnThemeToggle: document.getElementById('btn-theme-toggle'),
      btnChallengeToggle: document.getElementById('btn-challenge-toggle'),
      btnAiToggle: document.getElementById('btn-ai-toggle'),
      btnStatsToggle: document.getElementById('btn-stats-toggle'),
      badgeCategory: document.getElementById('badge-category'),
      badgeDifficulty: document.getElementById('badge-difficulty'),
      badgeMode: document.getElementById('badge-mode'),
      btnToggleHint: document.getElementById('btn-toggle-hint'),
      hintBtnText: document.getElementById('hint-btn-text'),
      hintBanner: document.getElementById('hint-banner'),
      hintText: document.getElementById('hint-text'),
      wordSlots: document.getElementById('word-slots'),
      heartsDisplay: document.getElementById('hearts-display'),
      hangmanGraphic: document.getElementById('hangman-graphic'),
      btnNewWord: document.getElementById('btn-new-word'),
      btnOpenCustomWord: document.getElementById('btn-open-custom-word'),
      btnChooseCategory: document.getElementById('btn-choose-category'),
      keyboardContainer: document.getElementById('virtual-keyboard'),

      // Modais
      modalEndgame: document.getElementById('modal-endgame'),
      endgameTitle: document.getElementById('endgame-title'),
      endgameSubtitle: document.getElementById('endgame-subtitle'),
      endgameWordReveal: document.getElementById('endgame-word-reveal'),
      endgameScore: document.getElementById('endgame-score'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnCloseEndgame: document.getElementById('btn-close-endgame'),

      modalStats: document.getElementById('modal-stats'),
      inputProfileName: document.getElementById('input-profile-name'),
      statTotalGames: document.getElementById('stat-total-games'),
      statWinRate: document.getElementById('stat-win-rate'),
      statCurrentStreak: document.getElementById('stat-current-streak'),
      statBestStreak: document.getElementById('stat-best-streak'),
      btnExportStats: document.getElementById('btn-export-stats'),
      btnImportStats: document.getElementById('btn-import-stats'),
      fileImportStats: document.getElementById('file-import-stats'),

      modalChallenge: document.getElementById('modal-challenge'),
      challengeWordInput: document.getElementById('challenge-word-input'),
      challengeCategoryInput: document.getElementById('challenge-category-input'),
      challengeHintInput: document.getElementById('challenge-hint-input'),
      btnPlayCustomLocal: document.getElementById('btn-play-custom-local'),
      btnGenerateChallengeLink: document.getElementById('btn-generate-challenge-link'),
      challengeOutputBox: document.getElementById('challenge-output-box'),
      challengeUrlResult: document.getElementById('challenge-url-result'),
      btnCopyChallengeUrl: document.getElementById('btn-copy-challenge-url'),
      challengeQrCanvas: document.getElementById('challenge-qr-canvas'),

      modalAi: document.getElementById('modal-ai'),
      aiThemeInput: document.getElementById('ai-theme-input'),
      aiDifficultySelect: document.getElementById('ai-difficulty-select'),
      aiApiKeyInput: document.getElementById('ai-api-key-input'),
      aiStatusMessage: document.getElementById('ai-status-message'),
      btnGenerateAiWord: document.getElementById('btn-generate-ai-word'),

      modalCategory: document.getElementById('modal-category'),
      selectGameDifficulty: document.getElementById('select-game-difficulty'),
      selectGameCategory: document.getElementById('select-game-category'),
      btnApplyCategoryFilter: document.getElementById('btn-apply-category-filter'),

      // Partes SVG da Forca
      hangmanParts: [
        document.getElementById('part-head'),
        document.getElementById('part-body'),
        document.getElementById('part-left-arm'),
        document.getElementById('part-right-arm'),
        document.getElementById('part-left-leg'),
        document.getElementById('part-right-leg')
      ]
    };
  }

  initVirtualKeyboard() {
    this.keyboard = new VirtualKeyboard(this.dom.keyboardContainer, (char) => {
      game.guess(char);
    });
  }

  populateCategorySelect() {
    const categories = getCategories();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      this.dom.selectGameCategory.appendChild(opt);
    });
  }

  setupGameSubscription() {
    game.subscribe((state) => {
      this.renderGameState(state);
    });
  }

  renderGameState(state) {
    // 1. Renderiza os slots de letras agrupados por palavra para evitar quebra no meio da palavra
    const wordGroups = game.getDisplayWords();
    this.dom.wordSlots.innerHTML = '';

    wordGroups.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'word-group';

      group.forEach(slot => {
        const div = document.createElement('div');
        if (slot.isSpecial) {
          div.className = 'slot special';
          div.textContent = slot.char;
        } else {
          div.className = `slot ${slot.revealed ? 'revealed' : ''} ${slot.wasMissed ? 'missed' : ''}`;
          div.textContent = slot.revealed ? slot.char : '';
        }
        groupDiv.appendChild(div);
      });

      this.dom.wordSlots.appendChild(groupDiv);
    });

    // 2. Atualiza Vidas / Corações
    const remainingLives = MAX_ERRORS - state.wrongGuesses;
    let heartsStr = '';
    for (let i = 0; i < MAX_ERRORS; i++) {
      heartsStr += i < remainingLives ? '❤️' : '🖤';
    }
    this.dom.heartsDisplay.textContent = heartsStr;

    // 3. Atualiza partes da Forca no SVG
    this.dom.hangmanParts.forEach((part, index) => {
      if (index < state.wrongGuesses) {
        part.style.opacity = '1';
      } else {
        part.style.opacity = '0';
      }
    });

    this.dom.hangmanGraphic.setAttribute('aria-label', `Ilustração da Forca: ${state.wrongGuesses} de ${MAX_ERRORS} erros.`);

    // 4. Atualiza Teclado Virtual
    this.keyboard.updateState(state.guessedLetters, state.normalizedWord, state.isGameOver);

    // 5. Atualiza Metadados de Topo
    this.dom.badgeCategory.textContent = `Categoria: ${state.category}`;
    this.dom.badgeDifficulty.textContent = state.difficulty.toUpperCase();
    
    let modeText = 'Solo';
    if (state.mode === 'challenge') modeText = 'Desafio Amigo';
    else if (state.mode === 'pvp') modeText = '2 Jogadores (Local)';
    else if (state.mode === 'ai') modeText = 'IA Gemini';

    this.dom.badgeMode.textContent = `Modo: ${modeText}`;
    this.dom.hintText.textContent = state.hint || 'Nenhuma dica cadastrada para esta palavra.';

    // 6. Tratamento de Fim de Jogo
    if (state.isGameOver) {
      statsManager.recordGame({
        isWin: state.status === 'won',
        word: state.originalWord,
        category: state.category,
        score: state.score,
        errors: state.wrongGuesses
      });

      setTimeout(() => {
        this.showEndGameModal(state);
      }, 500);
    }
  }

  showEndGameModal(state) {
    const isWin = state.status === 'won';
    this.dom.endgameTitle.textContent = isWin ? '🎉 Vitória Espetacular!' : '😢 Que Pena, Você Perdeu!';
    this.dom.endgameSubtitle.textContent = isWin
      ? 'Você decifrou o enigma com raciocínio impecável.'
      : 'As tentativas se esgotaram, mas a próxima partida é sua chance de revanche!';
    this.dom.endgameWordReveal.textContent = state.originalWord;
    this.dom.endgameScore.textContent = `${state.score} pts`;

    this.openModal(this.dom.modalEndgame);
  }

  startNewGame() {
    this.hideHint();
    const item = getRandomWord(this.filterDifficulty, this.filterCategory);
    game.start({
      word: item.word,
      category: item.category,
      hint: item.hint,
      difficulty: item.difficulty,
      mode: 'solo'
    });
  }

  startRemoteChallenge(challenge) {
    this.hideHint();
    shareManager.clearHash();
    game.start({
      word: challenge.word,
      category: challenge.category,
      hint: challenge.hint,
      difficulty: 'medio',
      mode: 'challenge'
    });
  }

  hideHint() {
    this.isHintVisible = false;
    this.dom.hintBanner.classList.remove('show');
    this.dom.hintBtnText.textContent = 'Ver Dica';
  }

  toggleHint() {
    this.isHintVisible = !this.isHintVisible;
    if (this.isHintVisible) {
      sound.playHint();
      this.dom.hintBanner.classList.add('show');
      this.dom.hintBtnText.textContent = 'Ocultar Dica';
    } else {
      this.dom.hintBanner.classList.remove('show');
      this.dom.hintBtnText.textContent = 'Ver Dica';
    }
  }

  bindEvents() {
    // Alternar Som
    this.dom.btnAudioToggle.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.dom.btnAudioToggle.textContent = isMuted ? '🔇' : '🔊';
      if (!isMuted) sound.playCorrect();
    });
    this.dom.btnAudioToggle.textContent = sound.isMuted() ? '🔇' : '🔊';

    // Alternar Tema Visual
    this.dom.btnThemeToggle.addEventListener('click', () => {
      themeManager.cycleNext();
      sound.playKeyTick();
    });

    // Dica
    this.dom.btnToggleHint.addEventListener('click', () => this.toggleHint());

    // Nova Palavra
    this.dom.btnNewWord.addEventListener('click', () => {
      sound.playKeyTick();
      this.startNewGame();
    });

    // Abrir Modal de Palavra Própria / Desafio
    const openCustomWordModal = () => {
      this.dom.challengeOutputBox.style.display = 'none';
      this.dom.challengeWordInput.value = '';
      this.dom.challengeCategoryInput.value = '';
      this.dom.challengeHintInput.value = '';
      this.openModal(this.dom.modalChallenge);
    };

    this.dom.btnOpenCustomWord.addEventListener('click', openCustomWordModal);
    this.dom.btnChallengeToggle.addEventListener('click', openCustomWordModal);

    // Jogar Palavra Personalizada Localmente (Modo 2 Jogadores)
    this.dom.btnPlayCustomLocal.addEventListener('click', () => {
      const word = this.dom.challengeWordInput.value.trim();
      if (!this.isValidWordInput(word)) {
        alert('Digite uma palavra válida com pelo menos 2 letras (acentos e hífens são aceitos!).');
        return;
      }
      const category = this.dom.challengeCategoryInput.value.trim() || 'Personalizada';
      const hint = this.dom.challengeHintInput.value.trim();

      this.closeModal(this.dom.modalChallenge);
      this.hideHint();
      game.start({
        word: word.toUpperCase(),
        category: category,
        hint: hint,
        difficulty: 'medio',
        mode: 'pvp'
      });
      sound.playCorrect();
    });

    // Gerar Link de Desafio com Amigo e QR Code
    this.dom.btnGenerateChallengeLink.addEventListener('click', () => {
      const word = this.dom.challengeWordInput.value.trim();
      if (!this.isValidWordInput(word)) {
        alert('Digite uma palavra válida com pelo menos 2 letras.');
        return;
      }
      const category = this.dom.challengeCategoryInput.value.trim() || 'Desafio Amigo';
      const hint = this.dom.challengeHintInput.value.trim();
      const author = statsManager.getPlayerName();

      const challengeUrl = shareManager.createChallengeUrl({ word, category, hint, author });
      this.dom.challengeUrlResult.value = challengeUrl;
      shareManager.renderQRCode(this.dom.challengeQrCanvas, challengeUrl);
      this.dom.challengeOutputBox.style.display = 'block';
      sound.playCorrect();
    });

    this.dom.btnCopyChallengeUrl.addEventListener('click', async () => {
      const success = await shareManager.copyToClipboard(this.dom.challengeUrlResult.value);
      if (success) {
        sound.playCorrect();
        this.dom.btnCopyChallengeUrl.textContent = 'Copiado! ✓';
        setTimeout(() => {
          this.dom.btnCopyChallengeUrl.textContent = 'Copiar';
        }, 2000);
      }
    });

    // Modal Categorias
    this.dom.btnChooseCategory.addEventListener('click', () => {
      sound.playKeyTick();
      this.openModal(this.dom.modalCategory);
    });

    this.dom.btnApplyCategoryFilter.addEventListener('click', () => {
      this.filterDifficulty = this.dom.selectGameDifficulty.value;
      this.filterCategory = this.dom.selectGameCategory.value;
      this.closeModal(this.dom.modalCategory);
      this.startNewGame();
    });

    // Modal Estatísticas
    this.dom.btnStatsToggle.addEventListener('click', () => {
      this.populateStatsModal();
      this.openModal(this.dom.modalStats);
    });

    this.dom.inputProfileName.addEventListener('change', (e) => {
      statsManager.setPlayerName(e.target.value);
    });

    this.dom.btnExportStats.addEventListener('click', () => {
      statsManager.exportData();
    });

    this.dom.btnImportStats.addEventListener('click', () => {
      this.dom.fileImportStats.click();
    });

    this.dom.fileImportStats.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = statsManager.importData(event.target.result);
        if (res.success) {
          alert('Estatísticas restauradas com sucesso!');
          this.populateStatsModal();
        } else {
          alert(res.error);
        }
      };
      reader.readAsText(file);
    });

    // Modal Gemini IA
    this.dom.btnAiToggle.addEventListener('click', () => {
      this.dom.aiApiKeyInput.value = aiService.getApiKey();
      this.dom.aiStatusMessage.textContent = '';
      this.openModal(this.dom.modalAi);
    });

    this.dom.btnGenerateAiWord.addEventListener('click', async () => {
      const theme = this.dom.aiThemeInput.value.trim();
      if (!theme) {
        this.dom.aiStatusMessage.textContent = 'Por favor, informe o tema desejado.';
        return;
      }

      const key = this.dom.aiApiKeyInput.value.trim();
      if (key) {
        aiService.setApiKey(key);
      }

      if (!aiService.hasApiKey()) {
        this.dom.aiStatusMessage.textContent = 'Insira uma API Key válida do Google Gemini.';
        return;
      }

      const difficulty = this.dom.aiDifficultySelect.value;
      this.dom.aiStatusMessage.textContent = 'Conectando ao Gemini e sintetizando enigma... ⏳';
      this.dom.btnGenerateAiWord.disabled = true;

      try {
        const result = await aiService.generateWordChallenge(theme, difficulty);
        this.closeModal(this.dom.modalAi);
        this.hideHint();
        game.start({
          word: result.word,
          category: result.category,
          hint: result.hint,
          difficulty: result.difficulty,
          mode: 'ai'
        });
      } catch (err) {
        this.dom.aiStatusMessage.textContent = `Erro: ${err.message}`;
      } finally {
        this.dom.btnGenerateAiWord.disabled = false;
      }
    });

    // Botões de Fechamento de Modais
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        this.closeModal(document.getElementById(modalId));
      });
    });

    this.dom.btnCloseEndgame.addEventListener('click', () => this.closeModal(this.dom.modalEndgame));
    this.dom.btnPlayAgain.addEventListener('click', () => {
      this.closeModal(this.dom.modalEndgame);
      this.startNewGame();
    });

    // Fecha modal clicando no backdrop
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Tecla Escape fecha modais ativos
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
          this.closeModal(modal);
        });
      }
    });
  }

  isValidWordInput(str) {
    if (!str || str.trim().length < 2) return false;
    // Precisa ter pelo menos uma letra alfabética (com ou sem acento)
    const hasLetters = /[a-zA-ZÀ-ÿ]/.test(str);
    return hasLetters;
  }

  populateStatsModal() {
    const summary = statsManager.getSummary();
    this.dom.inputProfileName.value = summary.name;
    this.dom.statTotalGames.textContent = summary.totalGames;
    this.dom.statWinRate.textContent = summary.winRate;
    this.dom.statCurrentStreak.textContent = summary.currentStreak;
    this.dom.statBestStreak.textContent = summary.bestStreak;
  }

  openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.add('active');
  }

  closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('active');
  }

  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then((reg) => console.log('[ForcaMaster] Service Worker registrado:', reg.scope))
          .catch((err) => console.warn('[ForcaMaster] Falha ao registrar Service Worker:', err));
      });
    }
  }
}

// Inicialização da aplicação ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
