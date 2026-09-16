/**
 * ForcaMaster Pro - Main Application Controller (ES6 Module)
 * Orquestrador central: gerencia o ciclo de vida, eventos de UI, modais, Google Auth,
 * salas multiplayer em tempo real, integração com IA e PWA.
 */

import { sound } from './audio.js';
import { themeManager } from './themeManager.js';
import { getRandomWord, getCategories, normalizeChar } from './words.js';
import { game, MAX_ERRORS } from './gameEngine.js';
import { VirtualKeyboard } from './keyboard.js';
import { statsManager } from './statsManager.js';
import { shareManager } from './shareManager.js';
import { aiService } from './aiService.js';
import { authManager } from './authManager.js';
import { roomManager } from './roomManager.js';
import { firebaseService } from './firebaseConfig.js';

class AppController {
  constructor() {
    this.dom = {};
    this.keyboard = null;
    this.filterDifficulty = 'medio';
    this.filterCategory = 'todas';
    this.isHintVisible = false;
    this.isInMultiplayerMatch = false;
  }

  async init() {
    this.cacheDomElements();
    this.initPWA();
    themeManager.init();
    this.initVirtualKeyboard();
    this.populateCategorySelects();
    this.bindEvents();
    this.setupGameSubscription();
    this.setupAuthSubscription();
    this.setupRoomSubscription();

    // Inicializa Firebase em background
    authManager.init().catch(err => console.warn('Init auth em background:', err));

    // Checa se o usuário abriu um link de sala multiplayer (#room=PIN)
    const roomPinFromHash = this.detectRoomPinFromHash();
    if (roomPinFromHash) {
      this.handleIncomingRoomPin(roomPinFromHash);
      return;
    }

    // Checa se o usuário abriu um link de desafio assíncrono (#challenge=...)
    const remoteChallenge = shareManager.detectChallengeFromUrl();
    if (remoteChallenge) {
      this.startRemoteChallenge(remoteChallenge);
    } else {
      this.startNewGame();
    }
  }

  cacheDomElements() {
    this.dom = {
      appHeader: document.getElementById('app-header'),
      btnMenuToggle: document.getElementById('btn-menu-toggle'),
      menuToggleIcon: document.getElementById('menu-toggle-icon'),
      navMenu: document.getElementById('nav-menu'),
      btnAudioToggle: document.getElementById('btn-audio-toggle'),
      btnThemeToggle: document.getElementById('btn-theme-toggle'),
      btnRoomToggle: document.getElementById('btn-room-toggle'),
      btnAuthToggle: document.getElementById('btn-auth-toggle'),
      authBtnIcon: document.getElementById('auth-btn-icon'),
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
      btnOpenRooms: document.getElementById('btn-open-rooms'),
      btnOpenCustomWord: document.getElementById('btn-open-custom-word'),
      btnChooseCategory: document.getElementById('btn-choose-category'),
      keyboardContainer: document.getElementById('virtual-keyboard'),

      // Barra Multiplayer
      multiplayerBar: document.getElementById('multiplayer-bar'),
      mpRoomPin: document.getElementById('mp-room-pin'),
      mpPlayersChips: document.getElementById('mp-players-chips'),
      btnLeaveRoom: document.getElementById('btn-leave-room'),

      // Modais
      modalEndgame: document.getElementById('modal-endgame'),
      endgameTitle: document.getElementById('endgame-title'),
      endgameSubtitle: document.getElementById('endgame-subtitle'),
      endgameWordReveal: document.getElementById('endgame-word-reveal'),
      endgameScore: document.getElementById('endgame-score'),
      multiplayerPodium: document.getElementById('multiplayer-podium'),
      podiumList: document.getElementById('podium-list'),
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

      // Modal Auth
      modalAuth: document.getElementById('modal-auth'),
      authLoggedOutState: document.getElementById('auth-logged-out-state'),
      authLoggedInState: document.getElementById('auth-logged-in-state'),
      cloudStatusIndicator: document.getElementById('cloud-status-indicator'),
      cloudStatusText: document.getElementById('cloud-status-text'),
      btnGoogleSignin: document.getElementById('btn-google-signin'),
      btnGoogleSignout: document.getElementById('btn-google-signout'),
      userProfileAvatar: document.getElementById('user-profile-avatar'),
      userProfileName: document.getElementById('user-profile-name'),
      userProfileEmail: document.getElementById('user-profile-email'),
      inputFirebaseConfigJson: document.getElementById('input-firebase-config-json'),
      btnSaveCustomFirebase: document.getElementById('btn-save-custom-firebase'),

      // Modal Rooms
      modalRooms: document.getElementById('modal-rooms'),
      roomsTabsView: document.getElementById('rooms-tabs-view'),
      roomLobbyView: document.getElementById('room-lobby-view'),
      tabBtnCreateRoom: document.getElementById('tab-btn-create-room'),
      tabBtnJoinRoom: document.getElementById('tab-btn-join-room'),
      tabPanelCreateRoom: document.getElementById('tab-panel-create-room'),
      tabPanelJoinRoom: document.getElementById('tab-panel-join-room'),
      roomCategorySelect: document.getElementById('room-category-select'),
      roomDifficultySelect: document.getElementById('room-difficulty-select'),
      roomCustomWordInput: document.getElementById('room-custom-word-input'),
      btnSubmitCreateRoom: document.getElementById('btn-submit-create-room'),
      roomPinInput: document.getElementById('room-pin-input'),
      roomJoinNickname: document.getElementById('room-join-nickname'),
      btnSubmitJoinRoom: document.getElementById('btn-submit-join-room'),
      lobbyPinNumber: document.getElementById('lobby-pin-number'),
      btnCopyLobbyLink: document.getElementById('btn-copy-lobby-link'),
      lobbyQrCanvas: document.getElementById('lobby-qr-canvas'),
      lobbyPlayersCount: document.getElementById('lobby-players-count'),
      lobbyPlayersList: document.getElementById('lobby-players-list'),
      btnHostStartMatch: document.getElementById('btn-host-start-match'),
      guestWaitingText: document.getElementById('guest-waiting-text'),

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
      this.handleGuessAction(char);
    });
  }

  handleGuessAction(char) {
    if (this.isInMultiplayerMatch && roomManager.getCurrentRoom()) {
      roomManager.guessLetter(roomManager.getCurrentRoom().pin, char);
    } else {
      game.guess(char);
    }
  }

  populateCategorySelects() {
    const categories = getCategories();
    [this.dom.selectGameCategory, this.dom.roomCategorySelect].forEach(select => {
      if (!select) return;
      select.innerHTML = '';
      const defaultOpt = document.createElement('option');
      defaultOpt.value = 'todas';
      defaultOpt.textContent = 'Todas as Categorias';
      select.appendChild(defaultOpt);

      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
      });
    });
  }

  setupAuthSubscription() {
    authManager.onAuthChange((user) => {
      const isLoggedIn = authManager.isLoggedIn();
      if (isLoggedIn && user.photoURL) {
        this.dom.authBtnIcon.innerHTML = `<img src="${user.photoURL}" class="user-nav-avatar" alt="${user.displayName}">`;
      } else {
        this.dom.authBtnIcon.textContent = isLoggedIn ? '👤' : 'G';
      }

      if (isLoggedIn) {
        this.dom.authLoggedOutState.style.display = 'none';
        this.dom.authLoggedInState.style.display = 'block';
        this.dom.userProfileAvatar.src = user.photoURL || 'assets/icons/icon-192x192.png';
        this.dom.userProfileName.textContent = user.displayName;
        this.dom.userProfileEmail.textContent = user.email || 'Conta Google';
      } else {
        this.dom.authLoggedOutState.style.display = 'block';
        this.dom.authLoggedInState.style.display = 'none';
      }
    });

    firebaseService.onStatusChange((status) => {
      if (status.isOnline) {
        this.dom.cloudStatusText.textContent = status.isReady ? '🟢 Conectado aos Serviços' : '🟡 Pronto para Conectar';
      } else {
        this.dom.cloudStatusText.textContent = '⚡ Modo Offline';
      }
    });
  }

  setupRoomSubscription() {
    roomManager.onRoomChange((room) => {
      if (!room) {
        this.isInMultiplayerMatch = false;
        this.dom.multiplayerBar.style.display = 'none';
        return;
      }

      // Se a sala estiver na fase de Lobby
      if (room.status === 'waiting') {
        this.renderLobby(room);
      } else if (room.status === 'playing') {
        this.isInMultiplayerMatch = true;
        this.closeModal(this.dom.modalRooms);
        this.renderMultiplayerMatch(room);
      } else if (room.status === 'round_end') {
        this.isInMultiplayerMatch = true;
        this.renderMultiplayerMatch(room);
        setTimeout(() => this.showMultiplayerEndgame(room), 600);
      }
    });
  }

  renderLobby(room) {
    this.dom.roomsTabsView.style.display = 'none';
    this.dom.roomLobbyView.style.display = 'block';
    this.dom.lobbyPinNumber.textContent = room.pin;

    const playersArray = Object.values(room.players || {});
    this.dom.lobbyPlayersCount.textContent = playersArray.length;
    this.dom.lobbyPlayersList.innerHTML = '';

    playersArray.forEach(p => {
      const chip = document.createElement('div');
      chip.className = 'lobby-player-chip';
      chip.innerHTML = `<span>${p.avatar.startsWith('http') ? '🖼️' : p.avatar}</span> <strong>${p.name}</strong> ${p.isHost ? '(Host)' : ''}`;
      this.dom.lobbyPlayersList.appendChild(chip);
    });

    const isHost = roomManager.isHost();
    if (isHost) {
      this.dom.btnHostStartMatch.style.display = 'block';
      this.dom.guestWaitingText.style.display = 'none';
    } else {
      this.dom.btnHostStartMatch.style.display = 'none';
      this.dom.guestWaitingText.style.display = 'block';
    }

    const roomUrl = `${window.location.origin}${window.location.pathname}#room=${room.pin}`;
    shareManager.renderQRCode(this.dom.lobbyQrCanvas, roomUrl);
  }

  renderMultiplayerMatch(room) {
    this.dom.multiplayerBar.style.display = 'flex';
    this.dom.mpRoomPin.textContent = room.pin;

    // Chips de jogadores e placar ao vivo
    this.dom.mpPlayersChips.innerHTML = '';
    const currentUserId = authManager.getUser().uid;
    const playersArray = Object.entries(room.players || {});

    playersArray.forEach(([uid, p]) => {
      const chip = document.createElement('div');
      chip.className = `player-chip ${uid === currentUserId ? 'is-me' : ''}`;
      chip.innerHTML = `<span>${p.name}</span>: <strong>${p.score} pts</strong>`;
      this.dom.mpPlayersChips.appendChild(chip);
    });

    // Renderiza slots da palavra da sala
    this.renderWordSlotsForRoom(room);

    // Vidas e Forca
    const remainingLives = room.maxErrors - room.wrongGuesses;
    let heartsStr = '';
    for (let i = 0; i < room.maxErrors; i++) {
      heartsStr += i < remainingLives ? '❤️' : '🖤';
    }
    this.dom.heartsDisplay.textContent = heartsStr;

    this.dom.hangmanParts.forEach((part, index) => {
      part.style.opacity = index < room.wrongGuesses ? '1' : '0';
    });

    this.dom.hangmanGraphic.setAttribute('aria-label', `Forca Multiplayer: ${room.wrongGuesses} de ${room.maxErrors} erros.`);

    // Teclado virtual
    const isGameOver = room.status === 'round_end';
    this.keyboard.updateState(new Set(room.guessedLetters), room.normalizedWord, isGameOver);

    // Badges
    this.dom.badgeCategory.textContent = `Categoria: ${room.category}`;
    this.dom.badgeDifficulty.textContent = (room.difficulty || 'médio').toUpperCase();
    this.dom.badgeMode.textContent = `Modo: Grupo (PIN ${room.pin})`;
    this.dom.hintText.textContent = room.hint || 'Adivinhem a palavra secreta!';
  }

  renderWordSlotsForRoom(room) {
    const orig = room.word;
    const words = orig.split(' ');
    this.dom.wordSlots.innerHTML = '';

    words.forEach(wordText => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'word-group';

      for (let i = 0; i < wordText.length; i++) {
        const char = wordText[i];
        const norm = normalizeChar(char);
        const isLetter = /[A-Z]/.test(norm);
        const div = document.createElement('div');

        if (!isLetter) {
          div.className = 'slot special';
          div.textContent = char;
        } else {
          const revealed = room.status === 'round_end' || room.guessedLetters.includes(norm);
          const wasMissed = room.status === 'round_end' && !room.guessedLetters.includes(norm);
          div.className = `slot ${revealed ? 'revealed' : ''} ${wasMissed ? 'missed' : ''}`;
          div.textContent = revealed ? char : '';
        }
        groupDiv.appendChild(div);
      }

      this.dom.wordSlots.appendChild(groupDiv);
    });
  }

  showMultiplayerEndgame(room) {
    this.dom.multiplayerPodium.style.display = 'block';
    this.dom.podiumList.innerHTML = '';

    const playersSorted = Object.values(room.players || {}).sort((a, b) => b.score - a.score);

    playersSorted.forEach((p, idx) => {
      const medals = ['🥇', '🥈', '🥉'];
      const medal = medals[idx] || `#${idx + 1}`;
      const row = document.createElement('div');
      row.className = `podium-row ${idx === 0 ? 'first' : ''}`;
      row.innerHTML = `
        <div><span>${medal}</span> <strong>${p.name}</strong></div>
        <div>${p.score} pts</div>
      `;
      this.dom.podiumList.appendChild(row);
    });

    this.dom.endgameTitle.textContent = '🏁 Fim da Rodada Multiplayer!';
    this.dom.endgameSubtitle.textContent = `A palavra era: ${room.word}. Confira as colocações!`;
    this.dom.endgameWordReveal.textContent = room.word;
    this.dom.endgameScore.textContent = `${room.players[authManager.getUser().uid]?.score || 0} pts`;

    this.openModal(this.dom.modalEndgame);
  }

  detectRoomPinFromHash() {
    const hash = window.location.hash;
    if (hash && hash.includes('room=')) {
      const match = hash.match(/room=(\d{6})/);
      return match ? match[1] : null;
    }
    return null;
  }

  handleIncomingRoomPin(pin) {
    this.openModal(this.dom.modalRooms);
    this.dom.tabBtnJoinRoom.click();
    this.dom.roomPinInput.value = pin;
  }

  setupGameSubscription() {
    game.subscribe((state) => {
      if (!this.isInMultiplayerMatch) {
        this.renderGameState(state);
      }
    });
  }

  renderGameState(state) {
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

    const remainingLives = MAX_ERRORS - state.wrongGuesses;
    let heartsStr = '';
    for (let i = 0; i < MAX_ERRORS; i++) {
      heartsStr += i < remainingLives ? '❤️' : '🖤';
    }
    this.dom.heartsDisplay.textContent = heartsStr;

    this.dom.hangmanParts.forEach((part, index) => {
      part.style.opacity = index < state.wrongGuesses ? '1' : '0';
    });

    this.dom.hangmanGraphic.setAttribute('aria-label', `Ilustração da Forca: ${state.wrongGuesses} de ${MAX_ERRORS} erros.`);

    this.keyboard.updateState(state.guessedLetters, state.normalizedWord, state.isGameOver);

    this.dom.badgeCategory.textContent = `Categoria: ${state.category}`;
    this.dom.badgeDifficulty.textContent = state.difficulty.toUpperCase();
    
    let modeText = 'Solo';
    if (state.mode === 'challenge') modeText = 'Desafio Amigo';
    else if (state.mode === 'pvp') modeText = '2 Jogadores (Local)';
    else if (state.mode === 'ai') modeText = 'IA Gemini';

    this.dom.badgeMode.textContent = `Modo: ${modeText}`;
    this.dom.hintText.textContent = state.hint || 'Nenhuma dica cadastrada para esta palavra.';

    if (state.isGameOver) {
      this.dom.multiplayerPodium.style.display = 'none';
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
    this.isInMultiplayerMatch = false;
    this.dom.multiplayerBar.style.display = 'none';
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
    this.isInMultiplayerMatch = false;
    this.dom.multiplayerBar.style.display = 'none';
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

  toggleMobileMenu() {
    const isOpen = this.dom.navMenu.classList.contains('open');
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
    sound.playKeyTick();
  }

  openMobileMenu() {
    this.dom.navMenu.classList.add('open');
    this.dom.btnMenuToggle.setAttribute('aria-expanded', 'true');
    this.dom.menuToggleIcon.textContent = '✕';
  }

  closeMobileMenu() {
    if (this.dom.navMenu && this.dom.navMenu.classList.contains('open')) {
      this.dom.navMenu.classList.remove('open');
      this.dom.btnMenuToggle.setAttribute('aria-expanded', 'false');
      this.dom.menuToggleIcon.textContent = '☰';
    }
  }

  bindEvents() {
    // Toggle do Menu Mobile
    this.dom.btnMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMobileMenu();
    });

    // Fecha o menu mobile automaticamente ao clicar em qualquer uma de suas opções
    const menuActionButtons = [
      this.dom.btnThemeToggle,
      this.dom.btnRoomToggle,
      this.dom.btnChallengeToggle,
      this.dom.btnAiToggle,
      this.dom.btnStatsToggle
    ];
    menuActionButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      }
    });

    // Fecha o menu mobile ao clicar fora do cabeçalho
    document.addEventListener('click', (e) => {
      if (this.dom.appHeader && !this.dom.appHeader.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

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
      if (this.isInMultiplayerMatch && roomManager.isHost()) {
        roomManager.nextRound(roomManager.getCurrentRoom().pin, {
          category: this.filterCategory,
          difficulty: this.filterDifficulty
        });
      } else {
        this.startNewGame();
      }
    });

    // Modal Google Auth
    this.dom.btnAuthToggle.addEventListener('click', () => {
      this.openModal(this.dom.modalAuth);
    });

    this.dom.btnGoogleSignin.addEventListener('click', async () => {
      try {
        await authManager.loginWithGoogle();
      } catch (err) {
        alert(err.message);
      }
    });

    this.dom.btnGoogleSignout.addEventListener('click', async () => {
      await authManager.logout();
    });

    this.dom.btnSaveCustomFirebase.addEventListener('click', async () => {
      try {
        const jsonText = this.dom.inputFirebaseConfigJson.value.trim();
        if (!jsonText) {
          firebaseService.resetConfig();
          alert('Configuração padrão restaurada.');
          return;
        }
        const parsed = JSON.parse(jsonText);
        await firebaseService.saveConfig(parsed);
        alert('Configuração Firebase salva com sucesso!');
      } catch (err) {
        alert('JSON inválido: ' + err.message);
      }
    });

    // Modal Salas Multiplayer
    const openRoomsModal = () => {
      this.dom.roomsTabsView.style.display = 'block';
      this.dom.roomLobbyView.style.display = 'none';
      this.openModal(this.dom.modalRooms);
    };

    this.dom.btnRoomToggle.addEventListener('click', openRoomsModal);
    this.dom.btnOpenRooms.addEventListener('click', openRoomsModal);

    // Abas do Modal de Salas
    this.dom.tabBtnCreateRoom.addEventListener('click', () => {
      this.dom.tabBtnCreateRoom.classList.add('active');
      this.dom.tabBtnJoinRoom.classList.remove('active');
      this.dom.tabPanelCreateRoom.classList.add('active');
      this.dom.tabPanelJoinRoom.classList.remove('active');
    });

    this.dom.tabBtnJoinRoom.addEventListener('click', () => {
      this.dom.tabBtnJoinRoom.classList.add('active');
      this.dom.tabBtnCreateRoom.classList.remove('active');
      this.dom.tabPanelJoinRoom.classList.add('active');
      this.dom.tabPanelCreateRoom.classList.remove('active');
    });

    // Criar Sala
    this.dom.btnSubmitCreateRoom.addEventListener('click', async () => {
      const category = this.dom.roomCategorySelect.value;
      const difficulty = this.dom.roomDifficultySelect.value;
      const customWord = this.dom.roomCustomWordInput.value.trim();

      try {
        this.dom.btnSubmitCreateRoom.disabled = true;
        this.dom.btnSubmitCreateRoom.textContent = 'Criando Sala... ⏳';
        await roomManager.createRoom({ category, difficulty, customWord });
      } catch (err) {
        alert(err.message);
      } finally {
        this.dom.btnSubmitCreateRoom.disabled = false;
        this.dom.btnSubmitCreateRoom.textContent = 'Gerar Sala e PIN';
      }
    });

    // Entrar na Sala
    this.dom.btnSubmitJoinRoom.addEventListener('click', async () => {
      const pin = this.dom.roomPinInput.value.trim();
      const nick = this.dom.roomJoinNickname.value.trim();

      if (!pin || pin.length !== 6) {
        alert('Digite um PIN de 6 dígitos válido.');
        return;
      }

      try {
        this.dom.btnSubmitJoinRoom.disabled = true;
        this.dom.btnSubmitJoinRoom.textContent = 'Entrando... ⏳';
        await roomManager.joinRoom(pin, nick);
      } catch (err) {
        alert(err.message);
      } finally {
        this.dom.btnSubmitJoinRoom.disabled = false;
        this.dom.btnSubmitJoinRoom.textContent = 'Entrar na Sala';
      }
    });

    // Host Inicia a Partida no Lobby
    this.dom.btnHostStartMatch.addEventListener('click', async () => {
      const currentRoom = roomManager.getCurrentRoom();
      if (currentRoom) {
        await roomManager.startMatch(currentRoom.pin);
      }
    });

    // Copiar Link do Lobby
    this.dom.btnCopyLobbyLink.addEventListener('click', async () => {
      const currentRoom = roomManager.getCurrentRoom();
      if (!currentRoom) return;
      const url = `${window.location.origin}${window.location.pathname}#room=${currentRoom.pin}`;
      const success = await shareManager.copyToClipboard(url);
      if (success) {
        sound.playCorrect();
        this.dom.btnCopyLobbyLink.textContent = 'Copiado! ✓';
        setTimeout(() => {
          this.dom.btnCopyLobbyLink.textContent = 'Copiar Link do Grupo';
        }, 2000);
      }
    });

    // Sair da Sala
    this.dom.btnLeaveRoom.addEventListener('click', () => {
      roomManager.leaveRoom();
      this.startNewGame();
    });

    // Modal Palavra Própria / Desafio
    const openCustomWordModal = () => {
      this.dom.challengeOutputBox.style.display = 'none';
      this.dom.challengeWordInput.value = '';
      this.dom.challengeCategoryInput.value = '';
      this.dom.challengeHintInput.value = '';
      this.openModal(this.dom.modalChallenge);
    };

    this.dom.btnOpenCustomWord.addEventListener('click', openCustomWordModal);
    this.dom.btnChallengeToggle.addEventListener('click', openCustomWordModal);

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

    // Modal Opções / Categorias
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

    // Fechamento de Modais
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        this.closeModal(document.getElementById(modalId));
      });
    });

    this.dom.btnCloseEndgame.addEventListener('click', () => this.closeModal(this.dom.modalEndgame));
    this.dom.btnPlayAgain.addEventListener('click', () => {
      this.closeModal(this.dom.modalEndgame);
      if (this.isInMultiplayerMatch && roomManager.isHost()) {
        roomManager.nextRound(roomManager.getCurrentRoom().pin, {
          category: this.filterCategory,
          difficulty: this.filterDifficulty
        });
      } else {
        this.startNewGame();
      }
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
          this.closeModal(modal);
        });
      }
    });
  }

  isValidWordInput(str) {
    if (!str || str.trim().length < 2) return false;
    return /[a-zA-ZÀ-ÿ]/.test(str);
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

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
