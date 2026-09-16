/**
 * ForcaMaster - Room & Multiplayer Manager (Cloud Firestore Real-Time)
 * Gerencia criação de salas com PIN de 6 dígitos, lobby ao vivo, sincronização de chutes
 * e ranking competitivo em tempo real via onSnapshot (estilo Kahoot/Gartic).
 */

import { firebaseService } from './firebaseConfig.js';
import { authManager } from './authManager.js';
import { removeAccents, normalizeChar, getRandomWord } from './words.js';
import { sound } from './audio.js';

export class RoomManager {
  constructor() {
    this.currentPin = null;
    this.currentRoom = null;
    this.unsubscribe = null;
    this.listeners = [];
  }

  generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  onRoomChange(fn) {
    this.listeners.push(fn);
    if (this.currentRoom) fn(this.currentRoom);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify(room) {
    this.currentRoom = room;
    this.listeners.forEach(fn => fn(room));
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  isHost() {
    if (!this.currentRoom) return false;
    const user = authManager.getUser();
    return this.currentRoom.hostId === user.uid;
  }

  /**
   * Cria uma nova sala multiplayer com PIN de 6 dígitos
   */
  async createRoom({ category = 'Geral', difficulty = 'medio', customWord = '', hint = '' }) {
    await firebaseService.init();
    const db = firebaseService.getDb();
    const user = authManager.getUser();
    const pin = this.generatePin();

    let secretWord = customWord;
    let wordHint = hint;
    let wordCat = category;

    if (!secretWord) {
      const item = getRandomWord(difficulty, category);
      secretWord = item.word;
      wordHint = item.hint;
      wordCat = item.category;
    }

    const cleanWord = secretWord.trim().toUpperCase();

    const initialRoomData = {
      pin: pin,
      hostId: user.uid,
      hostName: user.displayName,
      status: 'waiting', // 'waiting' | 'playing' | 'round_end'
      word: cleanWord,
      normalizedWord: removeAccents(cleanWord),
      category: wordCat,
      hint: wordHint || 'Adivinhe a palavra secreta!',
      difficulty: difficulty,
      guessedLetters: [],
      wrongGuesses: 0,
      maxErrors: 6,
      currentRound: 1,
      createdAt: Date.now(),
      players: {
        [user.uid]: {
          name: user.displayName,
          score: 0,
          avatar: user.photoURL || '👑',
          isHost: true,
          joinedAt: Date.now()
        }
      }
    };

    if (db) {
      const { doc, setDoc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
      const roomRef = doc(db, 'forca_rooms', pin);
      await setDoc(roomRef, initialRoomData);
      this.subscribeToRoom(pin, roomRef, onSnapshot);
    } else {
      // Modo Simulado Local/Offline
      this.simulateLocalRoom(initialRoomData);
    }

    this.currentPin = pin;
    this.notify(initialRoomData);
    sound.playWin();
    return initialRoomData;
  }

  /**
   * Entra em uma sala existente pelo PIN
   */
  async joinRoom(pin, customNick = '') {
    await firebaseService.init();
    const db = firebaseService.getDb();
    const user = authManager.getUser();
    const cleanPin = pin.trim().replace(/\D/g, '');

    const playerName = customNick.trim() || user.displayName;

    if (db) {
      const { doc, getDoc, updateDoc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
      const roomRef = doc(db, 'forca_rooms', cleanPin);
      const snapshot = await getDoc(roomRef);

      if (!snapshot.exists()) {
        throw new Error(`Sala com PIN ${cleanPin} não encontrada.`);
      }

      const roomData = snapshot.data();

      // Adiciona o jogador à lista de participantes
      const updatedPlayers = {
        ...roomData.players,
        [user.uid]: {
          name: playerName,
          score: roomData.players[user.uid]?.score || 0,
          avatar: user.photoURL || '🎮',
          isHost: roomData.hostId === user.uid,
          joinedAt: Date.now()
        }
      };

      await updateDoc(roomRef, { players: updatedPlayers });
      this.subscribeToRoom(cleanPin, roomRef, onSnapshot);
    } else {
      // Simulação local caso offline
      if (this.currentRoom && this.currentRoom.pin === cleanPin) {
        this.currentRoom.players[user.uid] = {
          name: playerName,
          score: 0,
          avatar: '🎮',
          isHost: false,
          joinedAt: Date.now()
        };
        this.notify({ ...this.currentRoom });
      } else {
        throw new Error('Servidor Firebase desconectado. Verifique sua conexão com a internet.');
      }
    }

    this.currentPin = cleanPin;
    sound.playCorrect();
    return this.currentRoom;
  }

  subscribeToRoom(pin, roomRef, onSnapshotFn) {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = onSnapshotFn(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const roomData = docSnap.data();
        this.notify(roomData);
      }
    }, (err) => {
      console.warn('[ForcaMaster] Erro na sincronização da sala:', err);
    });
  }

  simulateLocalRoom(roomData) {
    this.currentRoom = roomData;
    this.notify(roomData);
  }

  /**
   * O Host inicia a partida
   */
  async startMatch(pin) {
    const db = firebaseService.getDb();
    if (db) {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
      const roomRef = doc(db, 'forca_rooms', pin);
      await updateDoc(roomRef, { status: 'playing' });
    } else if (this.currentRoom) {
      this.currentRoom.status = 'playing';
      this.notify({ ...this.currentRoom });
    }
  }

  /**
   * Chute de letra por qualquer jogador na sala em tempo real
   */
  async guessLetter(pin, rawChar) {
    if (!this.currentRoom || this.currentRoom.status !== 'playing') return;

    const char = normalizeChar(rawChar);
    if (!char || this.currentRoom.guessedLetters.includes(char)) return;

    const db = firebaseService.getDb();
    const user = authManager.getUser();

    const isHit = this.currentRoom.normalizedWord.includes(char);
    const newGuessed = [...this.currentRoom.guessedLetters, char];
    const newWrong = isHit ? this.currentRoom.wrongGuesses : this.currentRoom.wrongGuesses + 1;

    // Calcula se todas as letras alfabéticas foram desvendadas
    let isComplete = true;
    for (let i = 0; i < this.currentRoom.normalizedWord.length; i++) {
      const letter = this.currentRoom.normalizedWord[i];
      if (/[A-Z]/.test(letter) && !newGuessed.includes(letter)) {
        isComplete = false;
        break;
      }
    }

    const isGameOver = isComplete || newWrong >= this.currentRoom.maxErrors;
    const pointsGained = isHit ? (isComplete ? 200 : 60) : 0;

    // Atualiza pontuação do jogador
    const currentScore = this.currentRoom.players[user.uid]?.score || 0;
    const updatedPlayers = {
      ...this.currentRoom.players,
      [user.uid]: {
        ...this.currentRoom.players[user.uid],
        score: currentScore + pointsGained
      }
    };

    const updatePayload = {
      guessedLetters: newGuessed,
      wrongGuesses: newWrong,
      status: isGameOver ? 'round_end' : 'playing',
      players: updatedPlayers
    };

    if (db) {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
      const roomRef = doc(db, 'forca_rooms', pin);
      await updateDoc(roomRef, updatePayload);
    } else if (this.currentRoom) {
      this.currentRoom = { ...this.currentRoom, ...updatePayload };
      this.notify(this.currentRoom);
    }

    if (isHit) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  }

  /**
   * Avança para a próxima rodada na sala
   */
  async nextRound(pin, { category, difficulty }) {
    const item = getRandomWord(difficulty, category);
    const cleanWord = item.word.trim().toUpperCase();

    const updatePayload = {
      word: cleanWord,
      normalizedWord: removeAccents(cleanWord),
      category: item.category,
      hint: item.hint,
      guessedLetters: [],
      wrongGuesses: 0,
      status: 'playing',
      currentRound: (this.currentRoom.currentRound || 1) + 1
    };

    const db = firebaseService.getDb();
    if (db) {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
      const roomRef = doc(db, 'forca_rooms', pin);
      await updateDoc(roomRef, updatePayload);
    } else if (this.currentRoom) {
      this.currentRoom = { ...this.currentRoom, ...updatePayload };
      this.notify(this.currentRoom);
    }

    sound.playHint();
  }

  leaveRoom() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.currentPin = null;
    this.currentRoom = null;
    this.notify(null);
  }
}

export const roomManager = new RoomManager();
